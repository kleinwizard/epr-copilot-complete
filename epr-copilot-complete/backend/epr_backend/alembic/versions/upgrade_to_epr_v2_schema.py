"""Upgrade to EPR v2.0 schema with producer hierarchy and packaging granularity

Revision ID: epr_v2_upgrade_001
Revises: 7bd6a9a06eb1
Create Date: 2025-07-02 05:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'epr_v2_upgrade_001'
down_revision: Union[str, Sequence[str], None] = '7bd6a9a06eb1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade to EPR v2.0 schema."""
    
    op.create_table('entity_roles',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('role_type', sa.String(length=50), nullable=False),
        sa.Column('jurisdiction_id', sa.String(), nullable=True),
        sa.Column('parent_entity_id', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['jurisdiction_id'], ['jurisdictions.id'], ),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.ForeignKeyConstraint(['parent_entity_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table('product_producer_designations',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('product_id', sa.String(), nullable=True),
        sa.Column('designated_producer_id', sa.String(), nullable=True),
        sa.Column('jurisdiction_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['designated_producer_id'], ['organizations.id'], ),
        sa.ForeignKeyConstraint(['jurisdiction_id'], ['jurisdictions.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.add_column('producer_profiles', sa.Column('annual_revenue_scope', sa.String(length=20), nullable=True))
    op.add_column('producer_profiles', sa.Column('produces_perishable_food', sa.Boolean(), nullable=True))
    
    op.add_column('packaging_components', sa.Column('packaging_level', sa.String(length=20), nullable=True))
    op.add_column('packaging_components', sa.Column('is_beverage_container', sa.Boolean(), nullable=True))
    op.add_column('packaging_components', sa.Column('is_medical_exempt', sa.Boolean(), nullable=True))
    op.add_column('packaging_components', sa.Column('is_fifra_exempt', sa.Boolean(), nullable=True))
    op.add_column('packaging_components', sa.Column('ca_plastic_component_flag', sa.Boolean(), nullable=True))
    op.add_column('packaging_components', sa.Column('me_toxicity_flag', sa.Boolean(), nullable=True))
    op.add_column('packaging_components', sa.Column('or_lca_bonus_tier', sa.String(length=1), nullable=True))
    
    op.execute("UPDATE producer_profiles SET annual_revenue_scope = 'GLOBAL' WHERE annual_revenue_scope IS NULL")
    op.execute("UPDATE producer_profiles SET produces_perishable_food = FALSE WHERE produces_perishable_food IS NULL")
    op.execute("UPDATE packaging_components SET is_beverage_container = FALSE WHERE is_beverage_container IS NULL")
    op.execute("UPDATE packaging_components SET is_medical_exempt = FALSE WHERE is_medical_exempt IS NULL")
    op.execute("UPDATE packaging_components SET is_fifra_exempt = FALSE WHERE is_fifra_exempt IS NULL")
    op.execute("UPDATE packaging_components SET ca_plastic_component_flag = FALSE WHERE ca_plastic_component_flag IS NULL")
    op.execute("UPDATE packaging_components SET me_toxicity_flag = FALSE WHERE me_toxicity_flag IS NULL")
    


def downgrade() -> None:
    """Downgrade from EPR v2.0 schema."""
    
    op.drop_column('packaging_components', 'or_lca_bonus_tier')
    op.drop_column('packaging_components', 'me_toxicity_flag')
    op.drop_column('packaging_components', 'ca_plastic_component_flag')
    op.drop_column('packaging_components', 'is_fifra_exempt')
    op.drop_column('packaging_components', 'is_medical_exempt')
    op.drop_column('packaging_components', 'is_beverage_container')
    op.drop_column('packaging_components', 'packaging_level')
    
    op.drop_column('producer_profiles', 'produces_perishable_food')
    op.drop_column('producer_profiles', 'annual_revenue_scope')
    
    op.drop_table('product_producer_designations')
    op.drop_table('entity_roles')
