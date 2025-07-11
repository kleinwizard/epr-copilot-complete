"""add_category_column_to_products

Revision ID: 12cb67911458
Revises: analytics_fields_001
Create Date: 2025-07-11 10:09:24.359351

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '12cb67911458'
down_revision: Union[str, Sequence[str], None] = 'analytics_fields_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add category column to products table."""
    op.add_column('products', sa.Column('category', sa.String(length=100), nullable=True))


def downgrade() -> None:
    """Remove category column from products table."""
    op.drop_column('products', 'category')
