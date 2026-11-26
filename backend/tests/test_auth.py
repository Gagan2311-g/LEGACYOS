import sqlite3
import pytest
from fastapi.testclient import TestClient
from app import main


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DATABASE_FILE", tmp_path / "community.db")
    main.initialize_database()
    return TestClient(main.app)


def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Karnataka Farmer",
            "email": "farmer@karnataka.gov.in",
            "password": "securepassword123",
            "confirm_password": "securepassword123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["full_name"] == "Karnataka Farmer"
    assert data["user"]["email"] == "farmer@karnataka.gov.in"
    assert "token" in data


def test_register_duplicate_email(client):
    payload = {
        "full_name": "User One",
        "email": "test@karnataka.gov.in",
        "password": "password123",
        "confirm_password": "password123",
    }
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 200

    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"].lower()


def test_login_and_me_and_logout(client):
    reg_payload = {
        "full_name": "Cultural Expert",
        "email": "expert@karnataka.gov.in",
        "password": "mypassword123",
        "confirm_password": "mypassword123",
    }
    client.post("/api/auth/register", json=reg_payload)

    # Login
    login_res = client.post(
        "/api/auth/login",
        json={"email": "expert@karnataka.gov.in", "password": "mypassword123"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["token"]

    # Get /api/auth/me
    me_res = client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    assert me_res.json()["user"]["email"] == "expert@karnataka.gov.in"

    # Logout
    logout_res = client.post(
        "/api/auth/logout", headers={"Authorization": f"Bearer {token}"}
    )
    assert logout_res.status_code == 200

    # Verify session is dead
    me_dead = client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert me_dead.status_code == 401


def test_forgot_and_reset_password(client):
    reg_payload = {
        "full_name": "Reset User",
        "email": "reset@karnataka.gov.in",
        "password": "oldpassword123",
        "confirm_password": "oldpassword123",
    }
    client.post("/api/auth/register", json=reg_payload)

    # Forgot password
    forgot_res = client.post(
        "/api/auth/forgot-password", json={"email": "reset@karnataka.gov.in"}
    )
    assert forgot_res.status_code == 200
    reset_token = forgot_res.json()["reset_token"]

    # Reset password
    reset_res = client.post(
        "/api/auth/reset-password",
        json={
            "token": reset_token,
            "new_password": "newsecurepassword456",
            "confirm_password": "newsecurepassword456",
        },
    )
    assert reset_res.status_code == 200

    # Login with new password
    login_res = client.post(
        "/api/auth/login",
        json={"email": "reset@karnataka.gov.in", "password": "newsecurepassword456"},
    )
    assert login_res.status_code == 200
