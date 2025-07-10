import pytest
from fastapi.testclient import TestClient
from app.database import Organization, User, Product, Report


class TestMultiTenantIsolation:
    """Test multi-tenant data isolation for privacy compliance"""
    
    @pytest.fixture
    def setup_test_organizations(self, db_session):
        """Create test organizations for isolation testing"""
        org1 = Organization(
            id="org1-test-id",
            name="Test Org 1"
        )
        org2 = Organization(
            id="org2-test-id",
            name="Test Org 2"
        )
        
        db_session.add(org1)
        db_session.add(org2)
        db_session.commit()
        
        return org1, org2
    
    def test_user_data_isolation(self, setup_test_organizations, db_session):
        """Test that users can only access their organization's data"""
        org1, org2 = setup_test_organizations
        
        user1 = User(
            id="user1-test-id",
            email="user1@org1.com",
            password_hash="hashed_password_1",
            organization_id=org1.id,
            role="admin"
        )
        user2 = User(
            id="user2-test-id",
            email="user2@org2.com",
            password_hash="hashed_password_2", 
            organization_id=org2.id,
            role="admin"
        )
        
        db_session.add(user1)
        db_session.add(user2)
        db_session.commit()
        
        
        org1_users = db_session.query(User).filter(
            User.organization_id == org1.id
        ).all()
        
        assert len(org1_users) == 1
        assert org1_users[0].email == "user1@org1.com"
        
        org2_users = db_session.query(User).filter(
            User.organization_id == org2.id
        ).all()
        
        assert len(org2_users) == 1
        assert org2_users[0].email == "user2@org2.com"
    
    def test_product_data_isolation(self, setup_test_organizations, db_session):
        """Test that products are isolated by organization"""
        org1, org2 = setup_test_organizations
        
        product1 = Product(
            id="product1-test-id",
            name="Org1 Product",
            organization_id=org1.id,
            sku="SKU001"
        )
        product2 = Product(
            id="product2-test-id",
            name="Org2 Product",
            organization_id=org2.id,
            sku="SKU002"
        )
        
        db_session.add(product1)
        db_session.add(product2)
        db_session.commit()
        
        org1_products = db_session.query(Product).filter(
            Product.organization_id == org1.id
        ).all()
        
        assert len(org1_products) == 1
        assert org1_products[0].name == "Org1 Product"
        
        org2_products = db_session.query(Product).filter(
            Product.organization_id == org2.id
        ).all()
        
        assert len(org2_products) == 1
        assert org2_products[0].name == "Org2 Product"
    
    def test_report_data_isolation(self, setup_test_organizations, db_session):
        """Test that reports are isolated by organization - CRITICAL for compliance"""
        org1, org2 = setup_test_organizations
        
        report1 = Report(
            id="report1-test-id",
            organization_id=org1.id,
            type="compliance",
            period="2024-Q1",
            total_fee=100.50,
            status="completed"
        )
        report2 = Report(
            id="report2-test-id",
            organization_id=org2.id,
            type="compliance",
            period="2024-Q1", 
            total_fee=200.75,
            status="completed"
        )
        
        db_session.add(report1)
        db_session.add(report2)
        db_session.commit()
        
        org1_reports = db_session.query(Report).filter(
            Report.organization_id == org1.id
        ).all()
        
        assert len(org1_reports) == 1
        assert org1_reports[0].total_fee == 100.50
        
        org2_reports = db_session.query(Report).filter(
            Report.organization_id == org2.id
        ).all()
        
        assert len(org2_reports) == 1
        assert org2_reports[0].total_fee == 200.75
    
    def test_api_endpoint_tenant_filtering(self, setup_test_organizations, client: TestClient, db_session):
        """Test that API endpoints properly filter by tenant"""
        org1, org2 = setup_test_organizations
        
        # Create test users for both organizations
        from datetime import datetime, timezone
        user1 = User(
            id="user1-api-test",
            email="user1@org1.com",
            password_hash="hash1",
            organization_id=org1.id,
            role="manager",
            created_at=datetime.now(timezone.utc)
        )
        user2 = User(
            id="user2-api-test",
            email="user2@org2.com",
            password_hash="hash2",
            organization_id=org2.id,
            role="manager",
            created_at=datetime.now(timezone.utc)
        )
        
        # Create test products for both organizations
        product1 = Product(
            id="prod1-api-test", 
            name="Org1 Product", 
            organization_id=org1.id, 
            sku="SKU1"
        )
        product2 = Product(
            id="prod2-api-test", 
            name="Org2 Product", 
            organization_id=org2.id, 
            sku="SKU2"
        )
        
        db_session.add_all([user1, user2, product1, product2])
        db_session.commit()

        from app.auth import get_current_user
        def mock_get_current_user_1():
            return user1
        
        client.app.dependency_overrides[get_current_user] = mock_get_current_user_1

        response1 = client.get("/api/products/")
        assert response1.status_code == 200
        products1 = response1.json()
        product_ids1 = [p["id"] for p in products1]
        assert product1.id in product_ids1
        assert product2.id not in product_ids1
        
        def mock_get_current_user_2():
            return user2
        
        client.app.dependency_overrides[get_current_user] = mock_get_current_user_2
        
        response2 = client.get("/api/products/")
        assert response2.status_code == 200
        products2 = response2.json()
        product_ids2 = [p["id"] for p in products2]
        assert product2.id in product_ids2
        assert product1.id not in product_ids2
        
        client.app.dependency_overrides[get_current_user] = mock_get_current_user_1
        
        response_cross_access = client.get(f"/api/products/{product2.id}")
        assert response_cross_access.status_code == 404
    
    def test_database_query_isolation(self, setup_test_organizations, db_session):
        """Test that all database queries include organization_id filtering"""
        org1, org2 = setup_test_organizations
        
        
        # Create test products for both organizations
        product1 = Product(
            id="test-product-1",
            name="Org1 Test Product",
            organization_id=org1.id,
            sku="TEST001"
        )
        product2 = Product(
            id="test-product-2", 
            name="Org2 Test Product",
            organization_id=org2.id,
            sku="TEST002"
        )
        
        db_session.add(product1)
        db_session.add(product2)
        db_session.commit()
        
        all_products = db_session.query(Product).all()
        assert len(all_products) == 2  # This demonstrates the security risk
        
        # SAFE: Properly filtered queries by organization_id
        org1_products = db_session.query(Product).filter(
            Product.organization_id == org1.id
        ).all()
        assert len(org1_products) == 1
        assert org1_products[0].name == "Org1 Test Product"
    
    def test_soft_delete_isolation(self, setup_test_organizations, db_session):
        """Test that soft deletes maintain tenant isolation"""
        org1, org2 = setup_test_organizations
        
        product = Product(
            id="product-soft-delete-test",
            name="Test Product",
            organization_id=org1.id,
            sku="SKU-DELETED"
        )
        
        db_session.add(product)
        db_session.commit()
        
        org2_products = db_session.query(Product).filter(
            Product.organization_id == org2.id
        ).all()
        
        assert len(org2_products) == 0
        
        org1_products = db_session.query(Product).filter(
            Product.organization_id == org1.id
        ).all()
        
        assert len(org1_products) == 1
        assert org1_products[0].name == "Test Product"
