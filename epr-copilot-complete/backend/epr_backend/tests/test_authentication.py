import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from app.database import get_db, Base, User, Organization

@pytest.fixture
def auth_client(db_session):
    """Create a test client with auth router for authentication tests."""
    test_app = FastAPI(title="EPR Co-Pilot Auth Test", version="1.0.0")
    
    from app.routers import auth
    test_app.include_router(auth.router)
    
    # Override database dependency
    test_app.dependency_overrides[get_db] = lambda: db_session
    
    with TestClient(test_app) as test_client:
        yield test_client

@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "organization_name": "Test Organization"
    }

class TestAuthentication:
    
    def test_user_registration_success(self, auth_client, db_session, test_user_data):
        """Test successful user registration."""
        response = auth_client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert isinstance(data["access_token"], str)
        assert len(data["access_token"]) > 0

    def test_user_registration_duplicate_email(self, auth_client, db_session, test_user_data):
        """Test registration with duplicate email fails."""
        auth_client.post("/api/auth/register", json=test_user_data)
        
        response = auth_client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_user_login_success(self, auth_client, db_session, test_user_data):
        """Test successful user login."""
        auth_client.post("/api/auth/register", json=test_user_data)
        
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        response = auth_client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_user_login_invalid_credentials(self, auth_client, db_session, test_user_data):
        """Test login with invalid credentials fails."""
        auth_client.post("/api/auth/register", json=test_user_data)
        
        login_data = {
            "email": test_user_data["email"],
            "password": "wrongpassword"
        }
        response = auth_client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_user_login_nonexistent_user(self, auth_client, db_session):
        """Test login with non-existent user fails."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        response = auth_client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_get_current_user_with_valid_token(self, auth_client, db_session, test_user_data):
        """Test getting current user info with valid token."""
        register_response = auth_client.post("/api/auth/register", json=test_user_data)
        token = register_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = auth_client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert "id" in data
        assert "organization_id" in data

    def test_get_current_user_without_token(self, auth_client, db_session):
        """Test getting current user info without token fails."""
        response = auth_client.get("/api/auth/me")
        
        assert response.status_code == 403

    def test_get_current_user_with_invalid_token(self, auth_client, db_session):
        """Test getting current user info with invalid token fails."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = auth_client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 401

    def test_refresh_token_with_valid_token(self, auth_client, db_session, test_user_data):
        """Test token refresh with valid token."""
        register_response = auth_client.post("/api/auth/register", json=test_user_data)
        token = register_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = auth_client.post("/api/auth/refresh-token", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["access_token"] != token

    def test_logout_with_valid_token(self, auth_client, db_session, test_user_data):
        """Test logout with valid token."""
        register_response = auth_client.post("/api/auth/register", json=test_user_data)
        token = register_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = auth_client.post("/api/auth/logout", headers=headers)
        
        assert response.status_code == 200
        assert "Successfully logged out" in response.json()["message"]

    def test_registration_input_validation(self, auth_client, db_session):
        """Test registration input validation."""
        invalid_data = {
            "email": "invalid-email",
            "password": "",
            "organization_name": ""
        }
        response = auth_client.post("/api/auth/register", json=invalid_data)
        
        assert response.status_code == 422

    def test_login_input_validation(self, auth_client, db_session):
        """Test login input validation."""
        invalid_data = {
            "email": "invalid-email",
            "password": ""
        }
        response = auth_client.post("/api/auth/login", json=invalid_data)
        
        assert response.status_code == 422
