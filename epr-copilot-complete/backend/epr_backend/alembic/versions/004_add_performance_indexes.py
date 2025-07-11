"""Add performance indexes for query optimization

Revision ID: 004_add_performance_indexes
Revises: 003_add_missing_indexes_and_fix_material_model
Create Date: 2025-07-11 01:53:15.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004_add_performance_indexes'
down_revision = '003_add_missing_indexes_and_fix_material_model'
branch_labels = None
depends_on = None


def upgrade():
    
    op.create_index('idx_products_org_id', 'products', ['organization_id'])
    op.create_index('idx_products_org_sku', 'products', ['organization_id', 'sku'])
    op.create_index('idx_products_name_search', 'products', ['name'])
    op.create_index('idx_products_status', 'products', ['status'])
    
    op.create_index('idx_packaging_components_product_id', 'packaging_components', ['product_id'])
    op.create_index('idx_packaging_components_material_cat', 'packaging_components', ['material_category_id'])
    
    op.create_index('idx_calculated_fees_org_date', 'calculated_fees', ['organization_id', 'calculation_date'])
    op.create_index('idx_calculated_fees_jurisdiction', 'calculated_fees', ['jurisdiction'])
    op.create_index('idx_calculated_fees_product', 'calculated_fees', ['product_id'])
    
    op.create_index('idx_import_batches_org_status', 'import_batches', ['organization_id', 'status'])
    op.create_index('idx_import_batches_created', 'import_batches', ['created_at'])
    
    op.create_index('idx_materials_org_id', 'materials', ['organization_id'])
    op.create_index('idx_materials_name', 'materials', ['name'])
    
    op.create_index('idx_material_categories_jurisdiction', 'material_categories', ['jurisdiction'])
    op.create_index('idx_material_categories_code', 'material_categories', ['code'])
    
    op.create_index('idx_organizations_business_id', 'organizations', ['business_id'])
    op.create_index('idx_organizations_deq_number', 'organizations', ['deq_number'])
    
    op.create_index('idx_users_org_id', 'users', ['organization_id'])
    op.create_index('idx_users_email', 'users', ['email'])
    
    op.create_index('idx_compliance_profiles_org_jurisdiction', 'compliance_profiles', ['organization_id', 'jurisdiction'])
    
    op.create_index('idx_notifications_user_read', 'notifications', ['user_id', 'is_read'])
    op.create_index('idx_notifications_created', 'notifications', ['created_at'])
    
    op.create_index('idx_audit_logs_org_action', 'audit_logs', ['organization_id', 'action'])
    op.create_index('idx_audit_logs_timestamp', 'audit_logs', ['timestamp'])
    
    op.create_index('idx_products_org_category_status', 'products', ['organization_id', 'category', 'status'])
    op.create_index('idx_calculated_fees_org_jurisdiction_date', 'calculated_fees', ['organization_id', 'jurisdiction', 'calculation_date'])


def downgrade():
    op.drop_index('idx_calculated_fees_org_jurisdiction_date')
    op.drop_index('idx_products_org_category_status')
    op.drop_index('idx_audit_logs_timestamp')
    op.drop_index('idx_audit_logs_org_action')
    op.drop_index('idx_notifications_created')
    op.drop_index('idx_notifications_user_read')
    op.drop_index('idx_compliance_profiles_org_jurisdiction')
    op.drop_index('idx_users_email')
    op.drop_index('idx_users_org_id')
    op.drop_index('idx_organizations_deq_number')
    op.drop_index('idx_organizations_business_id')
    op.drop_index('idx_material_categories_code')
    op.drop_index('idx_material_categories_jurisdiction')
    op.drop_index('idx_materials_name')
    op.drop_index('idx_materials_org_id')
    op.drop_index('idx_import_batches_created')
    op.drop_index('idx_import_batches_org_status')
    op.drop_index('idx_calculated_fees_product')
    op.drop_index('idx_calculated_fees_jurisdiction')
    op.drop_index('idx_calculated_fees_org_date')
    op.drop_index('idx_packaging_components_material_cat')
    op.drop_index('idx_packaging_components_product_id')
    op.drop_index('idx_products_status')
    op.drop_index('idx_products_name_search')
    op.drop_index('idx_products_org_sku')
    op.drop_index('idx_products_org_id')
