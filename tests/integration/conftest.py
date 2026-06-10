"""
Integration Test Configuration.
Tests ini membutuhkan semua services running di Docker Compose.
"""
import os
import pytest
import httpx

GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost")


@pytest.fixture(scope="session")
def gateway_url():
    """Base URL gateway."""
    return GATEWAY_URL


@pytest.fixture(scope="session")
def test_user():
    """Register test user dan return credentials + token."""
    import time
    email = f"integration-test-{int(time.time())}@example.com"
    password = "IntegrationTestPass123"
    name = "Integration Test User"

    # Register
    response = httpx.post(
        f"{GATEWAY_URL}/auth/register",
        json={"email": email, "password": password, "name": name},
    )
    assert response.status_code == 201, f"Register failed: {response.text}"

    # Login
    response = httpx.post(
        f"{GATEWAY_URL}/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()["access_token"]

    return {
        "email": email,
        "password": password,
        "name": name,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }