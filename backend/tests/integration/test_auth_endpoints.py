from fastapi.testclient import TestClient


def test_register_login_and_me_flow(client: TestClient) -> None:
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Carlos",
            "email": "carlos@example.com",
            "password": "Password123",
        },
    )
    assert register_response.status_code == 201

    duplicate_response = client.post(
        "/auth/register",
        json={
            "name": "Carlos",
            "email": "carlos@example.com",
            "password": "Password123",
        },
    )
    assert duplicate_response.status_code == 409

    login_response = client.post(
        "/auth/login",
        json={"email": "carlos@example.com", "password": "Password123"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "carlos@example.com"


def test_login_with_invalid_credentials_returns_401(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={"email": "missing@example.com", "password": "Password123"},
    )
    assert response.status_code == 401


def test_auth_me_requires_token(client: TestClient) -> None:
    response = client.get("/auth/me")
    assert response.status_code == 401
