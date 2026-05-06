"""Test authentication endpoints sesuai proyek."""


def test_register_admin_success(client):
    """Test register admin berhasil."""
    # Registrasi admin pertama harus sukses.
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
    # Buat admin pertama, lalu coba daftar admin kedua.
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


def test_register_admin_invalid_email(client):
    """Test register admin dengan email invalid -> 422."""
    # Email tidak valid harus gagal validasi.
    response = client.post("/auth/admin/register", json={
        "email": "not-an-email",
        "password": "AdminPass123",
        "nama_admin": "Admin Invalid"
    })
    assert response.status_code == 422


def test_register_admin_weak_password(client):
    """Test register admin dengan password lemah -> 422."""
    # Password lemah harus ditolak.
    response = client.post("/auth/admin/register", json={
        "email": "adminweak@example.com",
        "password": "adminpass",
        "nama_admin": "Admin Weak"
    })
    assert response.status_code == 422


def test_login_admin_success(client):
    """Test login admin dengan kredensial benar."""
    # Daftarkan admin, lalu login dengan kredensial yang benar.
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
    # Password salah harus ditolak.
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


def test_login_admin_not_registered(client):
    """Test login admin dengan email tidak terdaftar -> 401."""
    # Email yang belum terdaftar tidak boleh login.
    response = client.post("/auth/admin/login", json={
        "email": "unknownadmin@example.com",
        "password": "AdminPass123"
    })
    assert response.status_code == 401


def test_register_pengguna_success(client):
    """Test register pengguna berhasil."""
    # Registrasi pengguna baru harus sukses.
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
    # Email yang sama tidak boleh dipakai dua kali.
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


def test_register_pengguna_invalid_email(client):
    """Test register pengguna dengan email invalid -> 422."""
    # Email tidak valid harus gagal.
    response = client.post("/auth/pengguna/register", json={
        "email": "invalid-email",
        "password": "UserPass123",
        "nama_pengguna": "Pengguna Invalid"
    })
    assert response.status_code == 422


def test_register_pengguna_weak_password(client):
    """Test register pengguna dengan password lemah -> 422."""
    # Password lemah harus ditolak.
    response = client.post("/auth/pengguna/register", json={
        "email": "penggunaweak@example.com",
        "password": "userpass",
        "nama_pengguna": "Pengguna Weak"
    })
    assert response.status_code == 422


def test_login_pengguna_success(client):
    """Test login pengguna dengan kredensial benar."""
    # Daftar pengguna, lalu login dengan kredensial benar.
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
    # Password salah harus ditolak.
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


def test_login_pengguna_not_registered(client):
    """Test login pengguna dengan email tidak terdaftar -> 401."""
    # Email yang belum terdaftar tidak boleh login.
    response = client.post("/auth/pengguna/login", json={
        "email": "unknownpengguna@example.com",
        "password": "UserPass123"
    })
    assert response.status_code == 401