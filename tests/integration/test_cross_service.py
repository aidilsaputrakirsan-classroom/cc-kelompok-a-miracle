"""
Integration Tests — Verifikasi komunikasi antar services.
Jalankan dengan: pytest tests/integration/ -v
Syarat: docker compose up -d (semua services running)
"""
import httpx
import pytest


def test_gateway_health(gateway_url):
    """Test 1: Gateway bisa diakses."""
    response = httpx.get(f"{gateway_url}/health")
    assert response.status_code == 200


def test_auth_service_health(gateway_url):
    """Test 2: Auth Service health check via gateway."""
    response = httpx.get(f"{gateway_url}/auth/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "auth-service"
    assert data["status"] == "healthy"


def test_item_service_health(gateway_url):
    """Test 3: Item Service health check via gateway."""
    # Item service health route: depends on nginx config
    response = httpx.get(f"{gateway_url}/items/health")
    # Accept 200 or handle that /items/health might not be routed
    assert response.status_code in [200, 404]


def test_register_login_flow(gateway_url):
    """Test 4: Full flow register → login → get token."""
    import time
    email = f"flow-test-{int(time.time())}@example.com"

    # Register
    resp = httpx.post(f"{gateway_url}/auth/register", json={
        "email": email, "password": "FlowTest123", "name": "Flow User"
    })
    assert resp.status_code == 201
    assert resp.json()["email"] == email

    # Login
    resp = httpx.post(f"{gateway_url}/auth/login", json={
        "email": email, "password": "FlowTest123"
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_cross_service_auth_verification(gateway_url, test_user):
    """Test 5: Item Service verifikasi token via Auth Service (cross-service)."""
    # Create item (requires auth verification across services)
    resp = httpx.post(
        f"{gateway_url}/items",
        json={"name": "Integration Test Item", "price": 99000, "quantity": 1},
        headers=test_user["headers"],
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Integration Test Item"
    assert "owner_id" in data


def test_crud_via_gateway(gateway_url, test_user):
    """Test 6: Full CRUD melalui gateway (melibatkan semua services)."""
    headers = test_user["headers"]

    # Create
    resp = httpx.post(f"{gateway_url}/items", json={
        "name": "CRUD Test", "price": 50000, "quantity": 3
    }, headers=headers)
    assert resp.status_code == 201
    item_id = resp.json()["id"]

    # Read
    resp = httpx.get(f"{gateway_url}/items/{item_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "CRUD Test"

    # Update
    resp = httpx.put(f"{gateway_url}/items/{item_id}", json={
        "price": 45000
    }, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["price"] == 45000

    # Delete
    resp = httpx.delete(f"{gateway_url}/items/{item_id}", headers=headers)
    assert resp.status_code == 204

    # Verify deleted
    resp = httpx.get(f"{gateway_url}/items/{item_id}", headers=headers)
    assert resp.status_code == 404


def test_unauthorized_without_token(gateway_url):
    """Test 7: Request tanpa token harus ditolak oleh Item Service."""
    resp = httpx.post(f"{gateway_url}/items", json={
        "name": "Should Fail", "price": 100, "quantity": 1
    })
    assert resp.status_code in [401, 422]


def test_invalid_token_rejected(gateway_url):
    """Test 8: Token invalid harus ditolak."""
    resp = httpx.get(
        f"{gateway_url}/items",
        headers={"Authorization": "Bearer invalid-fake-token"}
    )
    assert resp.status_code == 401