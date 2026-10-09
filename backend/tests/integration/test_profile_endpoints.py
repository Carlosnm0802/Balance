from fastapi.testclient import TestClient


def test_profile_get_and_update(client: TestClient, create_authenticated_user) -> None:
    auth = create_authenticated_user(name="Perfil Inicial")

    get_response = client.get("/profile/me", headers=auth["headers"])
    assert get_response.status_code == 200
    assert get_response.json()["name"] == "Perfil Inicial"

    update_response = client.patch(
        "/profile/me",
        headers=auth["headers"],
        json={"name": "Perfil Actualizado"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Perfil Actualizado"


def test_profile_requires_auth(client: TestClient) -> None:
    response = client.get("/profile/me")
    assert response.status_code == 401
