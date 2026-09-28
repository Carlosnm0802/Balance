"""Create the initial empty migration.

Revision ID: 0001_initial_empty
Revises:
Create Date: 2026-09-25

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0001_initial_empty"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
