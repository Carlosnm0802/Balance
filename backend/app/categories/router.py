from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.category import Category
from app.models.expense import Expense
from app.models.user import User
from app.schemas.category import CategoryInput, CategoryResponse

router = APIRouter(prefix="/categories", tags=["categories"])


def category_not_found() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="La categoría no existe",
    )


def category_conflict(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def category_name_exists(
    db: Session, name: str, user_id: UUID, category_id: UUID | None = None
) -> bool:
    query = select(Category.id).where(
        func.lower(Category.name) == name.lower(),
        or_(Category.is_default.is_(True), Category.user_id == user_id),
    )
    if category_id is not None:
        query = query.where(Category.id != category_id)
    return db.scalar(query) is not None


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Category]:
    return list(
        db.scalars(
            select(Category)
            .where(
                or_(Category.is_default.is_(True), Category.user_id == current_user.id)
            )
            .order_by(Category.is_default.desc(), func.lower(Category.name))
        ).all()
    )


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Category:
    if category_name_exists(db, category_data.name, current_user.id):
        raise category_conflict("Ya existe una categoría con ese nombre")

    category = Category(
        user_id=current_user.id,
        name=category_data.name,
        is_default=False,
    )
    db.add(category)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise category_conflict("Ya existe una categoría con ese nombre") from error
    db.refresh(category)
    return category


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: UUID,
    category_data: CategoryInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Category:
    category = db.scalar(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == current_user.id,
            Category.is_default.is_(False),
        )
    )
    if category is None:
        raise category_not_found()
    if category_name_exists(db, category_data.name, current_user.id, category.id):
        raise category_conflict("Ya existe una categoría con ese nombre")

    category.name = category_data.name
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise category_conflict("Ya existe una categoría con ese nombre") from error
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    category = db.scalar(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == current_user.id,
            Category.is_default.is_(False),
        )
    )
    if category is None:
        raise category_not_found()
    has_expenses = db.scalar(
        select(Expense.id).where(Expense.category_id == category.id)
    )
    if has_expenses is not None:
        raise category_conflict(
            "No puedes eliminar una categoría que tiene gastos asociados"
        )

    db.delete(category)
    db.commit()
