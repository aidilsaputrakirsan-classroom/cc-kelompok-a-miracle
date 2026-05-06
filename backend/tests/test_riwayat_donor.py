"""Test CRUD riwayat donor endpoints."""
from tests.conftest import create_pendonor


def _get_pengguna_headers(client, overrides=None):
    # Siapkan payload registrasi pengguna (bisa dioverride).
    payload = {
        "email": "pengguna@example.com",
        "password": "UserPass123",
        "nama_pengguna": "Pengguna Test"
    }
    if overrides:
        payload.update(overrides)
    response = client.post("/auth/pengguna/register", json=payload)
    assert response.status_code == 201

    # Login untuk mendapatkan token akses.
    login = client.post("/auth/pengguna/login", json={
        "email": payload["email"],
        "password": payload["password"]
    })
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_riwayat_donor_success(client):
    """Test membuat riwayat donor -> 201."""
    # Buat pendonor lalu buat riwayat donor miliknya.
    pendonor = create_pendonor(client)
    pendonor_id = pendonor["id_pendonor"]
    response = client.post("/riwayat-donor", json={
        "id_pendonor": pendonor_id
    })
    assert response.status_code == 201
    data = response.json()
    assert data["id_pendonor"] == pendonor_id
    assert data["status_verifikasi"] is False
    assert "id_riwayat" in data


def test_create_riwayat_donor_invalid_pendonor(client):
    """Test membuat riwayat donor dengan pendonor tidak ada -> 404."""
    # Id pendonor tidak ada harus mengembalikan 404.
    response = client.post("/riwayat-donor", json={
        "id_pendonor": 9999
    })
    assert response.status_code == 404


def test_get_riwayat_donor_list(client):
    """Test mengambil daftar riwayat donor -> 200."""
    # Pastikan ada data sebelum mengambil list.
    pendonor = create_pendonor(client)
    client.post("/riwayat-donor", json={
        "id_pendonor": pendonor["id_pendonor"]
    })
    response = client.get("/riwayat-donor")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


def test_get_riwayat_donor_pagination(client):
    """Test pagination riwayat donor dengan skip & limit."""
    # Buat beberapa data untuk menguji pagination.
    pendonor_1 = create_pendonor(client, {"email": "riwayat1@example.com"})
    pendonor_2 = create_pendonor(client, {"email": "riwayat2@example.com"})
    pendonor_3 = create_pendonor(client, {"email": "riwayat3@example.com"})

    client.post("/riwayat-donor", json={"id_pendonor": pendonor_1["id_pendonor"]})
    client.post("/riwayat-donor", json={"id_pendonor": pendonor_2["id_pendonor"]})
    client.post("/riwayat-donor", json={"id_pendonor": pendonor_3["id_pendonor"]})

    response = client.get("/riwayat-donor?skip=0&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 3
    assert len(data["riwayat_donor"]) <= 2


def test_get_riwayat_donor_not_found(client):
    """Test mengambil riwayat donor yang tidak ada -> 404."""
    # Id riwayat donor yang tidak ada harus 404.
    response = client.get("/riwayat-donor/9999")
    assert response.status_code == 404


def test_get_riwayat_donor_by_pendonor(client):
    """Test list riwayat donor berdasarkan pendonor."""
    # Buat dua pendonor dan cek filter berdasarkan id pendonor.
    pendonor_1 = create_pendonor(client, {"email": "pendonor.list@example.com"})
    pendonor_2 = create_pendonor(client, {"email": "pendonor.list2@example.com"})
    pendonor_id = pendonor_1["id_pendonor"]

    client.post("/riwayat-donor", json={"id_pendonor": pendonor_id})
    client.post("/riwayat-donor", json={"id_pendonor": pendonor_2["id_pendonor"]})

    response = client.get(f"/riwayat-donor/pendonor/{pendonor_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all(item["id_pendonor"] == pendonor_id for item in data["riwayat_donor"])


def test_create_riwayat_donor_pengguna_success(client):
    """Test pengguna membuat riwayat donor -> 201."""
    # Pengguna login lalu buat riwayat donor via endpoint pengguna.
    pendonor = create_pendonor(client)
    pengguna_headers = _get_pengguna_headers(client)

    response = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor["id_pendonor"]
    }, headers=pengguna_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["id_pendonor"] == pendonor["id_pendonor"]
    assert data["status_verifikasi"] is False


def test_create_riwayat_donor_pengguna_unauthorized(client):
    """Test pengguna membuat riwayat donor tanpa token -> 401."""
    # Tanpa token harus ditolak.
    pendonor = create_pendonor(client)
    response = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor["id_pendonor"]
    })
    assert response.status_code == 401


def test_get_riwayat_donor_pengguna_list(client):
    """Test pengguna mengambil daftar riwayat donor miliknya -> 200."""
    # Buat satu data lalu pastikan bisa diambil oleh pemiliknya.
    pendonor = create_pendonor(client)
    pengguna_headers = _get_pengguna_headers(client)

    client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor["id_pendonor"]
    }, headers=pengguna_headers)

    response = client.get("/pengguna/riwayat-donor", headers=pengguna_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


def test_get_riwayat_donor_pengguna_detail(client):
    """Test pengguna mengambil detail riwayat donor miliknya -> 200."""
    # Ambil detail berdasarkan id riwayat yang dibuat.
    pendonor = create_pendonor(client)
    pengguna_headers = _get_pengguna_headers(client)

    created = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor["id_pendonor"]
    }, headers=pengguna_headers).json()
    riwayat_id = created["id_riwayat"]

    response = client.get(f"/pengguna/riwayat-donor/{riwayat_id}", headers=pengguna_headers)
    assert response.status_code == 200
    assert response.json()["id_riwayat"] == riwayat_id


def test_get_riwayat_donor_pengguna_detail_not_found(client):
    """Test pengguna mengambil detail riwayat donor tidak ada -> 404."""
    # Id tidak ada harus 404.
    pengguna_headers = _get_pengguna_headers(client)
    response = client.get("/pengguna/riwayat-donor/9999", headers=pengguna_headers)
    assert response.status_code == 404


def test_update_riwayat_donor_pengguna_success(client):
    """Test pengguna update riwayat donor -> 200, nilai golongan_darah berubah."""
    # Buat pendonor dengan golongan darah A+
    pendonor = create_pendonor(client, {"golongan_darah": "A+"})
    pengguna_headers = _get_pengguna_headers(client)

    created = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor["id_pendonor"]
    }, headers=pengguna_headers).json()
    riwayat_id = created["id_riwayat"]
    golongan_awal = created.get("golongan_darah")

    # Update ke nilai berbeda dari default.
    response = client.put(f"/pengguna/riwayat-donor/{riwayat_id}", json={
        "golongan_darah": "B+"
    }, headers=pengguna_headers)
    assert response.status_code == 200
    updated_data = response.json()
    assert updated_data["golongan_darah"] == "B+"
    assert updated_data["golongan_darah"] != golongan_awal


def test_update_riwayat_donor_pengguna_not_found(client):
    """Test pengguna update riwayat donor tidak ada -> 404."""
    # Update id yang tidak ada harus 404.
    pengguna_headers = _get_pengguna_headers(client)
    response = client.put("/pengguna/riwayat-donor/9999", json={
        "golongan_darah": "A+"
    }, headers=pengguna_headers)
    assert response.status_code == 404


def test_delete_riwayat_donor_pengguna_success(client):
    """Test pengguna hapus riwayat donor -> 204."""
    # Buat data lalu hapus oleh pengguna.
    pendonor = create_pendonor(client)
    pengguna_headers = _get_pengguna_headers(client)

    created = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor["id_pendonor"]
    }, headers=pengguna_headers).json()
    riwayat_id = created["id_riwayat"]

    response = client.delete(f"/pengguna/riwayat-donor/{riwayat_id}", headers=pengguna_headers)
    assert response.status_code == 204


def test_delete_riwayat_donor_pengguna_not_found(client):
    """Test pengguna hapus riwayat donor tidak ada -> 404."""
    # Hapus id yang tidak ada harus 404.
    pengguna_headers = _get_pengguna_headers(client)
    response = client.delete("/pengguna/riwayat-donor/9999", headers=pengguna_headers)
    assert response.status_code == 404


def test_pengguna_update_delete_after_verifikasi(client, admin_headers):
    """Test riwayat donor terverifikasi tidak bisa diubah/dihapus pengguna."""
    # Setelah diverifikasi admin, pengguna tidak boleh update/delete.
    pendonor = create_pendonor(client)
    pengguna_headers = _get_pengguna_headers(client)

    created = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor["id_pendonor"]
    }, headers=pengguna_headers).json()
    riwayat_id = created["id_riwayat"]

    verify = client.post(f"/riwayat-donor/{riwayat_id}/verifikasi", json={
        "status_verifikasi": True
    }, headers=admin_headers)
    assert verify.status_code == 200

    update_resp = client.put(f"/pengguna/riwayat-donor/{riwayat_id}", json={
        "golongan_darah": "B+"
    }, headers=pengguna_headers)
    assert update_resp.status_code == 400

    delete_resp = client.delete(f"/pengguna/riwayat-donor/{riwayat_id}", headers=pengguna_headers)
    assert delete_resp.status_code == 400


def test_verifikasi_riwayat_donor_unauthorized(client):
    """Test verifikasi tanpa admin -> 401."""
    # Verifikasi tanpa admin harus ditolak.
    pendonor = create_pendonor(client)
    created = client.post("/riwayat-donor", json={
        "id_pendonor": pendonor["id_pendonor"]
    }).json()
    riwayat_id = created["id_riwayat"]

    response = client.post(f"/riwayat-donor/{riwayat_id}/verifikasi", json={
        "status_verifikasi": True
    })
    assert response.status_code == 401


def test_riwayat_donor_filter_status_verifikasi(client, admin_headers):
    """Test filter status verifikasi pada riwayat donor."""
    # Buat dua data, verifikasi salah satu, lalu filter.
    pendonor_1 = create_pendonor(client, {"email": "verif1@example.com"})
    pendonor_2 = create_pendonor(client, {"email": "verif2@example.com"})

    created_1 = client.post("/riwayat-donor", json={"id_pendonor": pendonor_1["id_pendonor"]}).json()
    client.post("/riwayat-donor", json={"id_pendonor": pendonor_2["id_pendonor"]})

    client.post(f"/riwayat-donor/{created_1['id_riwayat']}/verifikasi", json={
        "status_verifikasi": True
    }, headers=admin_headers)

    response = client.get("/riwayat-donor?status_verifikasi=true")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all(item["status_verifikasi"] is True for item in data["riwayat_donor"])


def test_pengguna_cannot_access_other_pengguna_riwayat(client):
    """Test pengguna tidak bisa akses riwayat milik pengguna lain -> 404."""
    # Pengguna lain tidak boleh mengakses riwayat milik orang lain.
    pendonor = create_pendonor(client)
    pengguna_headers = _get_pengguna_headers(client, {"email": "pengguna1@example.com"})
    other_headers = _get_pengguna_headers(client, {"email": "pengguna2@example.com"})

    created = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor["id_pendonor"]
    }, headers=pengguna_headers).json()
    riwayat_id = created["id_riwayat"]

    response = client.get(f"/pengguna/riwayat-donor/{riwayat_id}", headers=other_headers)
    assert response.status_code == 404