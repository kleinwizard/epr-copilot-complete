"""Add notifications and compliance models

Revision ID: 002_add_notifications_and_compliance_models
Revises: epr_v2_upgrade_001
Create Date: 2025-01-08 21:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_add_notifications_and_compliance_models'
down_revision = 'epr_v2_upgrade_001'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('notifications',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('priority', sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='unread'),
        sa.Column('extra_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_created_at'), 'notifications', ['created_at'], unique=False)
    op.create_index(op.f('ix_notifications_organization_id'), 'notifications', ['organization_id'], unique=False)
    op.create_index(op.f('ix_notifications_status'), 'notifications', ['status'], unique=False)
    op.create_index(op.f('ix_notifications_type'), 'notifications', ['type'], unique=False)
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)

    op.create_table('notification_preferences',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('email_notifications', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('sms_notifications', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('push_notifications', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('deadline_reminders', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('compliance_alerts', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('team_notifications', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_notification_preferences_user_id'), 'notification_preferences', ['user_id'], unique=True)

    op.create_table('compliance_metrics',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=False),
        sa.Column('metric_type', sa.String(length=50), nullable=False),
        sa.Column('metric_value', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('calculated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('extra_data', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_compliance_metrics_calculated_at'), 'compliance_metrics', ['calculated_at'], unique=False)
    op.create_index(op.f('ix_compliance_metrics_metric_type'), 'compliance_metrics', ['metric_type'], unique=False)
    op.create_index(op.f('ix_compliance_metrics_organization_id'), 'compliance_metrics', ['organization_id'], unique=False)

    op.create_table('compliance_issues',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('organization_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='open'),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('assigned_to', sa.String(), nullable=True),
        sa.Column('resolution_deadline', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('extra_data', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_compliance_issues_category'), 'compliance_issues', ['category'], unique=False)
    op.create_index(op.f('ix_compliance_issues_organization_id'), 'compliance_issues', ['organization_id'], unique=False)
    op.create_index(op.f('ix_compliance_issues_severity'), 'compliance_issues', ['severity'], unique=False)
    op.create_index(op.f('ix_compliance_issues_status'), 'compliance_issues', ['status'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_compliance_issues_status'), table_name='compliance_issues')
    op.drop_index(op.f('ix_compliance_issues_severity'), table_name='compliance_issues')
    op.drop_index(op.f('ix_compliance_issues_organization_id'), table_name='compliance_issues')
    op.drop_index(op.f('ix_compliance_issues_category'), table_name='compliance_issues')
    op.drop_table('compliance_issues')

    op.drop_index(op.f('ix_compliance_metrics_organization_id'), table_name='compliance_metrics')
    op.drop_index(op.f('ix_compliance_metrics_metric_type'), table_name='compliance_metrics')
    op.drop_index(op.f('ix_compliance_metrics_calculated_at'), table_name='compliance_metrics')
    op.drop_table('compliance_metrics')

    op.drop_index(op.f('ix_notification_preferences_user_id'), table_name='notification_preferences')
    op.drop_table('notification_preferences')

    op.drop_index(op.f('ix_notifications_user_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_type'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_status'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_organization_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_created_at'), table_name='notifications')
    op.drop_table('notifications')
