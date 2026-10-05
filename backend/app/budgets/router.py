from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.budget import Budget
from app.models.user import User
from app.schemas.budget import BudgetInput, BudgetResponse

router = APIRouter(prefix="/budgets", tags=["budgets"])


def budget_not_found() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="El presupuesto no existe",
    )


def validate_year(year: int) -> None:
    if year < 2000 or year > 2100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El año debe estar entre 2000 y 2100",
        )


def get_user_budget(db: Session, user_id: UUID, year: int, month: int) -> Budget | None:
    return db.scalar(
        select(Budget).where(
            Budget.user_id == user_id,
            Budget.year == year,
            Budget.month == month,
        )
    )


@router.get("/{year}/{month}", response_model=BudgetResponse)
def get_budget(
    year: int,
    month: int = Path(ge=1, le=12),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Budget:
    validate_year(year)
    budget = get_user_budget(db, current_user.id, year, month)
    if budget is None:
        raise budget_not_found()
    return budget


@router.put("/{year}/{month}", response_model=BudgetResponse)
def upsert_budget(
    budget_data: BudgetInput,
    response: Response,
    year: int,
    month: int = Path(ge=1, le=12),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Budget:
    validate_year(year)
    budget = get_user_budget(db, current_user.id, year, month)
    created = budget is None

    if created:
        budget = Budget(
            user_id=current_user.id,
            amount=budget_data.amount,
            year=year,
            month=month,
        )
        db.add(budget)
    else:
        budget.amount = budget_data.amount

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un presupuesto para este período",
        ) from error

    db.refresh(budget)
    if created:
        response.status_code = status.HTTP_201_CREATED
    return budget
