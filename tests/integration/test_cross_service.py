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
    response = httpx.get(f"{gateway_url}/donor/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "donor-service"
    assert data["status"] in ["healthy", "degraded"]


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
    resp = httpx.get(f"{gateway_url}/pengguna/me", headers=test_user["headers"])
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == test_user["email"]
    assert data["user_type"] == "pengguna"


def test_crud_via_gateway(gateway_url, test_user):
    """Test 6: Create dan read riwayat donor pengguna melalui gateway."""
    headers = test_user["headers"]

    import time
    unique = int(time.time())
    pendonor_payload = {
        "nama_lengkap": f"Integration Donor {unique}",
        "email": f"integration-donor-{unique}@example.com",
        "jenis_kelamin": "Laki-laki",
        "berat_badan": 70,
        "tinggi_badan": 170,
        "golongan_darah": "O+",
        "umur": 25,
        "tanggal_lahir": "2001-01-01",
        "tanggal_terakhir_donor": None,
        "total_donor": 0,
        "alamat": "Jl. Integration Test No. 1",
        "no_telepon": "081234567890",
        "riwayat_kesehatan": "Sehat",
    }

    # Create pendonor publik
    resp = httpx.post(f"{gateway_url}/pendonor", json=pendonor_payload)
    assert resp.status_code == 201, resp.text
    pendonor_id = resp.json()["id_pendonor"]

    # Read pendonor publik
    resp = httpx.get(f"{gateway_url}/pendonor/{pendonor_id}")
    assert resp.status_code == 200
    assert resp.json()["email"] == pendonor_payload["email"]

    # Create riwayat donor milik user login, memverifikasi token via Auth Service
    resp = httpx.post(
        f"{gateway_url}/pengguna/riwayat-donor",
        json={"id_pendonor": pendonor_id, "golongan_darah": "O+"},
        headers=headers,
    )
    assert resp.status_code == 201, resp.text
    riwayat_id = resp.json()["id_riwayat"]

    # Read riwayat milik user login
    resp = httpx.get(f"{gateway_url}/pengguna/riwayat-donor", headers=headers)
    assert resp.status_code == 200
    riwayat_ids = [item["id_riwayat"] for item in resp.json()["riwayat_donor"]]
    assert riwayat_id in riwayat_ids


def test_unauthorized_without_token(gateway_url):
    """Test 7: Request tanpa token harus ditolak oleh Item Service."""
    resp = httpx.get(f"{gateway_url}/pengguna/me")
    assert resp.status_code in [401, 403, 422]


def test_invalid_token_rejected(gateway_url):
    """Test 8: Token invalid harus ditolak."""
    resp = httpx.get(
        f"{gateway_url}/pengguna/me",
        headers={"Authorization": "Bearer invalid-fake-token"}
    )
    assert resp.status_code == 401
