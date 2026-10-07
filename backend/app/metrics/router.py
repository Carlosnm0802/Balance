from decimal import ROUND_HALF_UP, Decimal

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy import extract, func, select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.budget import Budget
from app.models.category import Category
from app.models.expense import Expense
from app.models.user import User
from app.schemas.metrics import CategoryMetric, MetricsResponse

router = APIRouter(prefix="/metrics", tags=["metrics"])


def validate_year(year: int) -> None:
    if year < 2000 or year > 2100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El año debe estar entre 2000 y 2100",
        )


def as_money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def percentage(value: Decimal, total: Decimal) -> Decimal:
    if total == 0:
        return Decimal("0.00")
    return as_money((value / total) * Decimal("100"))


@router.get("/{year}/{month}", response_model=MetricsResponse)
def get_month_metrics(
    year: int,
    month: int = Path(ge=1, le=12),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MetricsResponse:
    validate_year(year)

    rows = db.execute(
        select(
            Category.id.label("category_id"),
            Category.name.label("category_name"),
            func.sum(Expense.amount).label("total_amount"),
        )
        .join(Category, Category.id == Expense.category_id)
        .where(
            Expense.user_id == current_user.id,
            extract("year", Expense.expense_date) == year,
            extract("month", Expense.expense_date) == month,
        )
        .group_by(Category.id, Category.name)
        .order_by(func.sum(Expense.amount).desc())
    ).all()

    total_expenses = as_money(sum((row.total_amount for row in rows), Decimal("0.00")))
    by_category = [
        CategoryMetric(
            category_id=row.category_id,
            category_name=row.category_name,
            total_amount=as_money(row.total_amount),
            percentage_of_total=percentage(row.total_amount, total_expenses),
        )
        for row in rows
    ]

    budget = db.scalar(
        select(Budget).where(
            Budget.user_id == current_user.id,
            Budget.year == year,
            Budget.month == month,
        )
    )
    budget_amount = as_money(budget.amount) if budget is not None else None
    difference_vs_budget = (
        as_money(total_expenses - budget_amount) if budget_amount is not None else None
    )

    return MetricsResponse(
        year=year,
        month=month,
        total_expenses=total_expenses,
        budget_amount=budget_amount,
        difference_vs_budget=difference_vs_budget,
        by_category=by_category,
    )
