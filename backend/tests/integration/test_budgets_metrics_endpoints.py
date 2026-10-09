from fastapi.testclient import TestClient


def test_upsert_budget_and_fetch_metrics(
    client: TestClient, create_authenticated_user
) -> None:
    auth = create_authenticated_user()

    categories_response = client.get("/categories", headers=auth["headers"])
    assert categories_response.status_code == 200
    category_id = categories_response.json()[0]["id"]

    create_expense_response = client.post(
        "/expenses",
        headers=auth["headers"],
        json={
            "amount": "500.00",
            "description": "Supermercado",
            "expense_date": "2026-10-10",
            "is_recurring": False,
            "category_id": category_id,
        },
    )
    assert create_expense_response.status_code == 201

    put_budget_response = client.put(
        "/budgets/2026/10",
        headers=auth["headers"],
        json={"amount": "1000.00"},
    )
    assert put_budget_response.status_code == 201

    get_budget_response = client.get("/budgets/2026/10", headers=auth["headers"])
    assert get_budget_response.status_code == 200
    assert get_budget_response.json()["amount"] == "1000.00"

    metrics_response = client.get("/metrics/2026/10", headers=auth["headers"])
    assert metrics_response.status_code == 200
    payload = metrics_response.json()
    assert payload["total_expenses"] == "500.00"
    assert payload["budget_amount"] == "1000.00"
    assert payload["difference_vs_budget"] == "-500.00"
    assert len(payload["by_category"]) == 1


def test_metrics_without_budget_returns_null_comparison(
    client: TestClient, create_authenticated_user
) -> None:
    auth = create_authenticated_user()

    metrics_response = client.get("/metrics/2026/10", headers=auth["headers"])
    assert metrics_response.status_code == 200
    payload = metrics_response.json()
    assert payload["budget_amount"] is None
    assert payload["difference_vs_budget"] is None
