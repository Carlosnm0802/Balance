from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class CategoryMetric(BaseModel):
    category_id: UUID
    category_name: str
    total_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    percentage_of_total: Decimal = Field(ge=0, le=100, max_digits=5, decimal_places=2)


class MetricsResponse(BaseModel):
    year: int
    month: int
    currency: str = "MXN"
    total_expenses: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    budget_amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )
    difference_vs_budget: Decimal | None = Field(
        default=None,
        max_digits=12,
        decimal_places=2,
    )
    by_category: list[CategoryMetric]
