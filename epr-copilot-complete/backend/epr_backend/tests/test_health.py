"""Test health endpoint."""

import pytest
from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    """Test the health check endpoint."""
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_health_endpoint_performance(client: TestClient):
    """Test health endpoint response time."""
    import time
    
    start_time = time.time()
    response = client.get("/healthz")
    end_time = time.time()
    
    assert response.status_code == 200
    assert (end_time - start_time) < 0.1  # Should respond in under 100ms


@pytest.mark.integration
def test_health_with_database(client: TestClient, db_session):
    """Test health endpoint with database connection."""
    response = client.get("/healthz")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "ok"
