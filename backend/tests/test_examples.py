import pytest
from fastapi.testclient import TestClient

import app.knowledge_base as knowledge_base
from app.main import app

client = TestClient(app)

QUERIES = [
    "What is Yakshagana?",
    "Tell me about coastal agriculture and estuaries in Karavali.",
    "What historical destinations are found in Karavali?",
    "Explain the agricultural importance of Mandya and K.R. Sagar irrigation.",
    "Tell me about the history of Mysuru under the Wodeyars.",
    "What crops are grown in Mysuru and surrounding districts?",
    "What is Bidar's fort and its craft heritage?",
    "Tell me about Jowar and dryland agriculture in northern districts.",
    "What are the historical cave temples in Bagalkot?",
    "How is coffee cultivated in Kodagu?",
    "What are the historical places in Shivamogga?",
    "Tell me about Kodava ancestral homes (ainmane) and traditions.",
    "Compare agricultural practices in Old Mysuru and Malenadu.",
    "What are the cultural differences between Karavali and Uttara Karnataka?",
    "Which regions in Karnataka have significant plantation agriculture?",
]

@pytest.mark.parametrize("query", QUERIES)
def test_example_query(query):
    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": query}]})
    assert response.status_code == 200
    data = response.json()
    assert data["grounded"] is True, f"Query failed to ground: {query}"
    assert data["answer"].strip(), f"Query returned an empty answer: {query}"
    assert len(data["sources"]) > 0, f"Query returned no sources: {query}"


def test_wodeyar_history_uses_matching_history_records():
    response = client.post(
        "/api/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "Tell me about the history of Mysuru under the Wodeyars.",
                }
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert "1610" in result["answer"]
    assert "mandya-history-wodeyar-srirangapatna" in {
        source["document_id"] for source in result["sources"]
    }
    assert not any(
        source["document_id"].startswith("chikkaballapura-agriculture")
        for source in result["sources"]
    )


def test_broader_crop_query_keeps_named_district_at_top():
    response = client.post(
        "/api/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "What crops are grown in Mysuru and surrounding districts?",
                }
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["sources"][0]["document_id"] == "mysuru-agriculture-ragi-2022-23"
    assert result["answer"].strip()


def test_region_comparison_retrieves_each_named_region():
    response = client.post(
        "/api/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "Compare agricultural practices in Old Mysuru and Karavali.",
                }
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["grounded"] is True
    assert {
        source["region_id"] for source in result["sources"]
    } == {"old-mysuru", "karavali"}


def test_question_region_overrides_district_page_context():
    response = client.post(
        "/api/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "What is Yakshagana in Karavali?",
                }
            ],
            "context_district": "mysuru",
            "context_region": "old-mysuru",
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["grounded"] is True
    assert {source["region_id"] for source in result["sources"]} == {"karavali"}


def test_missing_current_statistics_are_not_generated(monkeypatch):
    def unexpected_model_request(*args, **kwargs):
        raise AssertionError("A model request was made without current evidence.")

    monkeypatch.setenv("GROQ_API_KEY", "test-key")
    monkeypatch.setenv("GROQ_MODEL", "test-model")
    monkeypatch.setattr(knowledge_base, "urlopen", unexpected_model_request)

    response = client.post(
        "/api/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "What is the current 2026 coffee output in Kodagu?",
                }
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["mode"] == "extractive"
    assert "do not verify the requested date or figure" in result["notice"]
    assert result["sources"][0]["document_id"] == "kodagu-coffee-pepper-paddy"


def test_follow_up_is_limited_to_previously_cited_documents():
    response = client.post(
        "/api/chat",
        json={
            "messages": [
                {"role": "user", "content": "What is Yakshagana?"},
                {
                    "role": "assistant",
                    "content": "Yakshagana is described in the Udupi guide. [1]",
                    "source_ids": ["udupi-yakshagana-tourism-description"],
                },
                {"role": "user", "content": "Which district does the guide describe?"},
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["grounded"] is True
    assert {
        source["document_id"] for source in result["sources"]
    } == {"udupi-yakshagana-tourism-description"}
