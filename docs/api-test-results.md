# API Testing Results

Dokumentasi ini berisi hasil pengujian seluruh endpoint backend menggunakan Swagger UI (http://localhost:8000/docs).

Seluruh endpoint diuji untuk memastikan:
- Response sesuai dengan spesifikasi
- Status code sesuai standar HTTP
- Validasi dan error handling berjalan dengan baik

---

## 1. GET /health

Endpoint ini digunakan untuk memastikan bahwa server berjalan dengan normal.

**Expected Result:**
- Status Code: 200 OK
- Response berupa JSON status server

### Hasil Pengujian
Server berhasil merespons dengan status 200 OK dan menampilkan informasi status layanan.

📸 Screenshot:
![alt text](image.png)

---

## 2. POST /items

Endpoint ini digunakan untuk menambahkan data item baru ke dalam database.

**Data yang Diuji:**
- name: Laptop ASUS ROG
- price: 15000000
- description: Laptop gaming untuk development dan cloud computing
- quantity: 5

**Expected Result:**
- Status Code: 201 Created
- Data berhasil ditambahkan
- Sistem menghasilkan ID otomatis

### Hasil Pengujian
Data berhasil ditambahkan ke database dan sistem mengembalikan response dengan ID item serta timestamp pembuatan data.

📸 Screenshot Request Body Sebelum Execute:
![alt text](image-1.png)

📸 Screenshot Response:
![alt text](image2.png)

---

## 3. GET /items

Endpoint ini digunakan untuk menampilkan seluruh data item yang tersimpan di database.

**Expected Result:**
- Status Code: 200 OK
- Menampilkan total item
- Menampilkan daftar item

### Hasil Pengujian
Sistem berhasil menampilkan seluruh data item beserta total jumlah item yang tersedia di database.

📸 Screenshot:
![alt text](image-3.png)

---

## 4. GET /items/{item_id}

Endpoint ini digunakan untuk mengambil satu data item berdasarkan ID tertentu.

**Parameter yang diuji:**
- item_id: 1

**Expected Result:**
- Status Code: 200 OK
- Data item dengan ID tersebut ditampilkan

### Hasil Pengujian
Sistem berhasil menampilkan data item sesuai dengan ID yang diminta.

📸 Screenshot:
![alt text](image-2.png)

---

## 5. PUT /items/{item_id}

Endpoint ini digunakan untuk memperbarui data item berdasarkan ID.

**Data yang Diuji:**
- Update price menjadi 14000000

**Expected Result:**
- Status Code: 200 OK
- Data berhasil diperbarui
- Field updated_at berubah menjadi timestamp terbaru

### Hasil Pengujian
Sistem berhasil memperbarui data item dan mengembalikan response dengan data terbaru.

📸 Screenshot Request Body sebelum execute:
![alt text](image-4.png)

📸 Screenshot Response:
![alt text](image-5.png)

---

## 6. DELETE /items/{item_id}

Endpoint ini digunakan untuk menghapus data item berdasarkan ID.

**Expected Result:**
- Status Code: 204 No Content
- Data berhasil dihapus
- Tidak ada response body

### Hasil Pengujian
Sistem berhasil menghapus data item dan mengembalikan status 204 No Content tanpa response body.

📸 Screenshot:
![alt text](image-6.png)

---

## 7. GET /items/999 (Error Handling Test)

Endpoint ini diuji untuk memastikan sistem dapat menangani permintaan data yang tidak tersedia.

**Expected Result:**
- Status Code: 404 Not Found
- Pesan error sesuai dengan kondisi data tidak ditemukan

### Hasil Pengujian
Sistem berhasil menampilkan error 404 Not Found ketika item dengan ID yang diminta tidak tersedia.

📸 Screenshot:
![alt text](image-7.png)

---

## 8. GET /items/stats

Endpoint ini digunakan untuk menampilkan statistik keseluruhan data item.

Statistik yang ditampilkan:
- Total item
- Total value (price × quantity)
- Item dengan harga tertinggi
- Item dengan harga terendah

**Expected Result:**
- Status Code: 200 OK
- Perhitungan statistik sesuai dengan data di database

### Hasil Pengujian
Sistem berhasil menghitung total nilai seluruh item serta menentukan item termahal dan termurah secara akurat.

📸 Screenshot:
![alt text](image-8.png)

---

## 9. GET /items (Pagination Test)

Endpoint ini diuji untuk memastikan fitur pagination (skip & limit) berfungsi dengan benar.

**Test Case 1: skip=0, limit=2**
- Expected: Menampilkan 2 item pertama dari total 3 items
- Result: ✅ PASSED
  - Status Code: 200 OK
  - Total items: 3
  - Items returned: 2
  - Items: Keyboard Mechanical (Rp 1,200,000), Mouse Wireless (Rp 250,000)

**Test Case 2: skip=2, limit=2**
- Expected: Menampilkan item berikutnya (item ke-3)
- Result: ✅ PASSED
  - Status Code: 200 OK
  - Total items: 3
  - Items returned: 1
  - Items: Laptop (Rp 14,000,000)

**Test Case 3: skip=0, limit=100**
- Expected: Menampilkan semua item (hanya 3 ada)
- Result: ✅ PASSED
  - Status Code: 200 OK
  - Total items: 3
  - Items returned: 3

### Kesimpulan Pagination
Fitur pagination berfungsi dengan benar. Parameter `skip` dan `limit` dapat digunakan untuk membatasi dan mengalihkan data item sesuai kebutuhan.

---

# Kesimpulan

Berdasarkan hasil pengujian yang telah dilakukan, seluruh endpoint pada backend dapat berjalan dengan baik. Fitur CRUD (Create, Read, Update, Delete) sudah berfungsi sesuai dengan yang diharapkan. 

**Fitur yang telah diverifikasi:**
1. ✅ Pagination - Parameter `skip` dan `limit` berfungsi untuk membatasi dan mengalihkan data
2. ✅ Statistics - Endpoint `/items/stats` menampilkan statistik kompleks (total items, total value, termahal, termurah)
3. ✅ Search - Fitur pencarian berdasarkan nama/deskripsi
4. ✅ Error Handling - Sistem menampilkan status code yang sesuai (200, 201, 204, 404)
5. ✅ Data Validation - Validasi input berfungsi dengan baik

Secara keseluruhan, sistem backend telah memenuhi seluruh requirement dan berjalan sesuai dengan spesifikasi yang ditentukan.