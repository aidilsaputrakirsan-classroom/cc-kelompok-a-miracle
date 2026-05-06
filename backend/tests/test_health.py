"""Test health check endpoint."""


def test_health_check(client):
    """Test health endpoint → 200 dan status healthy."""
    # Panggil endpoint health untuk memastikan layanan hidup.
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    # Validasi payload status dan nama layanan.
    assert data["status"] == "healthy"
    assert data["service"] == "backend"