# SCRIPT DEMO UTS - TraceIt

## Aplikasi Pengajuan Pendonor Darah Sukarela

**Mata Kuliah:** Cloud Computing
**Kelompok:** A - Miracle
**Anggota Tim:**

| Nama | NIM | Peran |
|------|-----|-------|
| Debora Intania Subekti | 10231029 | Lead Backend |
| Avhilla Catton Andalucia | 10231021 | Lead Container |
| Chelsy Olivia | 10231025 | Lead CI/CD & Deploy |
| Yosan Pratiwi | 10231091 | Lead Frontend |
| Betran | 10231023 | Lead QA & Docs |

---

## Ringkasan Aplikasi

TraceIt adalah aplikasi berbasis web untuk mengelola data pendonor darah sukarela di lingkungan civitas akademika Institut Teknologi Kalimantan. Aplikasi ini memiliki dua peran pengguna:

1. **Pengguna (User)** - Civitas akademika ITK yang berperan sebagai pendonor sukarela
2. **Admin** - Memantau dan memverifikasi data pendonor yang telah diajukan

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19 + Vite 6 + Tailwind CSS |
| Backend | FastAPI (Python 3.12) |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy 2.0 |
| Autentikasi | JWT (HS256) + bcrypt |
| Containerization | Docker (multi-stage build) |
| Web Server | Nginx Alpine |
| CI/CD | GitHub Actions |
| Deployment | Railway / Render |

---

## Arsitektur Sistem

```
[Browser] --> [Nginx + React SPA (:3000)] --/api/--> [FastAPI Backend (:8000)] --SQL--> [PostgreSQL (:5432)]
```

Semua service berjalan dalam Docker container yang terhubung melalui Docker bridge network.

---

## ALUR DEMO

### Persiapan Sebelum Demo

1. Pastikan Docker Desktop sudah berjalan
2. Jalankan semua container:
   ```bash
   make up
   ```
   atau:
   ```bash
   docker compose up -d --build
   ```
3. Tunggu hingga semua container healthy:
   ```bash
   docker ps
   ```
4. Pastikan 3 container berjalan:
   - `tracelt-frontend` (port 3000)
   - `tracelt-backend` (port 8000)
   - `tracelt-db` (port 5432)

---

### BAGIAN 1: Pengenalan & Landing Page (2 menit)

**Narasi:**
> "Selamat pagi/siang, kami dari Kelompok A Miracle akan mempresentasikan aplikasi TraceIt, yaitu aplikasi pengajuan pendonor darah sukarela untuk civitas akademika ITK."

**Langkah:**

1. Buka browser, akses `http://localhost:3000`
2. Tampilkan **Landing Page**:
   - Tunjukkan hero section dengan tagline aplikasi
   - Scroll ke bagian "Tentang TraceIt" - jelaskan tujuan aplikasi
   - Tunjukkan section fitur-fitur utama
   - Tunjukkan footer

**Poin yang disampaikan:**
- Latar belakang masalah: kurangnya informasi pendonor darah sukarela di ITK
- Solusi: platform terpusat berbasis cloud untuk pendataan pendonor

---

### BAGIAN 2: Stok Darah Publik - Kondisi Awal (1 menit)

**Narasi:**
> "Sebelum ada data, mari kita lihat halaman stok darah yang bisa diakses oleh siapa saja tanpa login."

**Langkah:**

1. Klik menu **"Stok Darah"** di navbar, atau akses `http://localhost:3000/stock`
2. Tunjukkan tabel stok darah per golongan (O+, O-, A+, A-, B+, B-, AB+, AB-)
3. Semua stok masih 0 karena belum ada data yang terverifikasi

**Poin yang disampaikan:**
- Halaman ini bersifat publik, tidak perlu login
- Stok hanya menghitung pendonor yang sudah diverifikasi oleh admin

---

### BAGIAN 3: Registrasi Pendonor Darah (3 menit)

**Narasi:**
> "Sekarang kita akan mendaftarkan seorang pendonor darah melalui form registrasi 3 langkah."

**Langkah:**

1. Klik tombol **"Daftar Jadi Pendonor"** di landing page, atau akses `http://localhost:3000/register`
2. **Step 1 - Data Pribadi:**
   - Nama Lengkap: `Budi Santoso`
   - Email: `budi@student.itk.ac.id`
   - Jenis Kelamin: `Laki-laki`
   - Tanggal Lahir: `1999-05-15`
   - Umur: `26`
   - Alamat: `Jl. Soekarno Hatta KM 15, Balikpapan`
   - No. Telepon: `081234567890`
   - Klik **"Selanjutnya"**

3. **Step 2 - Data Fisik & Kesehatan:**
   - Berat Badan: `65` kg
   - Tinggi Badan: `170` cm
   - Golongan Darah: `O+`
   - Riwayat Kesehatan: `Tidak ada riwayat penyakit kronis`
   - Klik **"Selanjutnya"**

4. **Step 3 - Riwayat Donor:**
   - Tanggal Terakhir Donor: `2025-12-01`
   - Total Donor Sebelumnya: `3`
   - Review semua data yang telah diisi
   - Klik **"Daftar"**

5. Tampilkan notifikasi sukses

**Poin yang disampaikan:**
- Form multi-step untuk UX yang lebih baik
- Validasi di setiap langkah (client-side)
- Data dikirim ke backend via REST API (POST /pendonor)

---

### BAGIAN 4: Registrasi & Login User (2 menit)

**Narasi:**
> "Selain mendaftar sebagai pendonor, pengguna juga bisa membuat akun untuk memantau riwayat donasi mereka."

**Langkah:**

1. Akses `http://localhost:3000/user/register`
2. Isi form registrasi user:
   - Nama: `Budi Santoso`
   - Email: `budi@student.itk.ac.id` *(email sama dengan pendonor agar auto-link)*
   - Password: `BudiDonor123`
   - Konfirmasi Password: `BudiDonor123`
3. Klik **"Daftar"**
4. Setelah berhasil, redirect ke halaman login
5. Login dengan:
   - Email: `budi@student.itk.ac.id`
   - Password: `BudiDonor123`
6. Klik **"Masuk"**

**Poin yang disampaikan:**
- Validasi password: minimal 8 karakter, huruf besar, huruf kecil, dan angka
- Sistem auto-linking: jika email user sama dengan email pendonor, riwayat donor otomatis terhubung
- Autentikasi menggunakan JWT token (HS256, expired 60 menit)

---

### BAGIAN 5: Dashboard User (2 menit)

**Narasi:**
> "Setelah login, pengguna bisa melihat dashboard pribadi mereka."

**Langkah:**

1. Setelah login, otomatis masuk ke `http://localhost:3000/user/dashboard`
2. Tunjukkan:
   - **Kartu statistik** - total riwayat donor, status verifikasi
   - **Tabel riwayat donor** - menampilkan data donor yang terhubung dengan akun
   - Status verifikasi masih **"Menunggu"** (belum diverifikasi admin)
3. Demonstrasikan fitur **Edit** pada riwayat yang belum diverifikasi:
   - Klik tombol edit pada salah satu riwayat
   - Ubah data (misalnya golongan darah)
   - Simpan perubahan
4. Jelaskan bahwa riwayat yang sudah diverifikasi **tidak bisa diedit atau dihapus**

**Poin yang disampaikan:**
- User hanya bisa melihat dan mengelola data miliknya sendiri
- Proteksi: riwayat yang sudah diverifikasi bersifat immutable
- Route dilindungi oleh JWT authentication (UserRoute)

---

### BAGIAN 6: Login Admin (1 menit)

**Narasi:**
> "Sekarang kita beralih ke sisi admin. Admin bertugas memverifikasi data pendonor."

**Langkah:**

1. Logout dari akun user (klik tombol logout di header)
2. Akses `http://localhost:3000/login?type=admin`
3. Login dengan kredensial admin:
   - Email: *(gunakan email admin yang sudah diregistrasi)*
   - Password: *(gunakan password admin)*

> **Catatan:** Jika belum ada admin, registrasi terlebih dahulu melalui API:
> ```
> POST http://localhost:8000/auth/admin/register
> Body: {
>   "nama_admin": "Admin TraceIt",
>   "email": "admin@traceit.com",
>   "password": "AdminTrace123"
> }
> ```
> Sistem hanya mengizinkan **1 admin** dalam database.

**Poin yang disampaikan:**
- Login admin dan user terpisah (dual authentication)
- Hanya boleh ada 1 admin dalam sistem (business rule)

---

### BAGIAN 7: Admin Dashboard (2 menit)

**Narasi:**
> "Ini adalah dashboard admin yang menampilkan statistik keseluruhan sistem."

**Langkah:**

1. Setelah login admin, masuk ke `http://localhost:3000/admin`
2. Tunjukkan:
   - **Kartu statistik**: Total pendonor, total terverifikasi, menunggu verifikasi
   - **Bar Chart**: Distribusi golongan darah (menggunakan Recharts)
   - **Pie Chart**: Distribusi jenis kelamin pendonor
3. Jelaskan bahwa data chart diambil secara real-time dari database

**Poin yang disampaikan:**
- Visualisasi data menggunakan library Recharts
- Data bersifat real-time, langsung dari database via API
- Dashboard membantu admin memantau kondisi keseluruhan

---

### BAGIAN 8: Daftar Pendonor (2 menit)

**Narasi:**
> "Admin bisa melihat seluruh daftar pendonor yang sudah terverifikasi beserta fitur filter."

**Langkah:**

1. Klik menu **"Daftar Pendonor"** di sidebar, atau akses `http://localhost:3000/admin/donors`
2. Tunjukkan tabel daftar pendonor
3. Demonstrasikan fitur **filter**:
   - Filter berdasarkan **nama** (ketik sebagian nama)
   - Filter berdasarkan **golongan darah** (pilih dari dropdown)
   - Filter berdasarkan **jenis kelamin**
   - Filter berdasarkan **rentang umur** (umur min - umur max)
4. Klik salah satu pendonor untuk melihat **detail lengkap** (modal)
5. Tunjukkan tombol **hapus** (hanya admin yang bisa menghapus pendonor)

**Poin yang disampaikan:**
- Fitur filter memudahkan pencarian pendonor spesifik
- Pagination untuk menangani data dalam jumlah besar
- Hanya admin yang memiliki akses hapus (role-based access control)

---

### BAGIAN 9: Verifikasi Pendonor - Fitur Utama (3 menit)

**Narasi:**
> "Ini adalah fitur utama aplikasi: verifikasi data pendonor oleh admin."

**Langkah:**

1. Klik menu **"Verifikasi"** di sidebar, atau akses `http://localhost:3000/admin/verify`
2. Tunjukkan antrian verifikasi (daftar riwayat donor yang belum diverifikasi)
3. Klik salah satu item untuk melihat **detail lengkap pendonor**:
   - Data pribadi (nama, email, jenis kelamin, umur)
   - Data fisik (berat badan, tinggi badan)
   - Data kesehatan (golongan darah, riwayat kesehatan)
   - Riwayat donor (tanggal terakhir, total donor)
4. **Approve (Setujui)** salah satu pendonor:
   - Klik tombol **"Verifikasi"** / **"Setujui"**
   - Tunjukkan notifikasi sukses
   - Data berpindah dari antrian ke daftar pendonor terverifikasi
   - `total_donor` pada pendonor otomatis bertambah 1
5. (Opsional) **Reject (Tolak)** pendonor lain:
   - Klik tombol **"Tolak"**
   - Data ditandai sebagai ditolak

**Poin yang disampaikan:**
- Workflow verifikasi memastikan kualitas data pendonor
- Setelah diverifikasi, total_donor otomatis di-increment oleh backend
- Admin memiliki kontrol penuh atas validitas data

---

### BAGIAN 10: Cek Stok Darah Setelah Verifikasi (1 menit)

**Narasi:**
> "Setelah admin memverifikasi pendonor, mari kita lihat perubahan pada stok darah."

**Langkah:**

1. Buka tab baru atau akses `http://localhost:3000/stock`
2. Tunjukkan bahwa stok darah golongan **O+** (atau golongan yang diverifikasi) sekarang bertambah
3. Bandingkan dengan kondisi awal yang masih 0

**Poin yang disampaikan:**
- Stok darah hanya menghitung pendonor yang sudah diverifikasi
- Data terupdate secara real-time
- Halaman ini tetap bisa diakses publik tanpa login

---

### BAGIAN 11: Demonstrasi API - Swagger UI (2 menit)

**Narasi:**
> "Seluruh fitur di frontend didukung oleh REST API yang terdokumentasi lengkap."

**Langkah:**

1. Buka `http://localhost:8000/docs` (Swagger UI)
2. Tunjukkan endpoint-endpoint utama:
   - **Health Check**: `GET /health` - coba execute, tunjukkan response
   - **Auth**: `POST /auth/pengguna/login` - tunjukkan struktur request/response
   - **Pendonor**: `GET /pendonor` - tunjukkan list pendonor dengan filter
   - **Riwayat Donor**: `GET /riwayat-donor` - tunjukkan data riwayat
   - **Public**: `GET /api/public/blood-stock` - tunjukkan stok darah via API
3. Demonstrasikan satu API call langsung dari Swagger:
   - Execute `GET /health`
   - Tunjukkan response: `{"status": "healthy", "service": "TraceIt API", "version": "1.0.0"}`

**Poin yang disampaikan:**
- FastAPI otomatis generate dokumentasi Swagger/OpenAPI
- Semua endpoint menggunakan standar HTTP method dan status code
- Validasi request menggunakan Pydantic schema

---

### BAGIAN 12: Arsitektur Docker & Deployment (3 menit)

**Narasi:**
> "Aplikasi ini di-containerize menggunakan Docker untuk memudahkan deployment."

**Langkah:**

1. Buka terminal, jalankan:
   ```bash
   docker ps
   ```
2. Tunjukkan 3 container yang berjalan:
   - `tracelt-frontend` - Nginx + React (port 3000)
   - `tracelt-backend` - FastAPI (port 8000)
   - `tracelt-db` - PostgreSQL 15 (port 5432)

3. Jelaskan arsitektur Docker:
   ```
   [Browser :3000] --> [Nginx (reverse proxy)] --/api/--> [FastAPI :8000] --> [PostgreSQL :5432]
   ```

4. Tunjukkan optimasi Docker image:
   ```bash
   docker images | findstr tracelt
   ```
   - Frontend: ~93.8 MB (multi-stage: node build + nginx serve)
   - Backend: ~216 MB (multi-stage: python alpine + non-root user)

5. (Opsional) Tunjukkan Dockerfile salah satu service:
   - Jelaskan multi-stage build
   - Jelaskan security best practice (non-root user, healthcheck)

**Poin yang disampaikan:**
- Multi-stage build untuk optimasi ukuran image
- Nginx sebagai reverse proxy (forward /api/ ke backend)
- SPA routing: semua route di-fallback ke index.html
- Security headers (X-Frame-Options, CSP, HSTS)
- Volume untuk persistensi data PostgreSQL

---

### BAGIAN 13: CI/CD Pipeline (2 menit)

**Narasi:**
> "Kami juga mengimplementasikan CI/CD menggunakan GitHub Actions."

**Langkah:**

1. Buka repository GitHub di browser
2. Klik tab **Actions**
3. Tunjukkan workflow yang sudah berjalan:
   - Build & push Docker image ke Docker Hub
   - Automated testing (jika ada)
4. Jelaskan alur CI/CD:
   ```
   Push ke GitHub --> GitHub Actions trigger --> Build Docker Image --> Push ke Docker Hub --> Deploy
   ```

**Poin yang disampaikan:**
- Otomasi build dan deployment
- Konsistensi environment antara development dan production
- Integrasi dengan Docker Hub sebagai container registry

---

### BAGIAN 14: Database Schema (1 menit)

**Narasi:**
> "Berikut adalah struktur database yang kami gunakan."

**Langkah:**

1. Tampilkan ERD (bisa dari docs atau slide):

   ```
   ┌──────────┐     ┌──────────────┐     ┌───────────────┐
   │  admin   │     │   pengguna   │     │   pendonor    │
   ├──────────┤     ├──────────────┤     ├───────────────┤
   │ id_admin │     │ id_pengguna  │──┐  │ id_pendonor   │──┐
   │ nama     │     │ nama         │  │  │ nama_lengkap  │  │
   │ email    │     │ email        │  │  │ email         │  │
   │ password │     │ password     │  │  │ golongan_darah│  │
   └──────────┘     │ created_at   │  │  │ jenis_kelamin │  │
                    └──────────────┘  │  │ berat_badan   │  │
                                      │  │ tinggi_badan  │  │
                                      │  │ umur          │  │
                                      │  │ tanggal_lahir │  │
                                      │  │ alamat        │  │
                                      │  │ no_telepon    │  │
                                      │  │ riwayat_kes.  │  │
                                      │  │ total_donor   │  │
                                      │  │ created_at    │  │
                                      │  └───────────────┘  │
                                      │                     │
                                      │  ┌───────────────┐  │
                                      └──│ riwayat_donor │──┘
                                         ├───────────────┤
                                         │ id_riwayat    │
                                         │ id_pendonor(FK)│
                                         │ id_pengguna(FK)│
                                         │ golongan_darah│
                                         │ status_verif. │
                                         └───────────────┘
   ```

2. Jelaskan relasi:
   - **pendonor** 1:N **riwayat_donor** (cascade delete)
   - **pengguna** 1:N **riwayat_donor**
   - **admin** berdiri sendiri (maksimal 1 record)

**Poin yang disampaikan:**
- 4 tabel utama dengan relasi yang jelas
- Auto-linking antara pengguna dan pendonor berdasarkan email
- Status verifikasi sebagai kontrol kualitas data

---

## PENUTUP (1 menit)

**Narasi:**
> "Demikian demo aplikasi TraceIt dari Kelompok A Miracle. Aplikasi ini menerapkan arsitektur cloud computing dengan pemisahan frontend, backend, dan database dalam container terpisah. Kami menggunakan CI/CD untuk otomasi deployment dan Docker untuk konsistensi environment."

**Ringkasan fitur yang sudah didemonstrasikan:**

1. Landing page responsif
2. Stok darah publik (real-time)
3. Registrasi pendonor multi-step (3 langkah)
4. Registrasi & login user dengan JWT
5. Dashboard user dengan riwayat donor
6. Login admin terpisah
7. Dashboard admin dengan visualisasi data
8. Daftar pendonor dengan filter
9. Verifikasi pendonor oleh admin
10. REST API terdokumentasi (Swagger)
11. Containerization dengan Docker
12. CI/CD dengan GitHub Actions

---

## ESTIMASI WAKTU

| Bagian | Durasi |
|--------|--------|
| Pengenalan & Landing Page | 2 menit |
| Stok Darah Publik (awal) | 1 menit |
| Registrasi Pendonor | 3 menit |
| Registrasi & Login User | 2 menit |
| Dashboard User | 2 menit |
| Login Admin | 1 menit |
| Dashboard Admin | 2 menit |
| Daftar Pendonor | 2 menit |
| Verifikasi Pendonor | 3 menit |
| Stok Darah (setelah verifikasi) | 1 menit |
| Swagger UI / API | 2 menit |
| Docker & Deployment | 3 menit |
| CI/CD Pipeline | 2 menit |
| Database Schema | 1 menit |
| Penutup | 1 menit |
| **TOTAL** | **~28 menit** |

---

## DATA DUMMY UNTUK DEMO

### Admin
```json
{
  "nama_admin": "Admin TraceIt",
  "email": "admin@traceit.com",
  "password": "AdminTrace123"
}
```

### User / Pengguna
```json
{
  "nama_pengguna": "Budi Santoso",
  "email": "budi@student.itk.ac.id",
  "password": "BudiDonor123"
}
```

### Pendonor 1
```json
{
  "nama_lengkap": "Budi Santoso",
  "email": "budi@student.itk.ac.id",
  "jenis_kelamin": "Laki-laki",
  "berat_badan": 65.0,
  "tinggi_badan": 170.0,
  "golongan_darah": "O+",
  "umur": 26,
  "tanggal_lahir": "1999-05-15",
  "tanggal_terakhir_donor": "2025-12-01",
  "total_donor": 3,
  "alamat": "Jl. Soekarno Hatta KM 15, Balikpapan",
  "no_telepon": "081234567890",
  "riwayat_kesehatan": "Tidak ada riwayat penyakit kronis"
}
```

### Pendonor 2 (tambahan untuk variasi data)
```json
{
  "nama_lengkap": "Siti Aminah",
  "email": "siti@student.itk.ac.id",
  "jenis_kelamin": "Perempuan",
  "berat_badan": 55.0,
  "tinggi_badan": 160.0,
  "golongan_darah": "A+",
  "umur": 22,
  "tanggal_lahir": "2003-08-20",
  "tanggal_terakhir_donor": "2026-01-10",
  "total_donor": 1,
  "alamat": "Jl. MT Haryono No. 10, Balikpapan",
  "no_telepon": "082345678901",
  "riwayat_kesehatan": "Sehat, tidak ada alergi"
}
```

### Pendonor 3 (tambahan untuk variasi golongan darah)
```json
{
  "nama_lengkap": "Ahmad Rizki",
  "email": "ahmad@student.itk.ac.id",
  "jenis_kelamin": "Laki-laki",
  "berat_badan": 72.0,
  "tinggi_badan": 175.0,
  "golongan_darah": "B+",
  "umur": 24,
  "tanggal_lahir": "2001-03-12",
  "tanggal_terakhir_donor": null,
  "total_donor": 0,
  "alamat": "Jl. Mulawarman No. 5, Balikpapan",
  "no_telepon": "083456789012",
  "riwayat_kesehatan": "Sehat"
}
```

---

## CHECKLIST SEBELUM DEMO

- [ ] Docker Desktop sudah berjalan
- [ ] Semua 3 container sudah running dan healthy
- [ ] Database sudah bersih (atau sudah ada data sesuai kebutuhan)
- [ ] Admin sudah diregistrasi (hanya 1 admin)
- [ ] Browser sudah terbuka di `http://localhost:3000`
- [ ] Tab Swagger UI sudah disiapkan di `http://localhost:8000/docs`
- [ ] Terminal sudah terbuka untuk menunjukkan Docker commands
- [ ] Koneksi internet stabil (jika demo CI/CD dari GitHub)
- [ ] Data dummy sudah disiapkan (copy-paste ready)
- [ ] Slide presentasi sudah disiapkan (jika ada)

---

## ANTISIPASI MASALAH

| Masalah | Solusi |
|---------|--------|
| Container tidak mau start | Cek `docker logs tracelt-backend`, pastikan DB sudah ready |
| Port 3000/8000 sudah dipakai | Hentikan proses lain atau ubah port di docker-compose |
| Login gagal | Pastikan password memenuhi syarat (8 char, uppercase, lowercase, digit) |
| Data tidak muncul | Cek koneksi backend-database, lihat log backend |
| Swagger UI tidak bisa diakses | Pastikan backend container running, cek `http://localhost:8000/health` |
| Stok darah tidak berubah | Pastikan verifikasi berhasil, stok hanya hitung yang terverifikasi |
| Auto-link tidak bekerja | Pastikan email pendonor dan pengguna **persis sama** |
