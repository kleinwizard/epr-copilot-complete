from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Numeric, ForeignKey, Integer, Text, JSON
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone

import os
import pathlib
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


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="manager")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="users")


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"))
    name = Column(String(255), nullable=False)
    sku = Column(String(100))
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


def create_tables():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
