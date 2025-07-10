from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Numeric, ForeignKey, Integer, Text, JSON
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone

import os
import pathlib
from alembic import command
from alembic.config import Config
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "sqlite:///./epr_copilot.db")

connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    db_path = SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")
    pathlib.Path(db_path).parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="organization")
    products = relationship("Product", back_populates="organization")
    reports = relationship("Report", back_populates="organization")
    team_members = relationship("TeamMember", back_populates="organization")
    team_invitations = relationship("TeamInvitation", back_populates="organization")
    calendar_events = relationship("CalendarEvent", back_populates="organization")
    compliance_profiles = relationship("ComplianceProfile", back_populates="organization")
    business_entities = relationship("BusinessEntity", back_populates="organization")
    documents = relationship("Document", back_populates="organization")
    notifications = relationship("Notification", back_populates="organization")
    compliance_metrics = relationship("ComplianceMetric", back_populates="organization")
    compliance_issues = relationship("ComplianceIssue", back_populates="organization")


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="manager")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="users")
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    notification_settings = relationship("UserNotificationSettings", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    notification_preferences = relationship("NotificationPreference", back_populates="user", uselist=False)


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    name = Column(String(255), nullable=False)
    sku = Column(String(100))
    category = Column(String(100))
    weight = Column(Numeric(10, 3), default=0.0)
    status = Column(String(50), default="Active")
    description = Column(Text)
    upc = Column(String(50))
    manufacturer = Column(String(255))
    epr_fee = Column(Numeric(10, 4), default=0.0)
    designated_producer_id = Column(String(100))
    materials = Column(JSON)
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    sales_volume = Column(Numeric(15, 2), default=0.0)  # Sales volume for growth rate calculations
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="products")
    packaging_components = relationship("PackagingComponent", back_populates="product")


class Material(Base):
    __tablename__ = "materials"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    epr_rate = Column(Numeric(10, 4))
    recyclable = Column(Boolean, default=False)


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    type = Column(String(50))
    period = Column(String(50))
    status = Column(String(50), default="draft")
    total_fee = Column(Numeric(15, 2))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="reports")


class Jurisdiction(Base):
    __tablename__ = "jurisdictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    code = Column(String(10), unique=True, nullable=False)  # OR, CA, CO, ME, MD, MN, WA, EU
    country = Column(String(100))
    effective_date = Column(DateTime)
    model_type = Column(String(50))  # PRO-led, Municipal Reimbursement, Shared Responsibility
    small_producer_revenue_threshold = Column(Numeric(15, 2))  # Revenue threshold for exemptions
    small_producer_tonnage_threshold = Column(Numeric(10, 3))  # Tonnage threshold for exemptions
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    material_categories = relationship("MaterialCategory", back_populates="jurisdiction")
    fee_rates = relationship("FeeRate", back_populates="jurisdiction")
    eco_modification_rules = relationship("EcoModificationRule", back_populates="jurisdiction")
    calculated_fees = relationship("CalculatedFee", back_populates="jurisdiction")


class MaterialCategory(Base):
    __tablename__ = "material_categories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    code = Column(String(50))  # Official material code (e.g., CMC codes for CA)
    parent_id = Column(String, ForeignKey("material_categories.id"))
    level = Column(Integer)  # 1=Class, 2=Type, 3=Form (hierarchical structure)
    jurisdiction_id = Column(String, ForeignKey("jurisdictions.id"))
    recyclable = Column(Boolean, default=True)
    recyclability_percentage = Column(Numeric(5, 2), default=0.0)  # 0-100% recyclability rate
    carbon_factor = Column(Numeric(10, 6), default=0.0)  # Carbon factor per material for sustainability calculations
    contains_plastic = Column(Boolean, default=False)  # Important for CA CMC list
    disrupts_recycling = Column(Boolean, default=False)  # Important for CO eco-modulation
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    jurisdiction = relationship("Jurisdiction", back_populates="material_categories")
    parent = relationship("MaterialCategory", remote_side=[id])
    children = relationship("MaterialCategory")
    fee_rates = relationship("FeeRate", back_populates="material_category")


class FeeRate(Base):
    __tablename__ = "fee_rates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    jurisdiction_id = Column(String, ForeignKey("jurisdictions.id"))
    material_category_id = Column(String, ForeignKey("material_categories.id"))
    rate_per_unit = Column(Numeric(10, 4))  # High precision for financial calculations
    unit_type = Column(String(20), default="kg")  # kg, lb, ton
    effective_date = Column(DateTime)
    expiry_date = Column(DateTime)
    rate_type = Column(String(50))  # base, commodity_risk, contamination_management, etc.
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    jurisdiction = relationship("Jurisdiction", back_populates="fee_rates")
    material_category = relationship("MaterialCategory", back_populates="fee_rates")


class EcoModificationRule(Base):
    __tablename__ = "eco_modification_rules"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    jurisdiction_id = Column(String, ForeignKey("jurisdictions.id"))
    rule_name = Column(String(255))
    rule_type = Column(String(50))  # bonus, malus, exemption, multiplier
    logic_definition = Column(JSON)  # JSONB for dynamic rules and conditions
    effective_date = Column(DateTime)
    expiry_date = Column(DateTime)
    priority = Column(Integer, default=0)  # For rule application order
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    jurisdiction = relationship("Jurisdiction", back_populates="eco_modification_rules")


class CalculatedFee(Base):
    __tablename__ = "calculated_fees"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    producer_id = Column(String, ForeignKey("organizations.id"))
    jurisdiction_id = Column(String, ForeignKey("jurisdictions.id"))
    calculation_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    total_fee = Column(Numeric(15, 4))  # High precision for financial calculations
    currency = Column(String(3), default="USD")
    status = Column(String(20), default="calculated")
    input_data = Column(JSON)  # Store original input for audit trail
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    producer = relationship("Organization")
    jurisdiction = relationship("Jurisdiction", back_populates="calculated_fees")
    calculation_steps = relationship("CalculationStep", back_populates="calculated_fee")


class CalculationStep(Base):
    __tablename__ = "calculation_steps"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    calculated_fee_id = Column(String, ForeignKey("calculated_fees.id"))
    step_number = Column(Integer)
    step_name = Column(String(100))
    input_data = Column(JSON)
    output_data = Column(JSON)
    rule_applied = Column(String(255))
    legal_citation = Column(Text)  # Reference to legal source/regulation
    calculation_method = Column(Text)  # Detailed explanation of calculation
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    calculated_fee = relationship("CalculatedFee", back_populates="calculation_steps")


class ProducerProfile(Base):
    __tablename__ = "producer_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    jurisdiction_id = Column(String, ForeignKey("jurisdictions.id"))
    annual_revenue = Column(Numeric(15, 2))
    annual_tonnage = Column(Numeric(10, 3))
    is_small_producer = Column(Boolean, default=False)
    qualifies_for_low_volume_fee = Column(Boolean, default=False)
    has_lca_disclosure = Column(Boolean, default=False)  # Oregon Bonus A
    has_environmental_impact_reduction = Column(Boolean, default=False)  # Oregon Bonus B
    uses_reusable_packaging = Column(Boolean, default=False)  # Oregon Bonus C
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization")
    jurisdiction = relationship("Jurisdiction")


class PackagingComponent(Base):
    __tablename__ = "packaging_components"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id"))
    material_category_id = Column(String, ForeignKey("material_categories.id"))
    component_name = Column(String(255))  # bottle, cap, label, etc.
    weight_per_unit = Column(Numeric(10, 6))  # High precision for small weights
    weight_unit = Column(String(10), default="kg")
    recycled_content_percentage = Column(Numeric(5, 2))  # 0-100%
    contains_pfas = Column(Boolean, default=False)  # Important for ME eco-modulation
    contains_phthalates = Column(Boolean, default=False)  # Important for ME eco-modulation
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    product = relationship("Product")
    material_category = relationship("MaterialCategory")


class CommodityValue(Base):
    __tablename__ = "commodity_values"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    jurisdiction_id = Column(String, ForeignKey("jurisdictions.id"))
    material_category_id = Column(String, ForeignKey("material_categories.id"))
    month_year = Column(String(7))  # YYYY-MM format
    average_value = Column(Numeric(10, 4))  # Average commodity value for Oregon calculations
    currency = Column(String(3), default="USD")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    jurisdiction = relationship("Jurisdiction")
    material_category = relationship("MaterialCategory")


class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    name = Column(String(255), nullable=False)
    criteria = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization")


class FeeOptimizationGoal(Base):
    __tablename__ = "fee_optimization_goals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    goal_type = Column(String(20), nullable=False)  # 'percentage' or 'amount'
    target_value = Column(Numeric(15, 4), nullable=False)  # Target percentage or dollar amount
    description = Column(String(500))  # Human-readable description of the goal
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization")


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    user_id = Column(String, ForeignKey("users.id"))
    role = Column(String(50), default="member")  # admin, manager, member, viewer
    permissions = Column(JSON)  # Specific permissions for the user
    status = Column(String(20), default="active")  # active, inactive, pending
    invited_by = Column(String, ForeignKey("users.id"))
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization")
    user = relationship("User", foreign_keys=[user_id])
    inviter = relationship("User", foreign_keys=[invited_by])


class TeamInvitation(Base):
    __tablename__ = "team_invitations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    email = Column(String(255), nullable=False)
    role = Column(String(50), default="member")
    permissions = Column(JSON)
    invited_by = Column(String, ForeignKey("users.id"))
    invitation_token = Column(String(255), unique=True)
    status = Column(String(20), default="pending")  # pending, accepted, expired, cancelled
    expires_at = Column(DateTime)
    accepted_at = Column(DateTime)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization")
    inviter = relationship("User")


class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    event_type = Column(String(50))  # deadline, meeting, reminder, submission
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    all_day = Column(Boolean, default=False)
    jurisdiction_id = Column(String, ForeignKey("jurisdictions.id"))
    priority = Column(String(20), default="medium")  # low, medium, high, critical
    status = Column(String(20), default="scheduled")  # scheduled, completed, cancelled
    reminder_settings = Column(JSON)  # Notification preferences
    created_by = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization")
    jurisdiction = relationship("Jurisdiction")
    creator = relationship("User")


class ComplianceProfile(Base):
    __tablename__ = "compliance_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    name = Column(String(255), nullable=False)
    jurisdiction_id = Column(String, ForeignKey("jurisdictions.id"))
    profile_type = Column(String(50))  # producer, importer, distributor, retailer
    registration_number = Column(String(100))
    registration_date = Column(DateTime)
    annual_revenue = Column(Numeric(15, 2))
    annual_tonnage = Column(Numeric(10, 3))
    is_active = Column(Boolean, default=True)
    compliance_requirements = Column(JSON)  # Specific requirements for this profile
    exemptions = Column(JSON)  # Any applicable exemptions
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization")
    jurisdiction = relationship("Jurisdiction")


class BusinessEntity(Base):
    __tablename__ = "business_entities"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    entity_name = Column(String(255), nullable=False)
    entity_type = Column(String(50))  # corporation, llc, partnership, sole_proprietorship
    registration_number = Column(String(100))
    tax_id = Column(String(50))
    jurisdiction_of_incorporation = Column(String(100))
    business_address = Column(JSON)  # Address information
    contact_information = Column(JSON)  # Phone, email, etc.
    is_primary = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)  # Size in bytes
    mime_type = Column(String(100))
    document_type = Column(String(50))  # verification, certificate, report, contract
    description = Column(Text)
    uploaded_by = Column(String, ForeignKey("users.id"))
    is_verified = Column(Boolean, default=False)
    verification_date = Column(DateTime)
    verified_by = Column(String, ForeignKey("users.id"))
    tags = Column(JSON)  # Document tags for organization
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization")
    uploader = relationship("User", foreign_keys=[uploaded_by])
    verifier = relationship("User", foreign_keys=[verified_by])


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone = Column(String(20))
    title = Column(String(100))
    bio = Column(Text)
    avatar_url = Column(String(500))
    timezone = Column(String(50), default="UTC")
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class UserNotificationSettings(Base):
    __tablename__ = "user_notification_settings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    deadline_alerts = Column(Boolean, default=True)
    report_status = Column(Boolean, default=True)
    fee_changes = Column(Boolean, default=True)
    team_updates = Column(Boolean, default=False)
    browser_notifications = Column(Boolean, default=False)
    notification_frequency = Column(String(50), default="Real-time")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # deadline, payment, team, compliance, system
    priority = Column(String(20), nullable=False, default="medium")  # low, medium, high, critical
    status = Column(String(20), nullable=False, default="unread")  # read, unread
    extra_data = Column(JSON)  # Additional data like links, actions, etc.
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    read_at = Column(DateTime)

    user = relationship("User", back_populates="notifications")
    organization = relationship("Organization", back_populates="notifications")


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)
    push_notifications = Column(Boolean, default=True)
    deadline_reminders = Column(Boolean, default=True)
    compliance_alerts = Column(Boolean, default=True)
    team_notifications = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notification_preferences")


class ComplianceMetric(Base):
    __tablename__ = "compliance_metrics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    metric_type = Column(String(50), nullable=False)  # overall_score, reporting, materials, fees, documentation, data_quality
    metric_value = Column(Numeric(5, 2), nullable=False)  # Score value (0-100)
    category = Column(String(50))  # Additional categorization if needed
    calculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    extra_data = Column(JSON)  # Additional calculation details

    organization = relationship("Organization", back_populates="compliance_metrics")


class ComplianceIssue(Base):
    __tablename__ = "compliance_issues"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    status = Column(String(20), nullable=False, default="open")  # open, in_progress, resolved, ignored
    category = Column(String(50), nullable=False)  # materials, fees, documentation, data_quality, reporting
    assigned_to = Column(String, ForeignKey("users.id"))
    resolution_deadline = Column(DateTime)
    resolution_notes = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime)
    extra_data = Column(JSON)

    organization = relationship("Organization", back_populates="compliance_issues")
    assigned_user = relationship("User", foreign_keys=[assigned_to])


def run_migrations():
    """Apply Alembic migrations to ensure schema is up to date."""
    here = pathlib.Path(__file__).resolve().parent
    alembic_cfg = Config(str(here.parent / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(here.parent / "alembic"))
    current_db_url = os.getenv("DATABASE_URL", "sqlite:///./epr_copilot.db")
    alembic_cfg.set_main_option("sqlalchemy.url", current_db_url)
    command.upgrade(alembic_cfg, "heads")


def create_tables():
    """Create tables if they do not exist and apply migrations."""
    run_migrations()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
