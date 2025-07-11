"""Add missing indexes and fix Material model

Revision ID: 003_add_missing_indexes_and_fix_material_model
Revises: 002_add_notifications_and_compliance_models
Create Date: 2025-01-11 01:44:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003_add_missing_indexes_and_fix_material_model'
down_revision = '002_add_notifications_and_compliance_models'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('materials', sa.Column('organization_id', sa.String(), nullable=True))
    op.create_foreign_key('fk_materials_organization_id', 'materials', 'organizations', ['organization_id'], ['id'])
    
    op.create_index('idx_products_organization_id', 'products', ['organization_id'])
    op.create_index('idx_products_sku', 'products', ['sku'])
    op.create_index('idx_products_category', 'products', ['category'])
    op.create_index('idx_products_status', 'products', ['status'])
    op.create_index('idx_products_org_sku', 'products', ['organization_id', 'sku'])
    op.create_index('idx_products_last_updated', 'products', ['last_updated'])
    
    op.create_index('idx_materials_organization_id', 'materials', ['organization_id'])
    op.create_index('idx_materials_name', 'materials', ['name'])
    op.create_index('idx_materials_recyclable', 'materials', ['recyclable'])
    
    op.create_index('idx_reports_organization_id', 'reports', ['organization_id'])
    op.create_index('idx_reports_type', 'reports', ['type'])
    op.create_index('idx_reports_status', 'reports', ['status'])
    op.create_index('idx_reports_period', 'reports', ['period'])
    op.create_index('idx_reports_created_at', 'reports', ['created_at'])
    
    op.create_index('idx_users_organization_id', 'users', ['organization_id'])
    op.create_index('idx_users_role', 'users', ['role'])
    op.create_index('idx_users_created_at', 'users', ['created_at'])
    
    op.create_index('idx_packaging_components_product_id', 'packaging_components', ['product_id'])
    op.create_index('idx_packaging_components_material_category_id', 'packaging_components', ['material_category_id'])
    op.create_index('idx_packaging_components_component_name', 'packaging_components', ['component_name'])
    
    op.create_index('idx_jurisdictions_code', 'jurisdictions', ['code'])
    op.create_index('idx_jurisdictions_country', 'jurisdictions', ['country'])
    op.create_index('idx_jurisdictions_effective_date', 'jurisdictions', ['effective_date'])
    
    op.create_index('idx_material_categories_jurisdiction_id', 'material_categories', ['jurisdiction_id'])
    op.create_index('idx_material_categories_parent_id', 'material_categories', ['parent_id'])
    op.create_index('idx_material_categories_code', 'material_categories', ['code'])
    op.create_index('idx_material_categories_level', 'material_categories', ['level'])
    
    op.create_index('idx_fee_rates_jurisdiction_id', 'fee_rates', ['jurisdiction_id'])
    op.create_index('idx_fee_rates_material_category_id', 'fee_rates', ['material_category_id'])
    op.create_index('idx_fee_rates_effective_date', 'fee_rates', ['effective_date'])
    op.create_index('idx_fee_rates_rate_type', 'fee_rates', ['rate_type'])
    
    op.create_index('idx_calculated_fees_producer_id', 'calculated_fees', ['producer_id'])
    op.create_index('idx_calculated_fees_jurisdiction_id', 'calculated_fees', ['jurisdiction_id'])
    op.create_index('idx_calculated_fees_calculation_timestamp', 'calculated_fees', ['calculation_timestamp'])
    op.create_index('idx_calculated_fees_status', 'calculated_fees', ['status'])
    op.create_index('idx_calculated_fees_org_date', 'calculated_fees', ['producer_id', 'calculation_timestamp'])
    
    op.create_index('idx_producer_profiles_organization_id', 'producer_profiles', ['organization_id'])
    op.create_index('idx_producer_profiles_jurisdiction_id', 'producer_profiles', ['jurisdiction_id'])
    op.create_index('idx_producer_profiles_is_small_producer', 'producer_profiles', ['is_small_producer'])
    
    op.create_index('idx_saved_searches_organization_id', 'saved_searches', ['organization_id'])
    op.create_index('idx_saved_searches_created_at', 'saved_searches', ['created_at'])
    
    op.create_index('idx_team_members_organization_id', 'team_members', ['organization_id'])
    op.create_index('idx_team_members_user_id', 'team_members', ['user_id'])
    op.create_index('idx_team_members_role', 'team_members', ['role'])
    op.create_index('idx_team_members_status', 'team_members', ['status'])
    
    op.create_index('idx_calendar_events_organization_id', 'calendar_events', ['organization_id'])
    op.create_index('idx_calendar_events_start_date', 'calendar_events', ['start_date'])
    op.create_index('idx_calendar_events_event_type', 'calendar_events', ['event_type'])
    op.create_index('idx_calendar_events_status', 'calendar_events', ['status'])
    op.create_index('idx_calendar_events_jurisdiction_id', 'calendar_events', ['jurisdiction_id'])
    
    op.create_index('idx_documents_organization_id', 'documents', ['organization_id'])
    op.create_index('idx_documents_document_type', 'documents', ['document_type'])
    op.create_index('idx_documents_uploaded_by', 'documents', ['uploaded_by'])
    op.create_index('idx_documents_is_verified', 'documents', ['is_verified'])
    
    op.create_index('idx_user_profiles_user_id', 'user_profiles', ['user_id'])


def downgrade():
    op.drop_index('idx_user_profiles_user_id', table_name='user_profiles')
    op.drop_index('idx_documents_is_verified', table_name='documents')
    op.drop_index('idx_documents_uploaded_by', table_name='documents')
    op.drop_index('idx_documents_document_type', table_name='documents')
    op.drop_index('idx_documents_organization_id', table_name='documents')
    op.drop_index('idx_calendar_events_jurisdiction_id', table_name='calendar_events')
    op.drop_index('idx_calendar_events_status', table_name='calendar_events')
    op.drop_index('idx_calendar_events_event_type', table_name='calendar_events')
    op.drop_index('idx_calendar_events_start_date', table_name='calendar_events')
    op.drop_index('idx_calendar_events_organization_id', table_name='calendar_events')
    op.drop_index('idx_team_members_status', table_name='team_members')
    op.drop_index('idx_team_members_role', table_name='team_members')
    op.drop_index('idx_team_members_user_id', table_name='team_members')
    op.drop_index('idx_team_members_organization_id', table_name='team_members')
    op.drop_index('idx_saved_searches_created_at', table_name='saved_searches')
    op.drop_index('idx_saved_searches_organization_id', table_name='saved_searches')
    op.drop_index('idx_producer_profiles_is_small_producer', table_name='producer_profiles')
    op.drop_index('idx_producer_profiles_jurisdiction_id', table_name='producer_profiles')
    op.drop_index('idx_producer_profiles_organization_id', table_name='producer_profiles')
    op.drop_index('idx_calculated_fees_org_date', table_name='calculated_fees')
    op.drop_index('idx_calculated_fees_status', table_name='calculated_fees')
    op.drop_index('idx_calculated_fees_calculation_timestamp', table_name='calculated_fees')
    op.drop_index('idx_calculated_fees_jurisdiction_id', table_name='calculated_fees')
    op.drop_index('idx_calculated_fees_producer_id', table_name='calculated_fees')
    op.drop_index('idx_fee_rates_rate_type', table_name='fee_rates')
    op.drop_index('idx_fee_rates_effective_date', table_name='fee_rates')
    op.drop_index('idx_fee_rates_material_category_id', table_name='fee_rates')
    op.drop_index('idx_fee_rates_jurisdiction_id', table_name='fee_rates')
    op.drop_index('idx_material_categories_level', table_name='material_categories')
    op.drop_index('idx_material_categories_code', table_name='material_categories')
    op.drop_index('idx_material_categories_parent_id', table_name='material_categories')
    op.drop_index('idx_material_categories_jurisdiction_id', table_name='material_categories')
    op.drop_index('idx_jurisdictions_effective_date', table_name='jurisdictions')
    op.drop_index('idx_jurisdictions_country', table_name='jurisdictions')
    op.drop_index('idx_jurisdictions_code', table_name='jurisdictions')
    op.drop_index('idx_packaging_components_component_name', table_name='packaging_components')
    op.drop_index('idx_packaging_components_material_category_id', table_name='packaging_components')
    op.drop_index('idx_packaging_components_product_id', table_name='packaging_components')
    op.drop_index('idx_users_created_at', table_name='users')
    op.drop_index('idx_users_role', table_name='users')
    op.drop_index('idx_users_organization_id', table_name='users')
    op.drop_index('idx_reports_created_at', table_name='reports')
    op.drop_index('idx_reports_period', table_name='reports')
    op.drop_index('idx_reports_status', table_name='reports')
    op.drop_index('idx_reports_type', table_name='reports')
    op.drop_index('idx_reports_organization_id', table_name='reports')
    op.drop_index('idx_materials_recyclable', table_name='materials')
    op.drop_index('idx_materials_name', table_name='materials')
    op.drop_index('idx_materials_organization_id', table_name='materials')
    op.drop_index('idx_products_last_updated', table_name='products')
    op.drop_index('idx_products_org_sku', table_name='products')
    op.drop_index('idx_products_status', table_name='products')
    op.drop_index('idx_products_category', table_name='products')
    op.drop_index('idx_products_sku', table_name='products')
    op.drop_index('idx_products_organization_id', table_name='products')
    
    op.drop_constraint('fk_materials_organization_id', 'materials', type_='foreignkey')
    op.drop_column('materials', 'organization_id')
