from app.schemas.expense import ExpenseCreate
from app.schemas.user import UserCreate, UserProfileUpdate


def test_user_create_trims_name() -> None:
    user = UserCreate(
        name="  Carlos  ",
        email="carlos@example.com",
        password="Password123",
    )

    assert user.name == "Carlos"


def test_user_profile_update_trims_name() -> None:
    profile = UserProfileUpdate(name="  Carla  ")

    assert profile.name == "Carla"


def test_expense_create_description_whitespace_becomes_none() -> None:
    expense = ExpenseCreate(
        amount="120.50",
        description="   ",
        expense_date="2026-10-01",
        is_recurring=False,
        category_id="11111111-1111-4111-8111-111111111111",
    )

    assert expense.description is None


def test_expense_create_description_is_trimmed() -> None:
    expense = ExpenseCreate(
        amount="120.50",
        description="  Comida  ",
        expense_date="2026-10-01",
        is_recurring=False,
        category_id="11111111-1111-4111-8111-111111111111",
    )

    assert expense.description == "Comida"
