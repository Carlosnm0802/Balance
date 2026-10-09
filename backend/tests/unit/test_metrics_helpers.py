from decimal import Decimal

from app.metrics.router import as_money, percentage


def test_as_money_quantizes_to_two_decimals() -> None:
    value = Decimal("10.126")

    assert as_money(value) == Decimal("10.13")


def test_percentage_returns_zero_when_total_is_zero() -> None:
    assert percentage(Decimal("10.00"), Decimal("0.00")) == Decimal("0.00")


def test_percentage_calculates_and_quantizes() -> None:
    result = percentage(Decimal("25.00"), Decimal("200.00"))

    assert result == Decimal("12.50")
