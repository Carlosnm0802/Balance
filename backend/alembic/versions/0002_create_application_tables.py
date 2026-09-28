"""Create application tables and seed default categories.

Revision ID: 0002_create_application_tables
Revises: 0001_initial_empty
Create Date: 2026-09-28

"""
from typing import Sequence, Union
from uuid import UUID

import sqlalchemy as sa
from alembic import op

revision: str = "0002_create_application_tables"
down_revision: Union[str, Sequence[str], None] = "0001_initial_empty"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFAULT_CATEGORIES = (
    ("11111111-1111-4111-8111-111111111111", "Alimentación"),
    ("22222222-2222-4222-8222-222222222222", "Transporte"),
    ("33333333-3333-4333-8333-333333333333", "Vivienda"),
    ("44444444-4444-4444-8444-444444444444", "Salud"),
    ("55555555-5555-4555-8555-555555555555", "Entretenimiento"),
    ("66666666-6666-4666-8666-666666666666", "Educación"),
    ("77777777-7777-4777-8777-777777777777", "Servicios"),
    ("88888888-8888-4888-8888-888888888888", "Compras"),
    ("99999999-9999-4999-8999-999999999999", "Otros"),
)


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_table(
        "categories",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("is_default", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "expenses",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("category_id", sa.UUID(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("expense_date", sa.Date(), nullable=False),
        sa.Column("is_recurring", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint("amount > 0", name="ck_expenses_amount_positive"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "budgets",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint("amount > 0", name="ck_budgets_amount_positive"),
        sa.CheckConstraint("month BETWEEN 1 AND 12", name="ck_budgets_month_valid"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "year", "month", name="uq_budgets_user_period"),
    )

    category_table = sa.table(
        "categories",
        sa.column("id", sa.UUID()),
        sa.column("name", sa.String()),
        sa.column("is_default", sa.Boolean()),
    )
    op.bulk_insert(
        category_table,
        [
            {
                "id": UUID(category_id),
                "name": name,
                "is_default": True,
            }
            for category_id, name in DEFAULT_CATEGORIES
        ],
    )


def downgrade() -> None:
    op.drop_table("budgets")
    op.drop_table("expenses")
    op.drop_table("categories")
    op.drop_table("users")
