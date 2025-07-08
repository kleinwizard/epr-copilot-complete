"""
Database initialization script for notifications and compliance data.

This script initializes the database with default notification preferences
and sample data for testing notifications and compliance features.
"""

import sys
import os
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import (
    get_db, User, Organization, Notification, NotificationPreference,
    ComplianceMetric, ComplianceIssue
)


def init_notification_preferences(db: Session):
    """Create default notification preferences for existing users."""
    print("Initializing notification preferences...")
    
    users = db.query(User).all()
    created_count = 0
    
    for user in users:
        existing_pref = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user.id
        ).first()
        
        if not existing_pref:
            pref = NotificationPreference(
                user_id=user.id,
                email_notifications=True,
                sms_notifications=False,
                push_notifications=True,
                deadline_reminders=True,
                compliance_alerts=True,
                team_notifications=True
            )
            db.add(pref)
            created_count += 1
    
    try:
        db.commit()
        print(f"Created {created_count} notification preferences")
    except IntegrityError as e:
        db.rollback()
        print(f"Error creating notification preferences: {e}")
        raise


def create_sample_notifications(db: Session):
    """Create sample notifications for testing."""
    print("Creating sample notifications...")
    
    users = db.query(User).all()
    if not users:
        print("No users found, skipping notification creation")
        return
    
    existing_notifications = db.query(Notification).count()
    if existing_notifications > 0:
        print(f"Found {existing_notifications} existing notifications, skipping creation")
        return
    
    sample_notifications = []
    
    for user in users[:3]:  # Create notifications for first 3 users
        notifications = [
            Notification(
                user_id=user.id,
                organization_id=user.organization_id,
                title="Quarterly Report Due",
                message="Your Q4 2024 EPR report is due in 7 days",
                type="deadline",
                priority="high",
                status="unread",
                extra_data={"report_type": "quarterly", "due_date": "2024-12-31"}
            ),
            Notification(
                user_id=user.id,
                organization_id=user.organization_id,
                title="Fee Payment Processed",
                message="Your EPR fee payment of €1,250 has been processed successfully",
                type="payment",
                priority="medium",
                status="read",
                read_at=datetime.now(timezone.utc),
                extra_data={"amount": 1250, "currency": "EUR", "payment_id": "PAY-123456"}
            ),
            Notification(
                user_id=user.id,
                organization_id=user.organization_id,
                title="Compliance Score Updated",
                message="Your compliance score has improved to 92%",
                type="compliance",
                priority="medium",
                status="unread",
                extra_data={"score": 92, "previous_score": 87, "improvement": 5}
            )
        ]
        sample_notifications.extend(notifications)
    
    try:
        db.add_all(sample_notifications)
        db.commit()
        print(f"Created {len(sample_notifications)} sample notifications")
    except IntegrityError as e:
        db.rollback()
        print(f"Error creating sample notifications: {e}")
        raise


def init_compliance_metrics(db: Session):
    """Initialize compliance metrics for existing organizations."""
    print("Initializing compliance metrics...")
    
    organizations = db.query(Organization).all()
    if not organizations:
        print("No organizations found, skipping compliance metrics creation")
        return
    
    existing_metrics = db.query(ComplianceMetric).count()
    if existing_metrics > 0:
        print(f"Found {existing_metrics} existing compliance metrics, skipping creation")
        return
    
    metrics = []
    
    for org in organizations:
        base_metrics = [
            ComplianceMetric(
                organization_id=org.id,
                metric_type="overall_score",
                metric_value=Decimal("89.5"),
                category="overall",
                extra_data={"calculation_method": "weighted_average", "components": 5}
            ),
            ComplianceMetric(
                organization_id=org.id,
                metric_type="reporting",
                metric_value=Decimal("92.0"),
                category="reporting",
                extra_data={"reports_submitted": 4, "reports_on_time": 4}
            ),
            ComplianceMetric(
                organization_id=org.id,
                metric_type="materials",
                metric_value=Decimal("87.5"),
                category="materials",
                extra_data={"classified_products": 45, "total_products": 50}
            ),
            ComplianceMetric(
                organization_id=org.id,
                metric_type="fees",
                metric_value=Decimal("91.0"),
                category="fees",
                extra_data={"payments_on_time": 11, "total_payments": 12}
            ),
            ComplianceMetric(
                organization_id=org.id,
                metric_type="documentation",
                metric_value=Decimal("86.0"),
                category="documentation",
                extra_data={"complete_documents": 43, "total_documents": 50}
            ),
            ComplianceMetric(
                organization_id=org.id,
                metric_type="data_quality",
                metric_value=Decimal("88.5"),
                category="data_quality",
                extra_data={"validated_records": 177, "total_records": 200}
            )
        ]
        metrics.extend(base_metrics)
    
    try:
        db.add_all(metrics)
        db.commit()
        print(f"Created {len(metrics)} compliance metrics")
    except IntegrityError as e:
        db.rollback()
        print(f"Error creating compliance metrics: {e}")
        raise


def create_sample_compliance_issues(db: Session):
    """Create sample compliance issues for testing."""
    print("Creating sample compliance issues...")
    
    organizations = db.query(Organization).all()
    if not organizations:
        print("No organizations found, skipping compliance issues creation")
        return
    
    existing_issues = db.query(ComplianceIssue).count()
    if existing_issues > 0:
        print(f"Found {existing_issues} existing compliance issues, skipping creation")
        return
    
    issues = []
    
    for org in organizations[:2]:  # Create issues for first 2 organizations
        org_user = db.query(User).filter(User.organization_id == org.id).first()
        
        sample_issues = [
            ComplianceIssue(
                organization_id=org.id,
                title="Missing Material Classification",
                description="5 products are missing required material classification for Q4 reporting",
                severity="medium",
                status="open",
                category="materials",
                assigned_to=org_user.id if org_user else None,
                resolution_deadline=datetime.now(timezone.utc) + timedelta(days=4),
                extra_data={"affected_products": 5, "report_period": "Q4_2024"}
            ),
            ComplianceIssue(
                organization_id=org.id,
                title="Incomplete Fee Documentation",
                description="Supporting documents missing for €2,500 in fee payments",
                severity="high",
                status="in_progress",
                category="fees",
                resolution_deadline=datetime.now(timezone.utc) + timedelta(days=2),
                extra_data={"missing_amount": 2500, "currency": "EUR", "payment_count": 3}
            ),
            ComplianceIssue(
                organization_id=org.id,
                title="Outdated Product Weights",
                description="12 products have packaging weights that haven't been updated in 6 months",
                severity="low",
                status="open",
                category="data_quality",
                extra_data={"affected_products": 12, "last_update": "6_months_ago"}
            )
        ]
        issues.extend(sample_issues)
    
    try:
        db.add_all(issues)
        db.commit()
        print(f"Created {len(issues)} sample compliance issues")
    except IntegrityError as e:
        db.rollback()
        print(f"Error creating sample compliance issues: {e}")
        raise


def create_sample_users_and_organizations(db: Session):
    """Create sample users and organizations for testing."""
    print("Creating sample users and organizations...")
    
    existing_orgs = db.query(Organization).count()
    if existing_orgs > 0:
        print(f"Found {existing_orgs} existing organizations, skipping creation")
        return
    
    # Create sample organizations
    org1 = Organization(
        name="GreenTech Solutions Ltd"
    )
    
    org2 = Organization(
        name="EcoPackaging Corp"
    )
    
    db.add_all([org1, org2])
    db.flush()  # Get IDs without committing
    
    from security.encryption import hash_password
    
    users = [
        User(
            organization_id=org1.id,
            email="manager@greentech.com",
            password_hash=hash_password("password123"),
            role="manager"
        ),
        User(
            organization_id=org1.id,
            email="analyst@greentech.com", 
            password_hash=hash_password("password123"),
            role="analyst"
        ),
        User(
            organization_id=org2.id,
            email="admin@ecopack.com",
            password_hash=hash_password("password123"),
            role="manager"
        )
    ]
    
    db.add_all(users)
    
    try:
        db.commit()
        print(f"Created {len([org1, org2])} organizations and {len(users)} users")
    except IntegrityError as e:
        db.rollback()
        print(f"Error creating sample users and organizations: {e}")
        raise


def init_db():
    """Main function to initialize all database data."""
    print("Starting database initialization...")
    
    db_gen = get_db()
    db = next(db_gen)
    
    try:
        create_sample_users_and_organizations(db)
        
        init_notification_preferences(db)
        
        create_sample_notifications(db)
        
        init_compliance_metrics(db)
        
        create_sample_compliance_issues(db)
        
        print("Database initialization completed successfully!")
        
    except Exception as e:
        print(f"Error during database initialization: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
