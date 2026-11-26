"use client";

import { useEffect, useState } from "react";

type DistrictRecord = {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory: string;
  source_url: string;
  source_title: string;
  source_org: string;
  publication_year: number | string | null;
  reporting_year: string | null;
  uncertainty: string;
};

type DistrictRecordsResponse = {
  records: DistrictRecord[];
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

const groups = [
  {
    id: "agriculture",
    title: "Agriculture & livelihoods",
    description: "Farming, crops, irrigation and other local livelihoods.",
    matches: (record: DistrictRecord) =>
      /agriculture|farming|farm|crop|irrigation|sericulture|horticulture|fisheries/i.test(
        `${record.category} ${record.subcategory}`,
      ),
  },
  {
    id: "culture",
    title: "Culture, food & people",
    description: "Festivals, arts, foodways, language and community traditions.",
    matches: (record: DistrictRecord) =>
      /(^|[^a-z])culture([^a-z]|$)|food|language|community|tradition|festival|music|craft|performing|folk/i.test(
        `${record.category} ${record.subcategory}`,
      ),
  },
  {
    id: "places",
    title: "Important places & history",
    description: "Landmarks, historical records and the district's landscapes.",
    matches: (record: DistrictRecord) =>
      /history|geography|heritage|place|archaeology|temple|fort|monument|landscape/i.test(
        `${record.category} ${record.subcategory} ${record.title}`,
      ),
  },
] as const;

function isDistrictRecord(value: unknown): value is DistrictRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    typeof record.content === "string" &&
    typeof record.category === "string" &&
    typeof record.subcategory === "string" &&
    typeof record.source_url === "string" &&
    typeof record.source_title === "string" &&
    typeof record.source_org === "string" &&
    (typeof record.publication_year === "number" ||
      typeof record.publication_year === "string" ||
      record.publication_year === null) &&
    (typeof record.reporting_year === "string" ||
      record.reporting_year === null) &&
    typeof record.uncertainty === "string"
  );
}

function isDistrictRecordsResponse(
  value: unknown,
): value is DistrictRecordsResponse {
  if (typeof value !== "object" || value === null || !("records" in value)) {
    return false;
  }
  return Array.isArray(value.records) && value.records.every(isDistrictRecord);
}

function formatCategory(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function KnowledgeCard({ record }: { record: DistrictRecord }) {
  return (
    <article className="district-knowledge-card">
      <p className="district-knowledge-category">
        {formatCategory(record.subcategory || record.category)}
      </p>
      <h4>{record.title}</h4>
      <p className="district-knowledge-copy">{record.content}</p>
      {record.uncertainty && (
        <p className="district-knowledge-note">{record.uncertainty}</p>
      )}
      <div className="district-knowledge-source">
        <span>
          {record.source_org}
          {record.reporting_year ? ` · ${record.reporting_year}` : ""}
          {!record.reporting_year && record.publication_year
            ? ` · ${record.publication_year}`
            : ""}
        </span>
        <a href={record.source_url} target="_blank" rel="noopener noreferrer">
          {record.source_title} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

export default function DistrictKnowledge({
  districtId,
  districtName,
}: {
  districtId: string;
  districtName: string;
}) {
  const [records, setRecords] = useState<DistrictRecord[] | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setRecords(null);
    setError("");

    async function loadRecords() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/districts/${encodeURIComponent(districtId)}/records`,
          { signal: controller.signal, cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error(
            `District information could not be loaded (${response.status}).`,
          );
        }

        const payload: unknown = await response.json();
        if (!isDistrictRecordsResponse(payload)) {
          throw new Error("The district information service returned invalid data.");
        }
        setRecords(payload.records);
      } catch (requestError) {
        if (requestError instanceof Error && requestError.name === "AbortError") {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "District information could not be loaded.",
        );
      }
    }

    void loadRecords();
    return () => controller.abort();
  }, [districtId, retry]);

  return (
    <section
      className="district-knowledge-section"
      aria-labelledby="district-knowledge-title"
    >
      <header className="district-knowledge-heading">
        <p className="district-explorer-kicker">DISTRICT FIELD NOTES</p>
        <h2 id="district-knowledge-title">More of {districtName}</h2>
        <p>
          Explore agriculture, culture, important places and other district
          stories, with links to their source records.
        </p>
      </header>

      {records === null && !error && (
        <p className="district-knowledge-status" role="status">
          Loading verified district records…
        </p>
      )}

      {error && (
        <div className="district-knowledge-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRetry((current) => current + 1)}>
            Try again
          </button>
        </div>
      )}

      {records && (
        <>
          <p className="district-knowledge-count">
            {records.length
              ? `${records.length} verified source record${records.length === 1 ? "" : "s"}`
              : "No verified records are available for this district yet."}
          </p>
          <div className="district-knowledge-groups">
            {groups.map((group) => {
              const groupRecords = records.filter(group.matches);
              return (
                <section
                  className="district-knowledge-group"
                  key={group.id}
                  aria-labelledby={`district-knowledge-${group.id}`}
                >
                  <div className="district-knowledge-group-heading">
                    <div>
                      <h3 id={`district-knowledge-${group.id}`}>{group.title}</h3>
                      <p>{group.description}</p>
                    </div>
                    <span>{String(groupRecords.length).padStart(2, "0")}</span>
                  </div>
                  {groupRecords.length ? (
                    <div className="district-knowledge-grid">
                      {groupRecords.map((record) => (
                        <KnowledgeCard key={record.id} record={record} />
                      ))}
                    </div>
                  ) : (
                    <p className="district-knowledge-empty">
                      No verified records in this category yet.
                    </p>
                  )}
                </section>
              );
            })}
            {records.some(
              (record) => !groups.some((group) => group.matches(record)),
            ) && (
              <section className="district-knowledge-group">
                <div className="district-knowledge-group-heading">
                  <div>
                    <h3>More district stories</h3>
                    <p>Additional records from the district knowledge archive.</p>
                  </div>
                </div>
                <div className="district-knowledge-grid">
                  {records
                    .filter(
                      (record) => !groups.some((group) => group.matches(record)),
                    )
                    .map((record) => (
                      <KnowledgeCard key={record.id} record={record} />
                    ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </section>
  );
}
