from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.category import Category
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate

router = APIRouter(prefix="/expenses", tags=["expenses"])


def expense_not_found() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="El gasto no existe"
    )


def category_not_available() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="La categoría no está disponible",
    )


def get_available_category(
    db: Session, category_id: UUID, user_id: UUID
) -> Category | None:
    return db.scalar(
        select(Category).where(
            Category.id == category_id,
            or_(Category.is_default.is_(True), Category.user_id == user_id),
        )
    )


def expense_query(expense_id: UUID, user_id: UUID):
    return (
        select(Expense)
        .options(joinedload(Expense.category))
        .where(Expense.id == expense_id, Expense.user_id == user_id)
    )


def to_response(expense: Expense) -> ExpenseResponse:
    return ExpenseResponse(
        id=expense.id,
        amount=expense.amount,
        description=expense.description,
        expense_date=expense.expense_date,
        is_recurring=expense.is_recurring,
        category_id=expense.category_id,
        category_name=expense.category.name,
        created_at=expense.created_at,
        updated_at=expense.updated_at,
    )


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExpenseResponse:
    category = get_available_category(db, expense_data.category_id, current_user.id)
    if category is None:
        raise category_not_available()

    expense = Expense(
        user_id=current_user.id,
        category_id=expense_data.category_id,
        amount=expense_data.amount,
        description=expense_data.description,
        expense_date=expense_data.expense_date,
        is_recurring=expense_data.is_recurring,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return to_response(expense)


@router.get("", response_model=list[ExpenseResponse])
def list_expenses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ExpenseResponse]:
    expenses = db.scalars(
        select(Expense)
        .options(joinedload(Expense.category))
        .where(Expense.user_id == current_user.id)
        .order_by(Expense.expense_date.desc(), Expense.created_at.desc())
    ).all()
    return [to_response(expense) for expense in expenses]


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExpenseResponse:
    expense = db.scalar(expense_query(expense_id, current_user.id))
    if expense is None:
        raise expense_not_found()
    return to_response(expense)


@router.patch("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: UUID,
    expense_data: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExpenseResponse:
    expense = db.scalar(expense_query(expense_id, current_user.id))
    if expense is None:
        raise expense_not_found()

    values = expense_data.model_dump(exclude_unset=True)
    if "category_id" in values:
        category = get_available_category(db, values["category_id"], current_user.id)
        if category is None:
            raise category_not_available()

    for field, value in values.items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)
    return to_response(expense)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    expense = db.scalar(
        select(Expense).where(
            Expense.id == expense_id, Expense.user_id == current_user.id
        )
    )
    if expense is None:
        raise expense_not_found()

    db.delete(expense)
    db.commit()
