# LANGKAH-LANGKAH DEMO UTS - TraceIt

## Persiapan

1. Pastikan Docker Desktop sudah berjalan
2. Jalankan semua container:
   ```bash
   make up
   ```
3. Pastikan 3 container running:
   ```bash
   docker ps
   ```
4. Registrasi admin (jika belum ada) via Swagger `http://localhost:8000/docs`:
   ```
   POST /auth/admin/register
   {
     "nama_admin": "Admin TraceIt",
     "email": "admin@traceit.com",
     "password": "AdminTrace123"
   }
   ```

---

## Langkah 1 - Landing Page

1. Buka `http://localhost:3000`
2. Tunjukkan hero section, tentang, fitur, footer

---

## Langkah 2 - Stok Darah (Kondisi Awal)

1. Klik menu **Stok Darah** atau buka `http://localhost:3000/stock`
2. Tunjukkan semua stok masih 0

---

## Langkah 3 - Registrasi Pendonor

1. Buka `http://localhost:3000/register`
2. **Step 1 - Data Pribadi:**
   - Nama Lengkap: `Budi Santoso`
   - Email: `budi@student.itk.ac.id`
   - Jenis Kelamin: `Laki-laki`
   - Tanggal Lahir: `1999-05-15`
   - Umur: `26`
   - Alamat: `Jl. Soekarno Hatta KM 15, Balikpapan`
   - No. Telepon: `081234567890`
   - Klik **Selanjutnya**
3. **Step 2 - Data Fisik & Kesehatan:**
   - Berat Badan: `65`
   - Tinggi Badan: `170`
   - Golongan Darah: `O+`
   - Riwayat Kesehatan: `Tidak ada riwayat penyakit kronis`
   - Klik **Selanjutnya**
4. **Step 3 - Riwayat Donor:**
   - Tanggal Terakhir Donor: `2025-12-01`
   - Total Donor: `3`
   - Klik **Daftar**

---

## Langkah 4 - Registrasi & Login User

1. Buka `http://localhost:3000/user/register`
2. Isi:
   - Nama: `Budi Santoso`
   - Email: `budi@student.itk.ac.id`
   - Password: `BudiDonor123`
   - Konfirmasi Password: `BudiDonor123`
3. Klik **Daftar**
4. Login di `http://localhost:3000/login`:
   - Email: `budi@student.itk.ac.id`
   - Password: `BudiDonor123`
5. Klik **Masuk**

---

## Langkah 5 - Dashboard User

1. Tunjukkan kartu statistik dan tabel riwayat donor
2. Tunjukkan status verifikasi masih **Menunggu**
3. Klik **Edit** pada riwayat yang belum diverifikasi, ubah data, simpan
4. Logout

---

## Langkah 6 - Login Admin

1. Buka `http://localhost:3000/login?type=admin`
2. Login:
   - Email: `admin@traceit.com`
   - Password: `AdminTrace123`

---

## Langkah 7 - Dashboard Admin

1. Tunjukkan kartu statistik (total pendonor, terverifikasi, menunggu)
2. Tunjukkan Bar Chart distribusi golongan darah
3. Tunjukkan Pie Chart distribusi jenis kelamin

---

## Langkah 8 - Daftar Pendonor

1. Klik **Daftar Pendonor** di sidebar
2. Coba filter: nama, golongan darah, jenis kelamin, rentang umur
3. Klik salah satu pendonor untuk lihat detail

---

## Langkah 9 - Verifikasi Pendonor

1. Klik **Verifikasi** di sidebar
2. Klik salah satu item, lihat detail lengkap
3. Klik **Verifikasi/Setujui**
4. Tunjukkan data berpindah ke daftar terverifikasi

---

## Langkah 10 - Cek Stok Darah Lagi

1. Buka `http://localhost:3000/stock`
2. Tunjukkan stok golongan darah yang diverifikasi sudah bertambah

---

## Langkah 11 - Swagger UI

1. Buka `http://localhost:8000/docs`
2. Execute `GET /health` - tunjukkan response
3. Tunjukkan endpoint auth, pendonor, riwayat-donor, public

---

## Langkah 12 - Docker

1. Jalankan di terminal:
   ```bash
   docker ps
   ```
2. Tunjukkan 3 container: frontend, backend, db
3. Jalankan:
   ```bash
   docker images | findstr tracelt
   ```
4. Tunjukkan ukuran image yang sudah dioptimasi

---

## Langkah 13 - CI/CD

1. Buka repository GitHub > tab **Actions**
2. Tunjukkan workflow build & push Docker image

---

## Langkah 14 - Database Schema

1. Tunjukkan ERD: 4 tabel (admin, pengguna, pendonor, riwayat_donor)
2. Jelaskan relasi pendonor -> riwayat_donor <- pengguna

---

## Data Dummy

**Admin:**
- Email: `admin@traceit.com` / Password: `AdminTrace123`

**User:**
- Email: `budi@student.itk.ac.id` / Password: `BudiDonor123`

**Pendonor tambahan (opsional, daftar via `/register`):**

| Nama | Email | Golongan | JK |
|------|-------|----------|----|
| Siti Aminah | siti@student.itk.ac.id | A+ | Perempuan |
| Ahmad Rizki | ahmad@student.itk.ac.id | B+ | Laki-laki |
