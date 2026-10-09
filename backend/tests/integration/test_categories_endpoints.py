from fastapi.testclient import TestClient


def test_custom_category_crud_flow(
    client: TestClient, create_authenticated_user
) -> None:
    auth = create_authenticated_user()

    create_response = client.post(
        "/categories",
        headers=auth["headers"],
        json={"name": "Mascotas"},
    )
    assert create_response.status_code == 201
    category_id = create_response.json()["id"]

    list_response = client.get("/categories", headers=auth["headers"])
    assert list_response.status_code == 200
    assert any(category["id"] == category_id for category in list_response.json())

    update_response = client.patch(
        f"/categories/{category_id}",
        headers=auth["headers"],
        json={"name": "Mascotas y cuidado"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Mascotas y cuidado"

    delete_response = client.delete(
        f"/categories/{category_id}", headers=auth["headers"]
    )
    assert delete_response.status_code == 204


def test_cannot_delete_category_with_expenses(
    client: TestClient, create_authenticated_user
) -> None:
    auth = create_authenticated_user()

    category_response = client.post(
        "/categories",
        headers=auth["headers"],
        json={"name": "Suscripciones"},
    )
    assert category_response.status_code == 201
    category_id = category_response.json()["id"]

    expense_response = client.post(
        "/expenses",
        headers=auth["headers"],
        json={
            "amount": "99.00",
            "description": "Streaming",
            "expense_date": "2026-10-12",
            "is_recurring": True,
            "category_id": category_id,
        },
    )
    assert expense_response.status_code == 201

    delete_response = client.delete(
        f"/categories/{category_id}", headers=auth["headers"]
    )
    assert delete_response.status_code == 409
