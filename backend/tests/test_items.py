# """Test CRUD item endpoints."""


# def test_create_item(client, auth_headers):
#     """Test membuat item baru → 201."""
#     response = client.post("/items", json={
#         "name": "Laptop",
#         "description": "Laptop untuk cloud computing",
#         "price": 15000000,
#         "quantity": 5
#     }, headers=auth_headers)
#     assert response.status_code == 201
#     data = response.json()
#     assert data["name"] == "Laptop"
#     assert data["price"] == 15000000
#     assert "id" in data


# def test_create_item_unauthorized(client):
#     """Test membuat item tanpa login → 401."""
#     response = client.post("/items", json={
#         "name": "Laptop",
#         "price": 15000000,
#         "quantity": 1
#     })
#     assert response.status_code == 401


# def test_get_items(client, auth_headers):
#     """Test mengambil daftar items → 200."""
#     # Buat 2 items
#     client.post("/items", json={
#         "name": "Laptop", "price": 15000000, "quantity": 1
#     }, headers=auth_headers)
#     client.post("/items", json={
#         "name": "Mouse", "price": 250000, "quantity": 3
#     }, headers=auth_headers)

#     response = client.get("/items", headers=auth_headers)
#     assert response.status_code == 200
#     data = response.json()
#     assert data["total"] >= 2


# def test_get_item_not_found(client, auth_headers):
#     """Test mengambil item yang tidak ada → 404."""
#     response = client.get("/items/9999", headers=auth_headers)
#     assert response.status_code == 404


# def test_update_item(client, auth_headers):
#     """Test update item → data berubah."""
#     # Buat item
#     create_resp = client.post("/items", json={
#         "name": "Laptop", "price": 15000000, "quantity": 1
#     }, headers=auth_headers)
#     item_id = create_resp.json()["id"]

#     # Update
#     response = client.put(f"/items/{item_id}", json={
#         "price": 14000000
#     }, headers=auth_headers)
#     assert response.status_code == 200
#     assert response.json()["price"] == 14000000


# def test_delete_item(client, auth_headers):
#     """Test hapus item → 204, lalu GET → 404."""
#     # Buat item
#     create_resp = client.post("/items", json={
#         "name": "Temporary", "price": 100, "quantity": 1
#     }, headers=auth_headers)
#     item_id = create_resp.json()["id"]

#     # Hapus
#     response = client.delete(f"/items/{item_id}", headers=auth_headers)
#     assert response.status_code == 204

#     # Verifikasi sudah tidak ada
#     get_resp = client.get(f"/items/{item_id}", headers=auth_headers)
#     assert get_resp.status_code == 404


# def test_search_items(client, auth_headers):
#     """Test search item berdasarkan nama."""
#     client.post("/items", json={
#         "name": "Laptop Gaming", "price": 20000000, "quantity": 1
#     }, headers=auth_headers)
#     client.post("/items", json={
#         "name": "Mouse Wireless", "price": 350000, "quantity": 2
#     }, headers=auth_headers)

#     response = client.get("/items?search=laptop", headers=auth_headers)
#     assert response.status_code == 200
#     data = response.json()
#     assert data["total"] >= 1
#     assert any("laptop" in item["name"].lower() for item in data["items"])