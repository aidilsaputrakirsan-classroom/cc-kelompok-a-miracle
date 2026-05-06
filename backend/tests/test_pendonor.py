"""Test CRUD pendonor endpoints."""
from tests.conftest import create_pendonor


def test_create_pendonor_success(client):
    """Test membuat pendonor baru -> 201."""
    # Buat data via helper agar payload konsisten.
    data = create_pendonor(client)
    assert data["nama_lengkap"] == "Budi Santoso"
    assert data["email"] == "budi@example.com"
    assert "id_pendonor" in data


def test_get_pendonor_list(client):
    """Test mengambil daftar pendonor -> 200."""
    # Pastikan ada minimal satu data sebelum list.
    create_pendonor(client)
    response = client.get("/pendonor")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


def test_get_pendonor_pagination(client):
    """Test pagination pendonor dengan skip & limit."""
    # Buat beberapa data agar pagination bisa diuji.
    create_pendonor(client, {"email": "budi1@example.com"})
    create_pendonor(client, {"email": "budi2@example.com"})
    create_pendonor(client, {"email": "budi3@example.com"})

    response = client.get("/pendonor?skip=0&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 3
    assert len(data["pendonor"]) <= 2


def test_get_pendonor_pagination_invalid(client):
    """Test pagination pendonor dengan parameter invalid -> 422."""
    # skip/limit tidak valid harus memicu error validasi.
    response = client.get("/pendonor?skip=-1&limit=0")
    assert response.status_code == 422


def test_get_pendonor_filtering(client):
    """Test filter pendonor berdasarkan nama, kelamin, darah, dan umur."""
    # Buat dua data pendonor berbeda untuk uji filter.
    create_pendonor(client, {
        "email": "budi.filter@example.com",
        "nama_lengkap": "Budi Filter",
        "golongan_darah": "A+",
        "jenis_kelamin": "Laki-laki",
        "umur": 25
    })
    create_pendonor(client, {
        "email": "siti.filter@example.com",
        "nama_lengkap": "Siti Filter",
        "golongan_darah": "B+",
        "jenis_kelamin": "Perempuan",
        "umur": 30
    })

    # Terapkan beberapa filter sekaligus.
    response = client.get(
        "/pendonor?nama=Budi&jenis_kelamin=LAKI_LAKI&golongan_darah=A_POSITIF&umur_min=20&umur_max=28"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all(item["nama_lengkap"].lower().find("budi") >= 0 for item in data["pendonor"])
    assert all(item["jenis_kelamin"] == "Laki-laki" for item in data["pendonor"])
    assert all(item["golongan_darah"] == "A+" for item in data["pendonor"])
    assert all(20 <= item["umur"] <= 28 for item in data["pendonor"])


def test_create_pendonor_invalid_email(client):
    """Test create pendonor email invalid -> 422."""
    # Gunakan format email yang jelas tidak valid.
    response = client.post("/pendonor", json={
        "nama_lengkap": "Invalid Email",
        "email": "not-an-email",
        "jenis_kelamin": "Laki-laki",
        "berat_badan": 70,
        "tinggi_badan": 170,
        "golongan_darah": "A+",
        "umur": 25,
        "tanggal_lahir": "1999-01-01",
        "alamat": "Jl. Mawar No. 1",
        "no_telepon": "081234567890"
    })
    assert response.status_code == 422


def test_create_pendonor_missing_required(client):
    """Test create pendonor tanpa field wajib -> 422."""
    # Hilang nama_lengkap harus gagal validasi.
    response = client.post("/pendonor", json={
        "email": "missing@example.com",
        "jenis_kelamin": "Laki-laki",
        "berat_badan": 70,
        "tinggi_badan": 170,
        "golongan_darah": "A+",
        "umur": 25,
        "tanggal_lahir": "1999-01-01",
        "alamat": "Jl. Mawar No. 1",
        "no_telepon": "081234567890"
    })
    assert response.status_code == 422


def test_create_pendonor_invalid_umur(client):
    """Test create pendonor umur di bawah batas -> 422."""
    # Umur di bawah batas minimal harus ditolak.
    response = client.post("/pendonor", json={
        "nama_lengkap": "Invalid Umur",
        "email": "invalidumur@example.com",
        "jenis_kelamin": "Laki-laki",
        "berat_badan": 70,
        "tinggi_badan": 170,
        "golongan_darah": "A+",
        "umur": 16,
        "tanggal_lahir": "2010-01-01",
        "alamat": "Jl. Mawar No. 1",
        "no_telepon": "081234567890"
    })
    assert response.status_code == 422


def test_create_pendonor_invalid_enum(client):
    """Test create pendonor dengan enum invalid -> 422."""
    # Nilai enum tidak valid untuk jenis_kelamin dan golongan_darah.
    response = client.post("/pendonor", json={
        "nama_lengkap": "Invalid Enum",
        "email": "invalide@example.com",
        "jenis_kelamin": "TidakDikenal",
        "berat_badan": 70,
        "tinggi_badan": 170,
        "golongan_darah": "X+",
        "umur": 25,
        "tanggal_lahir": "1999-01-01",
        "alamat": "Jl. Mawar No. 1",
        "no_telepon": "081234567890"
    })
    assert response.status_code == 422


def test_get_pendonor_not_found(client):
    """Test mengambil pendonor yang tidak ada -> 404."""
    # Id yang tidak ada harus mengembalikan 404.
    response = client.get("/pendonor/9999")
    assert response.status_code == 404


def test_update_pendonor_success(client):
    """Test update pendonor -> data berubah."""
    # Update sebagian field dan verifikasi perubahannya.
    created = create_pendonor(client)
    pendonor_id = created["id_pendonor"]

    response = client.put(f"/pendonor/{pendonor_id}", json={
        "alamat": "Jl. Melati No. 2",
        "no_telepon": "081111111111"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["alamat"] == "Jl. Melati No. 2"
    assert data["no_telepon"] == "081111111111"


def test_update_pendonor_not_found(client):
    """Test update pendonor tidak ada -> 404."""
    # Update id yang tidak ada harus mengembalikan 404.
    response = client.put("/pendonor/9999", json={
        "alamat": "Jl. Melati No. 2"
    })
    assert response.status_code == 404


def test_delete_pendonor_unauthorized(client):
    """Test hapus pendonor tanpa admin -> 401."""
    # Hapus tanpa header admin harus ditolak.
    created = create_pendonor(client)
    pendonor_id = created["id_pendonor"]

    response = client.delete(f"/pendonor/{pendonor_id}")
    assert response.status_code == 401


def test_delete_pendonor_success(client, admin_headers):
    """Test hapus pendonor -> 204, lalu GET -> 404."""
    # Hapus dengan admin, lalu pastikan data hilang.
    created = create_pendonor(client)
    pendonor_id = created["id_pendonor"]

    response = client.delete(f"/pendonor/{pendonor_id}", headers=admin_headers)
    assert response.status_code == 204

    get_resp = client.get(f"/pendonor/{pendonor_id}")
    assert get_resp.status_code == 404


def test_delete_pendonor_not_found(client, admin_headers):
    """Test hapus pendonor tidak ada -> 404."""
    # Hapus id yang tidak ada harus mengembalikan 404.
    response = client.delete("/pendonor/9999", headers=admin_headers)
    assert response.status_code == 404