"""
Konfigurasi test — setup database test terpisah dari database utama.
"""
import os
os.environ["ENVIRONMENT"] = "test"  # harus sebelum import main agar rate limiter di-disable

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app

# Database test — SQLite lokal (tidak perlu PostgreSQL untuk testing!)
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Buat database baru untuk setiap test."""
    # Buat skema baru sebelum test dijalankan.
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        # Tutup sesi dan hapus skema setelah test selesai.
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Test client dengan database override."""
    # Override dependency DB agar memakai sesi test.
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    """Helper: register + login, return auth headers."""
    # Registrasi pengguna umum untuk kebutuhan auth.
    # Register
    client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "TestPassword123",
        "name": "Test User"
    })
    # Login untuk ambil token.
    # Login
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "TestPassword123"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client):
    """Helper: register + login admin, return auth headers."""
    # Registrasi admin untuk kebutuhan otorisasi.
    client.post("/auth/admin/register", json={
        "email": "admin@example.com",
        "password": "AdminPass123",
        "nama_admin": "Admin Test"
    })
    # Login admin untuk ambil token.
    login = client.post("/auth/admin/login", json={
        "email": "admin@example.com",
        "password": "AdminPass123"
    })
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_pendonor(client, overrides=None):
    """Helper: buat pendonor baru dan kembalikan response JSON."""
    # Payload default bisa dioverride sesuai kebutuhan test.
    payload = {
        "nama_lengkap": "Budi Santoso",
        "email": "budi@example.com",
        "jenis_kelamin": "Laki-laki",
        "berat_badan": 70,
        "tinggi_badan": 170,
        "golongan_darah": "A+",
        "umur": 25,
        "tanggal_lahir": "1999-01-01",
        "tanggal_terakhir_donor": "2024-01-01",
        "total_donor": 0,
        "alamat": "Jl. Mawar No. 1",
        "no_telepon": "081234567890",
        "riwayat_kesehatan": "Sehat"
    }
    if overrides:
        payload.update(overrides)
    response = client.post("/pendonor", json=payload)
    assert response.status_code == 201
    return response.json()
