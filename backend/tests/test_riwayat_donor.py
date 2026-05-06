"""Test CRUD riwayat donor endpoints."""


def _get_admin_headers(client, overrides=None):
    payload = {
        "email": "admin@example.com",
        "password": "AdminPass123",
        "nama_admin": "Admin Test"
    }
    if overrides:
        payload.update(overrides)
    response = client.post("/auth/admin/register", json=payload)
    assert response.status_code == 201

    login = client.post("/auth/admin/login", json={
        "email": payload["email"],
        "password": payload["password"]
    })
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _get_pengguna_headers(client, overrides=None):
    payload = {
        "email": "pengguna@example.com",
        "password": "UserPass123",
        "nama_pengguna": "Pengguna Test"
    }
    if overrides:
        payload.update(overrides)
    response = client.post("/auth/pengguna/register", json=payload)
    assert response.status_code == 201

    login = client.post("/auth/pengguna/login", json={
        "email": payload["email"],
        "password": payload["password"]
    })
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create_pendonor(client, overrides=None):
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
    return response.json()["id_pendonor"]


def test_create_riwayat_donor_success(client):
    """Test membuat riwayat donor -> 201."""
    pendonor_id = _create_pendonor(client)
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
    response = client.post("/riwayat-donor", json={
        "id_pendonor": 9999
    })
    assert response.status_code == 404


def test_get_riwayat_donor_list(client):
    """Test mengambil daftar riwayat donor -> 200."""
    pendonor_id = _create_pendonor(client)
    client.post("/riwayat-donor", json={
        "id_pendonor": pendonor_id
    })
    response = client.get("/riwayat-donor")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


def test_get_riwayat_donor_pagination(client):
    """Test pagination riwayat donor dengan skip & limit."""
    pendonor_id = _create_pendonor(client, {"email": "riwayat1@example.com"})
    pendonor_id_2 = _create_pendonor(client, {"email": "riwayat2@example.com"})
    pendonor_id_3 = _create_pendonor(client, {"email": "riwayat3@example.com"})

    client.post("/riwayat-donor", json={"id_pendonor": pendonor_id})
    client.post("/riwayat-donor", json={"id_pendonor": pendonor_id_2})
    client.post("/riwayat-donor", json={"id_pendonor": pendonor_id_3})

    response = client.get("/riwayat-donor?skip=0&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 3
    assert len(data["riwayat_donor"]) <= 2


def test_get_riwayat_donor_not_found(client):
    """Test mengambil riwayat donor yang tidak ada -> 404."""
    response = client.get("/riwayat-donor/9999")
    assert response.status_code == 404


def test_get_riwayat_donor_by_pendonor(client):
    """Test list riwayat donor berdasarkan pendonor."""
    pendonor_id = _create_pendonor(client, {"email": "pendonor.list@example.com"})
    pendonor_id_2 = _create_pendonor(client, {"email": "pendonor.list2@example.com"})

    client.post("/riwayat-donor", json={"id_pendonor": pendonor_id})
    client.post("/riwayat-donor", json={"id_pendonor": pendonor_id_2})

    response = client.get(f"/riwayat-donor/pendonor/{pendonor_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all(item["id_pendonor"] == pendonor_id for item in data["riwayat_donor"])


def test_create_riwayat_donor_pengguna_success(client):
    """Test pengguna membuat riwayat donor -> 201."""
    pendonor_id = _create_pendonor(client)
    pengguna_headers = _get_pengguna_headers(client)

    response = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor_id
    }, headers=pengguna_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["id_pendonor"] == pendonor_id
    assert data["status_verifikasi"] is False


def test_create_riwayat_donor_pengguna_unauthorized(client):
    """Test pengguna membuat riwayat donor tanpa token -> 401."""
    pendonor_id = _create_pendonor(client)
    response = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor_id
    })
    assert response.status_code == 401


def test_get_riwayat_donor_pengguna_list(client):
    """Test pengguna mengambil daftar riwayat donor miliknya -> 200."""
    pendonor_id = _create_pendonor(client)
    pengguna_headers = _get_pengguna_headers(client)

    client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor_id
    }, headers=pengguna_headers)

    response = client.get("/pengguna/riwayat-donor", headers=pengguna_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


def test_get_riwayat_donor_pengguna_detail(client):
    """Test pengguna mengambil detail riwayat donor miliknya -> 200."""
    pendonor_id = _create_pendonor(client)
    pengguna_headers = _get_pengguna_headers(client)

    created = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor_id
    }, headers=pengguna_headers).json()
    riwayat_id = created["id_riwayat"]

    response = client.get(f"/pengguna/riwayat-donor/{riwayat_id}", headers=pengguna_headers)
    assert response.status_code == 200
    assert response.json()["id_riwayat"] == riwayat_id


def test_get_riwayat_donor_pengguna_detail_not_found(client):
    """Test pengguna mengambil detail riwayat donor tidak ada -> 404."""
    pengguna_headers = _get_pengguna_headers(client)
    response = client.get("/pengguna/riwayat-donor/9999", headers=pengguna_headers)
    assert response.status_code == 404


def test_update_riwayat_donor_pengguna_success(client):
    """Test pengguna update riwayat donor -> 200."""
    pendonor_id = _create_pendonor(client)
    pengguna_headers = _get_pengguna_headers(client)

    created = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor_id
    }, headers=pengguna_headers).json()
    riwayat_id = created["id_riwayat"]

    response = client.put(f"/pengguna/riwayat-donor/{riwayat_id}", json={
        "golongan_darah": "A+"
    }, headers=pengguna_headers)
    assert response.status_code == 200
    assert response.json()["golongan_darah"] == "A+"


def test_update_riwayat_donor_pengguna_not_found(client):
    """Test pengguna update riwayat donor tidak ada -> 404."""
    pengguna_headers = _get_pengguna_headers(client)
    response = client.put("/pengguna/riwayat-donor/9999", json={
        "golongan_darah": "A+"
    }, headers=pengguna_headers)
    assert response.status_code == 404


def test_delete_riwayat_donor_pengguna_success(client):
    """Test pengguna hapus riwayat donor -> 204."""
    pendonor_id = _create_pendonor(client)
    pengguna_headers = _get_pengguna_headers(client)

    created = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor_id
    }, headers=pengguna_headers).json()
    riwayat_id = created["id_riwayat"]

    response = client.delete(f"/pengguna/riwayat-donor/{riwayat_id}", headers=pengguna_headers)
    assert response.status_code == 204


def test_delete_riwayat_donor_pengguna_not_found(client):
    """Test pengguna hapus riwayat donor tidak ada -> 404."""
    pengguna_headers = _get_pengguna_headers(client)
    response = client.delete("/pengguna/riwayat-donor/9999", headers=pengguna_headers)
    assert response.status_code == 404


def test_pengguna_update_delete_after_verifikasi(client):
    """Test riwayat donor terverifikasi tidak bisa diubah/dihapus pengguna."""
    pendonor_id = _create_pendonor(client)
    pengguna_headers = _get_pengguna_headers(client)
    admin_headers = _get_admin_headers(client)

    created = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor_id
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
    pendonor_id = _create_pendonor(client)
    created = client.post("/riwayat-donor", json={
        "id_pendonor": pendonor_id
    }).json()
    riwayat_id = created["id_riwayat"]

    response = client.post(f"/riwayat-donor/{riwayat_id}/verifikasi", json={
        "status_verifikasi": True
    })
    assert response.status_code == 401


def test_riwayat_donor_filter_status_verifikasi(client):
    """Test filter status verifikasi pada riwayat donor."""
    pendonor_id = _create_pendonor(client, {"email": "verif1@example.com"})
    pendonor_id_2 = _create_pendonor(client, {"email": "verif2@example.com"})
    admin_headers = _get_admin_headers(client)

    created_1 = client.post("/riwayat-donor", json={"id_pendonor": pendonor_id}).json()
    client.post("/riwayat-donor", json={"id_pendonor": pendonor_id_2})

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
    pendonor_id = _create_pendonor(client)
    pengguna_headers = _get_pengguna_headers(client, {"email": "pengguna1@example.com"})
    other_headers = _get_pengguna_headers(client, {"email": "pengguna2@example.com"})

    created = client.post("/pengguna/riwayat-donor", json={
        "id_pendonor": pendonor_id
    }, headers=pengguna_headers).json()
    riwayat_id = created["id_riwayat"]

    response = client.get(f"/pengguna/riwayat-donor/{riwayat_id}", headers=other_headers)
    assert response.status_code == 404