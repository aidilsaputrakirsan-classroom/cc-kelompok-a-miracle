import httpx

def test_local_gateway_health():
    # Mengetes container gateway/backend lokal yang dinyalakan docker compose di CI
    response = httpx.get("http://localhost/health", timeout=10)
    # Lolos jika merespons dengan kode valid (200, 401, atau 404)
    assert response.status_code in [200, 401, 404]