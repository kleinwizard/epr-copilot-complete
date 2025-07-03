"""Add recyclability_percentage, carbon_factor, and sales_volume fields

Revision ID: analytics_fields_001
Revises: 7bd6a9a06eb1
Create Date: 2025-07-03 07:10:50.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'analytics_fields_001'
down_revision: Union[str, Sequence[str], None] = '7bd6a9a06eb1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add analytics fields for dashboard calculations."""
    op.add_column('material_categories', sa.Column('recyclability_percentage', sa.Numeric(precision=5, scale=2), nullable=True, server_default='0.0'))
    op.add_column('material_categories', sa.Column('carbon_factor', sa.Numeric(precision=10, scale=6), nullable=True, server_default='0.0'))
    
    op.add_column('products', sa.Column('sales_volume', sa.Numeric(precision=15, scale=2), nullable=True, server_default='0.0'))


def downgrade() -> None:
    """Remove analytics fields."""
    op.drop_column('products', 'sales_volume')
    op.drop_column('material_categories', 'carbon_factor')
    op.drop_column('material_categories', 'recyclability_percentage')
