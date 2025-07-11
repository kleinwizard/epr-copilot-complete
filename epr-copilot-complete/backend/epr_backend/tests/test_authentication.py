import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "organization_name": "Test Organization"
    }

class TestAuthentication:
    
    def test_user_registration_success(self, client, test_db, test_user_data):
        """Test successful user registration."""
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert isinstance(data["access_token"], str)
        assert len(data["access_token"]) > 0

    def test_user_registration_duplicate_email(self, client, test_db, test_user_data):
        """Test registration with duplicate email fails."""
        client.post("/api/auth/register", json=test_user_data)
        
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_user_login_success(self, client, test_db, test_user_data):
        """Test successful user login."""
        client.post("/api/auth/register", json=test_user_data)
        
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_user_login_invalid_credentials(self, client, test_db, test_user_data):
        """Test login with invalid credentials fails."""
        client.post("/api/auth/register", json=test_user_data)
        
        login_data = {
            "email": test_user_data["email"],
            "password": "wrongpassword"
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_user_login_nonexistent_user(self, client, test_db):
        """Test login with non-existent user fails."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_get_current_user_with_valid_token(self, client, test_db, test_user_data):
        """Test getting current user info with valid token."""
        register_response = client.post("/api/auth/register", json=test_user_data)
        token = register_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert "id" in data
        assert "organization_id" in data

    def test_get_current_user_without_token(self, client, test_db):
        """Test getting current user info without token fails."""
        response = client.get("/api/auth/me")
        
        assert response.status_code == 403

    def test_get_current_user_with_invalid_token(self, client, test_db):
        """Test getting current user info with invalid token fails."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 401

    def test_refresh_token_with_valid_token(self, client, test_db, test_user_data):
        """Test token refresh with valid token."""
        register_response = client.post("/api/auth/register", json=test_user_data)
        token = register_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/auth/refresh-token", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["access_token"] != token

    def test_logout_with_valid_token(self, client, test_db, test_user_data):
        """Test logout with valid token."""
        register_response = client.post("/api/auth/register", json=test_user_data)
        token = register_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/auth/logout", headers=headers)
        
        assert response.status_code == 200
        assert "Successfully logged out" in response.json()["message"]

    def test_registration_input_validation(self, client, test_db):
        """Test registration input validation."""
        invalid_data = {
            "email": "invalid-email",
            "password": "",
            "organization_name": ""
        }
        response = client.post("/api/auth/register", json=invalid_data)
        
        assert response.status_code == 422

    def test_login_input_validation(self, client, test_db):
        """Test login input validation."""
        invalid_data = {
            "email": "invalid-email",
            "password": ""
        }
        response = client.post("/api/auth/login", json=invalid_data)
        
        assert response.status_code == 422
