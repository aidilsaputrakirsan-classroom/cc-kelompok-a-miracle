"""Test authentication endpoints sesuai proyek."""


def test_register_admin_success(client):
    """Test register admin berhasil."""
    response = client.post("/auth/admin/register", json={
        "email": "admin1@example.com",
        "password": "AdminPass123",
        "nama_admin": "Admin Satu"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "admin1@example.com"
    assert data["nama_admin"] == "Admin Satu"
    assert "id_admin" in data
    assert "password" not in data


def test_register_admin_duplicate(client):
    """Test register admin kedua -> 400 (hanya 1 admin)."""
    client.post("/auth/admin/register", json={
        "email": "admin1@example.com",
        "password": "AdminPass123",
        "nama_admin": "Admin Satu"
    })
    response = client.post("/auth/admin/register", json={
        "email": "admin2@example.com",
        "password": "AdminPass123",
        "nama_admin": "Admin Dua"
    })
    assert response.status_code == 400


def test_login_admin_success(client):
    """Test login admin dengan kredensial benar."""
    client.post("/auth/admin/register", json={
        "email": "adminlogin@example.com",
        "password": "AdminPass123",
        "nama_admin": "Admin Login"
    })
    response = client.post("/auth/admin/login", json={
        "email": "adminlogin@example.com",
        "password": "AdminPass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user_type"] == "admin"


def test_login_admin_wrong_password(client):
    """Test login admin dengan password salah -> 401."""
    client.post("/auth/admin/register", json={
        "email": "adminwrong@example.com",
        "password": "AdminPass123",
        "nama_admin": "Admin Wrong"
    })
    response = client.post("/auth/admin/login", json={
        "email": "adminwrong@example.com",
        "password": "AdminPass124"
    })
    assert response.status_code == 401


def test_register_pengguna_success(client):
    """Test register pengguna berhasil."""
    response = client.post("/auth/pengguna/register", json={
        "email": "pengguna1@example.com",
        "password": "UserPass123",
        "nama_pengguna": "Pengguna Satu"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "pengguna1@example.com"
    assert data["nama_pengguna"] == "Pengguna Satu"
    assert "id_pengguna" in data
    assert "created_at" in data
    assert "password" not in data


def test_register_pengguna_duplicate_email(client):
    """Test register pengguna email sama -> 400."""
    client.post("/auth/pengguna/register", json={
        "email": "dupengguna@example.com",
        "password": "UserPass123",
        "nama_pengguna": "Pengguna Satu"
    })
    response = client.post("/auth/pengguna/register", json={
        "email": "dupengguna@example.com",
        "password": "UserPass456",
        "nama_pengguna": "Pengguna Dua"
    })
    assert response.status_code == 400


def test_login_pengguna_success(client):
    """Test login pengguna dengan kredensial benar."""
    client.post("/auth/pengguna/register", json={
        "email": "penglogin@example.com",
        "password": "UserPass123",
        "nama_pengguna": "Pengguna Login"
    })
    response = client.post("/auth/pengguna/login", json={
        "email": "penglogin@example.com",
        "password": "UserPass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user_type"] == "pengguna"


def test_login_pengguna_wrong_password(client):
    """Test login pengguna dengan password salah -> 401."""
    client.post("/auth/pengguna/register", json={
        "email": "pengwrong@example.com",
        "password": "UserPass123",
        "nama_pengguna": "Pengguna Wrong"
    })
    response = client.post("/auth/pengguna/login", json={
        "email": "pengwrong@example.com",
        "password": "UserPass124"
    })
    assert response.status_code == 401