from fastapi.testclient import TestClient


def first_default_category_id(client: TestClient, headers: dict[str, str]) -> str:
    response = client.get("/categories", headers=headers)
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) > 0
    return categories[0]["id"]


def test_create_and_list_expense_authenticated(
    client: TestClient, create_authenticated_user
) -> None:
    auth = create_authenticated_user()
    category_id = first_default_category_id(client, auth["headers"])

    create_response = client.post(
        "/expenses",
        headers=auth["headers"],
        json={
            "amount": "125.50",
            "description": "Comida",
            "expense_date": "2026-10-10",
            "is_recurring": False,
            "category_id": category_id,
        },
    )
    assert create_response.status_code == 201

    list_response = client.get("/expenses", headers=auth["headers"])
    assert list_response.status_code == 200
    expenses = list_response.json()
    assert len(expenses) == 1
    assert expenses[0]["description"] == "Comida"


def test_expense_isolation_between_users(
    client: TestClient, create_authenticated_user
) -> None:
    first_user = create_authenticated_user(name="Ana")
    second_user = create_authenticated_user(name="Beto")

    category_id = first_default_category_id(client, first_user["headers"])
    create_response = client.post(
        "/expenses",
        headers=first_user["headers"],
        json={
            "amount": "300.00",
            "description": "Taxi",
            "expense_date": "2026-10-11",
            "is_recurring": False,
            "category_id": category_id,
        },
    )
    assert create_response.status_code == 201
    expense_id = create_response.json()["id"]

    other_user_get = client.get(
        f"/expenses/{expense_id}",
        headers=second_user["headers"],
    )
    assert other_user_get.status_code == 404

    other_user_delete = client.delete(
        f"/expenses/{expense_id}",
        headers=second_user["headers"],
    )
    assert other_user_delete.status_code == 404
