"""Pytest configuration and fixtures."""

import asyncio
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from epr_backend.app.main import app
from epr_backend.app.database import get_db, Base
from epr_backend.app.config import get_settings

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


def override_get_settings():
    """Override settings for testing."""
    return get_settings(_env_file=".env.test")


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override."""
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_settings] = override_get_settings
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
        "company_name": "Test Company"
    }


@pytest.fixture
def sample_company_data():
    """Sample company data for testing."""
    return {
        "name": "Test Company Ltd",
        "registration_number": "12345678",
        "address": "123 Test Street",
        "city": "Test City",
        "postal_code": "12345",
        "country": "Test Country"
    }


@pytest.fixture
def sample_product_data():
    """Sample product data for testing."""
    return {
        "name": "Test Product",
        "sku": "TEST-001",
        "category": "Electronics",
        "weight": 1.5,
        "material_composition": {
            "plastic": 0.6,
            "metal": 0.3,
            "paper": 0.1
        }
    }


@pytest_asyncio.fixture
async def authenticated_user(client, sample_user_data):
    """Create and authenticate a test user."""
    response = client.post("/api/v1/auth/register", json=sample_user_data)
    assert response.status_code == 201
    
    login_data = {
        "username": sample_user_data["email"],
        "password": sample_user_data["password"]
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
