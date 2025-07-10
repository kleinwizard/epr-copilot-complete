"""Pytest configuration and fixtures."""

import asyncio
import os
import tempfile
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import logging

os.environ["ENVIRONMENT"] = "test"

from app.main import app
from app.database import get_db, Base
from app.config import get_settings
from app.services.scheduler import task_scheduler

logging.basicConfig(level=logging.DEBUG)


def override_get_db():
    """Override database dependency for testing."""
    pass


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
    """Create a fresh database session for each test with isolated database."""
    temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    temp_db.close()
    
    database_url = f"sqlite:///{temp_db.name}"
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        os.unlink(temp_db.name)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override."""
    from fastapi import FastAPI
    from app.main import app as main_app
    
    test_app = FastAPI(title="EPR Co-Pilot Backend Test", version="1.0.0")
    
    test_app.router = main_app.router
    test_app.middleware_stack = main_app.middleware_stack
    test_app.exception_handlers = main_app.exception_handlers.copy()
    
    @test_app.get("/healthz")
    async def healthz():
        return {"status": "ok", "message": "EPR Co-Pilot Backend is running"}

    @test_app.get("/api/health")
    async def health_check():
        """Health check endpoint for monitoring."""
        from datetime import datetime, timezone
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "database": "connected"
        }
    
    # Override database dependency
    test_app.dependency_overrides[get_db] = lambda: db_session
    test_app.dependency_overrides[get_settings] = override_get_settings
    
    original_start = task_scheduler.start
    original_stop = task_scheduler.stop
    task_scheduler.start = lambda: None
    task_scheduler.stop = lambda: None
    
    import os
    original_env = os.environ.get("ENVIRONMENT")
    os.environ["ENVIRONMENT"] = "test"
    
    try:
        with TestClient(test_app) as test_client:
            yield test_client
    finally:
        if original_env is not None:
            os.environ["ENVIRONMENT"] = original_env
        elif "ENVIRONMENT" in os.environ:
            del os.environ["ENVIRONMENT"]
        
        task_scheduler.start = original_start
        task_scheduler.stop = original_stop
        test_app.dependency_overrides.clear()


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
