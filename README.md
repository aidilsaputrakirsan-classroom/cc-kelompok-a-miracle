# 🩸 Tracelt<font color="gray"><sup><sup>by Miracle</sup><sup></font>

## Pengajuan Pendonor Darah

<div align="justify">
TraceIt merupakan aplikasi berbasis web yang dirancang untuk membantu civitas akademika Institut Teknologi Kalimantan dalam mengajukan permohonan data pendonor darah sukarela. Melalui platform ini, pengguna dapat mengunggah data pribadi, berupa nama lengkap, jenis kelamin, berat badan, tinggi badan, golongan darah, usia, tanggal lahir, tanggal terakhir donor, riwayat donor (total donor), alamat dan riwayat kesehatan. Sistem akan menampilkan daftar laporan pendonor sukarela yang dapat difilter berdasarkan nama, jenis kelamin, umur dan golongan darah untuk mempermudah proses verifikasi kesiapan pendonor dalam menjadi pendonor darah.

Aplikasi ini ditujukan bagi 2 pengguna. Pertama, adalah civitas akademika Institut Teknologi Kalimantan yang berperan sebagai pendonor sukarela. Kedua, adalah admin yang berperan dalam memantau dan memverifikasi data pendonor yang telah diajukan.

Sistem TraceIt ini berperan dalam mengatasi permasalahan adanya kekurangan informasi terkait penyedia sukarelawan donor darah yang dapat diakses penerima di lingkungan civitas akademika Institut Teknologi Kalimantan. TraceIt hadir sebagai solusi terpusat berbasis cloud yang memungkinkan pengelolaan data secara sistematis, aman, dan dapat diakses kapan saja serta dari berbagai perangkat. Dengan demikian, proses pendataan pendonor sukarelawan menjadi lebih cepat, transparan, dan efisien.

</div>

## 👥 Team

| NAMA                     | NIM      | TUGAS               |
| :----------------------- | :------- | :------------------ |
| Debora Intania Subekti   | 10231029 | Lead Backend        |
| Avhilla Catton Andalucia | 10231021 | Lead Container      |
| Chelsy Olivia            | 10231025 | Lead CI/CD & Deploy |
| Yosan Pratiwi            | 10231091 | Lead Frontend       |
| Betran                   | 10231023 | Lead QA & Docs      |

## 🛠️ Tech Stack

| Teknologi        | Fungsi           |
| ---------------- | ---------------- |
| _FastAPI_        | Backend REST API |
| _React_          | Frontend SPA     |
| _PostgreSQL_     | Database         |
| _Docker_         | Containerization |
| _GitHub Actions_ | CI/CD            |
| _Railway/Render_ | Cloud Deployment |

## 🏛️ Architecture

### System Overview

```
                        ┌─────────────────────────────────────────────────┐
                        │            Docker Network (bridge)              │
                        │         cc-kelompok-a-miracle_default           │
                        │                                                 │
  ┌──────────┐          │  ┌──────────────┐    ┌──────────────────────┐   │
  │  User /  │  :3000   │  │  tracelt-    │    │   tracelt-backend    │   │
  │ Browser  │◄────────►│  │  frontend    │    │                      │   │
  │          │          │  │              │    │   FastAPI + Uvicorn   │   │
  │          │  :8000   │  │  Nginx +     │    │   (Port 8000)        │   │
  │          │◄────────►│  │  React SPA   │    │                      │   │
  └──────────┘          │  │  (Port 80)   │    └──────────┬───────────┘   │
                        │  └──────────────┘               │               │
                        │                                 │ SQL           │
                        │                    ┌────────────▼────────────┐  │
                        │                    │     tracelt-db          │  │
                        │                    │     PostgreSQL 15       │  │
                        │                    │     (Port 5432)         │  │
                        │                    │     Volume: pgdata      │  │
                        │                    └─────────────────────────┘  │
                        └─────────────────────────────────────────────────┘
```

> **Catatan:** Frontend container (Nginx) hanya menyajikan file statis React. Request API dilakukan langsung oleh browser user ke `localhost:8000`, bukan dari frontend container ke backend.

| Komponen                      | Penjelasan                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------- |
| **User/Browser**              | Pengguna mengakses aplikasi lewat browser                                     |
| **tracelt-frontend** (Nginx)  | Menyajikan halaman React ke browser, port 3000                                |
| **tracelt-backend** (FastAPI) | Memproses logic bisnis & API, port 8000                                       |
| **tracelt-db** (PostgreSQL)   | Menyimpan semua data aplikasi, port 5432                                      |
| **Docker Network**            | Jaringan internal agar ketiga container bisa saling berkomunikasi             |
| **Volume pgdata**             | Menyimpan data database secara permanen (tidak hilang saat container restart) |

---

### Backend Architecture

Backend menggunakan **FastAPI** dengan arsitektur berlapis (layered architecture):

```
┌─────────────────────────────────────────────┐
│                  main.py                     │
│          (Routes & Endpoints)                │
│   /auth/*  /pendonor/*  /riwayat-donor/*     │
│   /pengguna/*  /health  /info                │
├─────────────────────────────────────────────┤
│                  auth.py                     │
│          (Authentication Layer)              │
│   JWT Token (HS256) + bcrypt password hash   │
│   get_current_admin / get_current_pengguna   │
├─────────────────────────────────────────────┤
│                  crud.py                     │
│          (Business Logic Layer)              │
│   CRUD operations + auto-linking logic       │
│   Verification workflow + pagination         │
├─────────────────────────────────────────────┤
│               schemas.py                     │
│          (Validation Layer)                  │
│   Pydantic v2 models + password validation   │
├─────────────────────────────────────────────┤
│               models.py                      │
│          (ORM / Data Layer)                  │
│   SQLAlchemy models + relationships          │
├─────────────────────────────────────────────┤
│              database.py                     │
│          (Database Connection)               │
│   PostgreSQL via psycopg2 + SessionLocal     │
└─────────────────────────────────────────────┘
```

| Layer              | File          | Penjelasan                                                                 |
| ------------------ | ------------- | -------------------------------------------------------------------------- |
| **Routes**         | `main.py`     | Menerima HTTP request dan mengarahkan ke fungsi yang tepat                 |
| **Authentication** | `auth.py`     | Mengecek siapa yang login (JWT token + password hashing)                   |
| **Business Logic** | `crud.py`     | Mengolah data: buat, baca, update, hapus + verifikasi donor                |
| **Validation**     | `schemas.py`  | Memastikan data yang masuk sesuai format (email valid, password kuat, dll) |
| **ORM/Data**       | `models.py`   | Mendefinisikan struktur tabel database dalam kode Python                   |
| **Connection**     | `database.py` | Menghubungkan aplikasi ke PostgreSQL                                       |

#### API Endpoints

| Method   | Endpoint                         | Auth  | Deskripsi                                |
| -------- | -------------------------------- | ----- | ---------------------------------------- |
| `GET`    | `/health`                        | -     | Health check                             |
| `GET`    | `/info`                          | -     | System info & feature list               |
| `GET`    | `/api/public/blood-stock`        | -     | Stok darah publik per golongan           |
| `POST`   | `/auth/admin/register`           | -     | Registrasi admin (maks 1)                |
| `POST`   | `/auth/admin/login`              | -     | Login admin, return JWT                  |
| `POST`   | `/auth/pengguna/register`        | -     | Registrasi pengguna                      |
| `POST`   | `/auth/pengguna/login`           | -     | Login pengguna, return JWT               |
| `POST`   | `/pendonor`                      | -     | Buat data pendonor baru                  |
| `GET`    | `/pendonor`                      | -     | List pendonor + filter & pagination      |
| `GET`    | `/pendonor/{id}`                 | -     | Detail pendonor                          |
| `PUT`    | `/pendonor/{id}`                 | -     | Update data pendonor                     |
| `DELETE` | `/pendonor/{id}`                 | Admin | Hapus pendonor (admin only)              |
| `POST`   | `/riwayat-donor`                 | -     | Buat riwayat donor                       |
| `GET`    | `/riwayat-donor`                 | -     | List riwayat donor                       |
| `POST`   | `/riwayat-donor/{id}/verifikasi` | Admin | Verifikasi/tolak riwayat donor           |
| `GET`    | `/pengguna/me`                   | User  | Profil pengguna saat ini                 |
| `POST`   | `/pengguna/riwayat-donor`        | User  | Buat riwayat donor (linked ke user)      |
| `GET`    | `/pengguna/riwayat-donor`        | User  | List riwayat donor milik user            |
| `PUT`    | `/pengguna/riwayat-donor/{id}`   | User  | Update riwayat (jika belum diverifikasi) |
| `DELETE` | `/pengguna/riwayat-donor/{id}`   | User  | Hapus riwayat (jika belum diverifikasi)  |

---

### Frontend Architecture

Frontend menggunakan **React 18** dengan **Vite** sebagai build tool:

```
┌──────────────────────────────────────────────────┐
│                    App.jsx                        │
│              (React Router v6)                    │
├──────────────────────────────────────────────────┤
│                                                   │
│  Public Routes          Protected Routes          │
│  ┌────────────────┐     ┌──────────────────────┐  │
│  │ /              │     │ /admin/*  (AdminRoute)│  │
│  │  LandingPage   │     │  ├─ AdminDashboard   │  │
│  │ /login         │     │  ├─ DonorList        │  │
│  │  Login         │     │  └─ VerificationQueue│  │
│  │ /register      │     ├──────────────────────┤  │
│  │  DonorRegistr. │     │ /user/*  (UserRoute) │  │
│  │ /user/register │     │  └─ UserDashboard    │  │
│  │  UserRegister  │     └──────────────────────┘  │
│  │ /stock         │                               │
│  │  PublicStock   │     Layouts                    │
│  └────────────────┘     ┌──────────────────────┐  │
│                         │ AdminLayout (sidebar) │  │
│  Components             │ Header (navbar)       │  │
│  ┌────────────────┐     └──────────────────────┘  │
│  │ Header.jsx     │                               │
│  │ AdminLayout.jsx│                               │
│  └────────────────┘                               │
└──────────────────────────────────────────────────┘
```

| Halaman               | Route             | Penjelasan                            |
| --------------------- | ----------------- | ------------------------------------- |
| **LandingPage**       | `/`               | Halaman utama dengan info aplikasi    |
| **Login**             | `/login`          | Form login untuk admin dan user       |
| **DonorRegistration** | `/register`       | Form pendaftaran pendonor (3 langkah) |
| **UserRegister**      | `/user/register`  | Form registrasi akun pengguna baru    |
| **PublicStock**       | `/stock`          | Tabel stok darah publik per golongan  |
| **AdminDashboard**    | `/admin`          | Dashboard statistik donor (grafik)    |
| **DonorList**         | `/admin/donors`   | Daftar pendonor + search & filter     |
| **VerificationQueue** | `/admin/verify`   | Antrian verifikasi data donor         |
| **UserDashboard**     | `/user/dashboard` | Riwayat donor milik user              |

**Tech stack frontend:**

| Library         | Fungsi                      |
| --------------- | --------------------------- |
| React Router v6 | Client-side routing         |
| Axios           | HTTP client untuk API calls |
| Tailwind CSS    | Utility-first styling       |
| Framer Motion   | Animasi & transisi          |
| Recharts        | Grafik (BarChart, PieChart) |
| Lucide React    | Icon library                |
| date-fns        | Format tanggal (locale ID)  |

---

### Authentication Flow

```
┌──────────┐         ┌──────────────┐         ┌────────────┐
│  Client  │         │   FastAPI    │         │ PostgreSQL │
│ (Browser)│         │   Backend    │         │            │
└────┬─────┘         └──────┬───────┘         └─────┬──────┘
     │                      │                       │
     │  POST /auth/login    │                       │
     │  {email, password}   │                       │
     │─────────────────────►│                       │
     │                      │  SELECT user by email │
     │                      │──────────────────────►│
     │                      │◄──────────────────────│
     │                      │                       │
     │                      │  Verify bcrypt hash   │
     │                      │  Generate JWT (HS256) │
     │                      │  payload: {sub, type} │
     │                      │  expires: 60 min      │
     │  {access_token}      │                       │
     │◄─────────────────────│                       │
     │                      │                       │
     │  Store token in      │                       │
     │  localStorage        │                       │
     │  (admin_token /      │                       │
     │   user_token)        │                       │
     │                      │                       │
     │  GET /pendonor       │                       │
     │  Authorization:      │                       │
     │  Bearer <token>      │                       │
     │─────────────────────►│                       │
     │                      │  Decode & validate    │
     │                      │  JWT token            │
     │                      │  Check user_type      │
     │  {data}              │                       │
     │◄─────────────────────│                       │
     └──────────────────────┴───────────────────────┘
```

**Dua role pengguna:**

- **Admin** — Memverifikasi data donor, menghapus pendonor, melihat dashboard statistik
- **Pengguna (User)** — Mendaftarkan diri sebagai pendonor, mengelola riwayat donor sendiri

---

### Database Schema

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    admin     │       │  riwayat_donor   │       │   pengguna   │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id_admin PK  │       │ id_riwayat PK    │       │id_pengguna PK│
│ nama_admin   │       │ id_pendonor FK ──┼──┐    │nama_pengguna │
│ email (UQ)   │       │ id_pengguna FK ──┼──┼──► │ email (UQ)   │
│ password     │       │ golongan_darah   │  │    │ password     │
└──────────────┘       │ status_verifikasi│  │    │ created_at   │
                       └──────────────────┘  │    └──────────────┘
                                             │
                       ┌─────────────────────▼──┐
                       │       pendonor         │
                       ├────────────────────────┤
                       │ id_pendonor PK         │
                       │ nama_lengkap           │
                       │ email                  │
                       │ jenis_kelamin (enum)   │
                       │ berat_badan            │
                       │ tinggi_badan           │
                       │ golongan_darah (enum)  │
                       │ umur                   │
                       │ tanggal_lahir          │
                       │ tanggal_terakhir_donor │
                       │ total_donor            │
                       │ alamat                 │
                       │ no_telepon             │
                       │ riwayat_kesehatan      │
                       │ created_at             │
                       └────────────────────────┘

Relasi:
  pendonor  1 ──── N  riwayat_donor  (satu pendonor, banyak riwayat)
  pengguna  1 ──── N  riwayat_donor  (satu pengguna, banyak riwayat)
```

**Auto-linking logic:**

- Saat pengguna registrasi, jika ada pendonor dengan email yang sama, `riwayat_donor` otomatis dibuat untuk menghubungkan keduanya
- Saat pendonor dibuat, jika ada pengguna dengan email yang sama, `riwayat_donor` otomatis dibuat

---

### Docker Container Architecture

| Container          | Image                    | Base                            | Port Mapping | Fungsi                    |
| ------------------ | ------------------------ | ------------------------------- | ------------ | ------------------------- |
| `tracelt-frontend` | `tracelt-frontend:v1-fe` | `node:20-slim` + `nginx:alpine` | `3000:80`    | Serve React SPA via Nginx |
| `tracelt-backend`  | `tracelt-backend:v1`     | `python:3.12-alpine`            | `8000:8000`  | FastAPI REST API          |
| `tracelt-db`       | `postgres:15`            | `postgres:15`                   | `5433:5432`  | PostgreSQL database       |

**Network:** `cc-kelompok-a-miracle_default` (bridge) — menghubungkan ketiga container
**Volume:** `pgdata` — persistent storage untuk data PostgreSQL

**Optimasi Docker Image:**

| Image    | Sebelum | Sesudah | Pengurangan |
| -------- | ------- | ------- | ----------- |
| Backend  | ~1.2 GB | 216 MB  | ~82%        |
| Frontend | ~1.1 GB | 93.8 MB | ~91%        |

Teknik: multi-stage build, Alpine base image, `.dockerignore`, non-root user, healthcheck

---

### CI/CD Pipeline

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌───────────┐
│   Push   │     │   GitHub     │     │    Build     │     │  Docker   │
│  to Git  │────►│   Actions    │────►│  & Test      │────►│   Hub     │
│          │     │  (Trigger)   │     │  Docker Image│     │  (Push)   │
└──────────┘     └──────────────┘     └──────────────┘     └───────────┘
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │   Deploy     │
                                      │  Railway /   │
                                      │  Render      │
                                      └──────────────┘
```

**Tools:** GitHub Actions untuk CI/CD, Docker Hub untuk image registry, Railway/Render untuk cloud deployment

---

### Komunikasi Antar Service

```
┌─────────────────────────────────────────────────────────────┐
│                     Alur Komunikasi                          │
│                                                              │
│  Browser ──HTTP GET──► Nginx (:3000)                         │
│    │                    │                                    │
│    │                    └──► Serve React SPA (static files)  │
│    │                                                         │
│    │──HTTP REST API──► FastAPI (:8000)                        │
│    │  (GET/POST/PUT/     │                                   │
│    │   DELETE + JWT)     │──SQLAlchemy──► PostgreSQL (:5432)  │
│    │                     │               │                   │
│    │◄── JSON Response ───┘               │──► pgdata volume  │
│    │                                     │    (persistent)   │
└────┴─────────────────────────────────────┴───────────────────┘
```

**Poin penting:**

1. Browser mengakses frontend (React SPA) melalui Nginx di port 3000
2. Browser langsung mengirim API request ke backend FastAPI di port 8000
3. Backend berkomunikasi dengan PostgreSQL menggunakan SQLAlchemy ORM
4. Data PostgreSQL disimpan secara persistent di Docker volume `pgdata`
5. Autentikasi menggunakan JWT Bearer token di header Authorization

---

## Getting Started Backend

### 🔎 Cek Versi Python (Opsional)

```bash
python --version
pip --version
```

### 📂 Masuk ke Folder Backend

```bash
cd backend
```

### 📦 Install Dependencies

```bash
pip install -r requirements.txt
```

### ▶️ Jalankan Server

```bash
uvicorn main:app --reload --port 8000
```

### 🌐 Akses di Browser

```bash
http://localhost:8000
```

### 📑 Swagger Documentation

```bash
http://localhost:8000/docs
```

## Getting Started Frontend

Buka terminal kemudian jalankan langkah-langkah di bawah ini:

### 📂 Masuk ke folder projek

```
npm create vite@latest frontend -- --template react
```

### 📑Kemudian masuk ke folder frontend

```
cd frontend
npm install
```

### ▶️Jalankan frontend

```
npm run dev
```

## 📅 Roadmap

| Minggu | Target                 | Status |
| ------ | ---------------------- | ------ |
| 1      | Setup & Hello World    | ✅     |
| 2      | REST API + Database    | ✅     |
| 3      | React Frontend         | ✅     |
| 4      | Full-Stack Integration | ✅     |
| 5-7    | Docker & Compose       | ✅     |
| 8      | UTS Demo               | ⬜     |
| 9-11   | CI/CD Pipeline         | ⬜     |
| 12-14  | Microservices          | ⬜     |
| 15-16  | Final & UAS            | ⬜     |

## 📁 Struktur Proyek

```text
cc-kelompok-a-miracle/
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI/CD pipeline (GitHub Actions)
├── backend/
│   ├── scripts/
│   │   └── wait-for-db.sh          # Script tunggu database siap
│   ├── .dockerignore
│   ├── .env.docker                  # Environment untuk Docker
│   ├── .env.example                 # Template environment
│   ├── auth.py                      # Authentication (JWT + bcrypt)
│   ├── crud.py                      # Business logic (CRUD operations)
│   ├── database.py                  # Koneksi PostgreSQL
│   ├── Dockerfile                   # Multi-stage build + healthcheck
│   ├── main.py                      # FastAPI routes & endpoints
│   ├── models.py                    # SQLAlchemy ORM models
│   ├── requirements.txt             # Python dependencies
│   ├── schemas.py                   # Pydantic validation schemas
│   ├── setup.sh                     # Script setup lokal
│   ├── test_db_connection.py        # Test koneksi database
│   └── test_pagination.py           # Test pagination
├── docs/
│   ├── api-test-results.md          # Hasil pengujian API
│   ├── database-schema.md           # Dokumentasi schema database
│   ├── docker-architecture.md       # Dokumentasi arsitektur Docker
│   ├── laporan-CICD-image-optimation.md  # Laporan optimasi image
│   ├── member-*.md                  # Dokumentasi anggota tim
│   ├── ui-test-results.md           # Hasil pengujian UI
│   ├── UTS-demo-langkah.md          # Langkah-langkah demo UTS
│   └── UTS-demo-script.md           # Script narasi demo UTS
├── frontend/
│   ├── public/
│   │   ├── 404.html                 # Custom error page
│   │   ├── 50x.html                 # Custom server error page
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx      # Layout sidebar admin
│   │   │   └── Header.jsx           # Navbar responsive
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx   # Dashboard statistik (grafik)
│   │   │   ├── DonorList.jsx        # Daftar pendonor + search/filter
│   │   │   ├── DonorRegistration.jsx # Form pendaftaran 3 langkah
│   │   │   ├── LandingPage.jsx      # Halaman utama
│   │   │   ├── Login.jsx            # Login admin & user
│   │   │   ├── PublicStock.jsx      # Stok darah publik
│   │   │   ├── UserDashboard.jsx    # Dashboard riwayat donor user
│   │   │   ├── UserRegister.jsx     # Registrasi akun pengguna
│   │   │   └── VerificationQueue.jsx # Antrian verifikasi admin
│   │   ├── services/
│   │   │   └── api.js               # Axios API client
│   │   ├── App.css
│   │   ├── App.jsx                  # React Router (routing utama)
│   │   ├── index.css
│   │   └── main.jsx                 # Entry point React
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile                   # Multi-stage build (Node + Nginx)
│   ├── index.html
│   ├── nginx.conf                   # Nginx config (reverse proxy + SPA)
│   ├── package.json
│   └── vite.config.js
├── scripts/
│   └── docker-run.sh                # Script manual docker run/stop
├── .gitignore
├── docker-compose.yml               # Orchestration 3 services
├── Makefile                         # Shortcut commands (make up/down/logs)
└── README.md
```

## 📂 Tabel ERD

![alt text](image-4.png)

## Penjelasan ERD

<div align="justify">

1. Pendonor ↔ Riwayat_Donor (1 to Many)
   Relasi: Satu Pendonor bisa memiliki banyak Riwayat_Donor.
   Penjelasan: Setiap kali pendonor melakukan donor darah, data baru dicatat di tabel riwayat. Pendonornya satu, tapi catatan donornya bisa berulang kali.
   Foreign Key: id_pendonor ada di dalam tabel Riwayat_Donor.
   Pendonor ↔ Riwayat_Kesehatan (1 to Many)

2. Relasi: Satu Pendonor memiliki banyak catatan Riwayat_Kesehatan.
   Penjelasan: Pendonor mungkin memiliki riwayat cek kesehatan atau penyakit yang berbeda-beda seiring waktu.
   Foreign Key: id_pendonor ada di dalam tabel Riwayat_Kesehatan.
   Pendonor ↔ Gamifikasi (1 to 1)

3. Relasi: Satu Pendonor memiliki satu data Gamifikasi.
   Penjelasan: Ini adalah tabel profil poin/level. Satu akun pendonor hanya punya satu saldo poin/voucher.
   Foreign Key: id_pendonor ada di dalam tabel Gamifikasi (bisa juga id_gamifikasi menjadi FK di Pendonor, tapi biasanya ID Pendonor dijadikan referensi unik di tabel Gamifikasi).
   Admin ↔ Riwayat_Donor (1 to Many)

4. Relasi: Satu Admin dapat memverifikasi banyak Riwayat_Donor.
   Penjelasan: Proses verifikasi (disetujui/tidak) dilakukan oleh Admin. Meskipun di oval gambar 2 atribut id_admin tidak digambar eksplisit di Riwayat_Donor, relasi "Memverifikasi" menyiratkan bahwa ID Admin perlu disimpan di Riwayat Donor untuk mencatat siapa yang memverifikasi.

</div>

## 📸 Dokumentasi ENDPOINT

| HTTP Method            | Code | Response body                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Penjelasan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET/health             | 200  | `{"status": "healthy", "version": "0.2.0"}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | endpoint berjalan dengan benar                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| POST/items             | 201  | `{ "name": "Laptop", "description": "Laptop untuk cloud computing", "price": 15000000 "quantity": 10, "id": 14, "created_at": "2026-03-06T14:10:08.175853+08:00", "updated_at": null}`                                                                                                                                                                                                                                                                                                                                                              | Response ini menunjukkan bahwa data baru berhasil dibuat di server dengan status code 201 (Created). Server mengembalikan informasi produk seperti nama, deskripsi, harga, jumlah stok, id, serta waktu created_at, sementara updated_at masih null karena data belum pernah diperbarui.                                                                                                                                                                                                                                                                                                                                            |
| GET/items              | 200  | `{"total":3,"items":[{"name":"Laptop","description":"Laptop untuk cloud computing","price":15000000,"quantity":10,"id":14,"created_at":"2026-03-06T14:10:08.175853+08:00","updated_at":null},{"name":"Laptop","description":"Laptop untuk cloud computing","price":15000000,"quantity":10,"id":13,"created_at":"2026-03-06T13:46:08.081030+08:00","updated_at":null},{"name":"Handphone","description":"Handhone untuk cloud computing","price":5000000,"quantity":10,"id":12,"created_at":"2026-03-05T20:22:16.156768+08:00","updated_at":null}]}` | Response menunjukkan bahwa permintaan ke API berhasil mengambil data, yang ditandai dengan status code 200 (OK). Server mengembalikan data dalam format JSON yang berisi total data sebanyak 3 pada field total, serta daftar produk pada field items. Setiap item menampilkan informasi produk seperti name, description, price, quantity, id, serta waktu created_at dan updated_at. Data tersebut menunjukkan daftar produk yang tersimpan di sistem.                                                                                                                                                                            |
| GET/item/stats         | 200  | `{"total_items":3,"total_value":350000000,"most_expensive":{"name":"Laptop","price":15000000},"cheapest":{"name":"Handphone","price":5000000}}`                                                                                                                                                                                                                                                                                                                                                                                                     | Response berisi ringkasan data produk. Field total_items menunjukkan jumlah seluruh produk yaitu 3 item. Field total_value menunjukkan total nilai seluruh produk sebesar 350.000.000. Bagian most_expensive menampilkan produk dengan harga paling mahal, yaitu Laptop dengan harga 15.000.000. Sedangkan cheapest menunjukkan produk dengan harga paling murah, yaitu Handphone dengan harga 5.000.000. JSON ini biasanya digunakan untuk menampilkan statistik atau summary data dari kumpulan produk.                                                                                                                           |
| GET/items/{items_id}   | 200  | `{"name":"Handphone","description":"Handhone untuk cloud computing","price":5000000,"quantity":10,"id":12,"created_at":"2026-03-05T20:22:16.156768+08:00","updated_at":null}`                                                                                                                                                                                                                                                                                                                                                                       | Response menampilkan detail satu produk. Field name berisi nama produk yaitu Handphone, description menjelaskan bahwa produk digunakan untuk cloud computing, price menunjukkan harga produk sebesar 5.000.000, dan quantity menunjukkan jumlah stok yaitu 10 unit. Field id merupakan identitas unik produk di database, created_at menunjukkan waktu data dibuat, sedangkan updated_at bernilai null yang berarti data tersebut belum pernah diperbarui.                                                                                                                                                                          |
| PUT/items/{item_id}    | 200  | `{"name":"PC","description":"Untuk Home Server","price":1000000,"quantity":23,"id":12,"created_at":"2026-03-05T20:22:16.156768+08:00","updated_at":"2026-03-07T09:45:54.375108+08:00"}`                                                                                                                                                                                                                                                                                                                                                             | Response JSON tersebut menampilkan **data produk yang telah diperbarui**. Produk memiliki **name** PC dengan **description** “Untuk Home Server”, **price** sebesar **1.000.000**, dan **quantity** sebanyak **23 unit**. Field **id** menunjukkan identitas unik produk di database. **created_at** menunjukkan waktu saat data pertama kali dibuat, sedangkan **updated_at** berisi waktu **terakhir data diperbarui**, yaitu **7 Maret 2026**, yang menandakan bahwa data produk tersebut sudah pernah diubah setelah dibuat.                                                                                                    |
| DELETE/items{items_id} | 204  | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Respons API menunjukkan proses penghapusan data item berdasarkan ID menggunakan metode HTTP DELETE pada endpoint /items/{item_id}. Pada permintaan ini, nilai item_id yang digunakan adalah 12, sehingga sistem akan menghapus data item dengan ID tersebut dari database. Permintaan dikirim ke URL http://localhost:8000/items/12. Setelah proses dijalankan, server mengembalikan status code 204 (No Content) yang menandakan bahwa operasi penghapusan berhasil dilakukan. Status ini juga menunjukkan bahwa server tidak mengirimkan isi data pada response body karena data yang diminta telah berhasil dihapus dari sistem. |

<br><br>

## setup.sh

<div align="justify">
setup.sh adalah file shell script yang digunakan untuk menjalankan serangkaian perintah secara otomatis pada sistem berbasis Linux atau Unix. File ini biasanya digunakan untuk menyiapkan (setup) lingkungan proyek, seperti menginstal dependensi, membuat virtual environment, atau menjalankan konfigurasi awal aplikasi. Dengan menjalankan setup.sh, pengguna tidak perlu menjalankan perintah satu per satu karena semua langkah instalasi sudah dituliskan dalam satu skrip yang dapat dieksekusi sekaligus.
</div>
<br>

**Cara Menjalankan Setup.sh di Windows**

1. Di Terminal Pilih Git Bash
2. Kmudian Ketikan kode ini lalu tekan enter:

```
./setup.sh
```

---

## Docker Multi-Container Setup (Modul 6)

Pada praktikum modul 6, aplikasi TraceIt dijalankan menggunakan 3 container Docker yang saling terhubung dalam satu network.

### Container Services

| Container          | Image                    | Fungsi                 | Port        |
| ------------------ | ------------------------ | ---------------------- | ----------- |
| `tracelt-frontend` | `tracelt-frontend:v1-fe` | Frontend React + Nginx | `3000:80`   |
| `tracelt-backend`  | `tracelt-backend:v1`     | Backend FastAPI        | `8000:8000` |
| `tracelt-db`       | `postgres:15`            | Database PostgreSQL    | `5432:5432` |

### Network & Volume

- **Network:** `cc-kelompok-a-miracle_default` (bridge) — menghubungkan ketiga container
- **Volume:** `pgdata` — menyimpan data PostgreSQL secara persist

### Build Docker Images

```bash
# Build backend
docker build -t tracelt-backend:v1 ./backend

# Build frontend (multi-stage: Node.js build + Nginx serve)
docker build -t tracelt-frontend:v1-fe ./frontend
```

### Menjalankan Container

```bash
# Buat network
docker network create cc-kelompok-a-miracle_default

# Jalankan database
docker run -d --name tracelt-db --network cc-kelompok-a-miracle_default \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tracelt \
  -p 5432:5432 -v pgdata:/var/lib/postgresql/data postgres:15

# Jalankan backend
docker run -d --name tracelt-backend --network cc-kelompok-a-miracle_default \
  --env-file ./backend/.env.docker -p 8000:8000 tracelt-backend:v1

# Jalankan frontend
docker run -d --name tracelt-frontend --network cc-kelompok-a-miracle_default \
  -p 3000:80 tracelt-frontend:v1-fe
```

Atau menggunakan script:

```bash
./scripts/docker-run.sh start
```

### Akses Service

| Service                | URL                            |
| ---------------------- | ------------------------------ |
| Frontend               | `http://localhost:3000`        |
| Backend API            | `http://localhost:8000`        |
| Backend Docs (Swagger) | `http://localhost:8000/docs`   |
| Backend Health Check   | `http://localhost:8000/health` |

### Docker Testing

Pengujian dilakukan dengan langkah berikut:

1. Build image backend dan frontend
2. Jalankan ketiga container (database, backend, frontend)
3. Cek status container dengan `docker ps`
4. Cek log container dengan `docker logs`
5. Akses frontend di `http://localhost:3000`
6. Akses backend docs di `http://localhost:8000/docs`
7. Akses health check di `http://localhost:8000/health`
8. Cek network dengan `docker network inspect cc-kelompok-a-miracle_default`
9. Cek volume dengan `docker volume ls`

### Hasil Pengujian

| Pengujian                                   | Hasil                      |
| ------------------------------------------- | -------------------------- |
| Build image backend                         | Berhasil                   |
| Build image frontend                        | Berhasil                   |
| Container `tracelt-db`                      | Up                         |
| Container `tracelt-backend`                 | Up (healthy)               |
| Container `tracelt-frontend`                | Up                         |
| Akses `http://localhost:3000`               | Berhasil                   |
| Akses `http://localhost:8000/docs`          | Berhasil                   |
| Health check `http://localhost:8000/health` | Berhasil                   |
| Docker network                              | Ketiga container terhubung |
| Docker volume `pgdata`                      | Terdeteksi                 |

### Image Size

| Image              | Tag     | Size    |
| ------------------ | ------- | ------- |
| `tracelt-backend`  | `v1`    | 216 MB  |
| `tracelt-frontend` | `v1-fe` | 93.8 MB |

Frontend menggunakan multi-stage build sehingga ukuran image jauh lebih kecil dibanding menggunakan Node.js penuh (~1 GB).

### Docker Hub

Image yang telah di-push ke Docker Hub:

| Image    | Docker Hub                     |
| -------- | ------------------------------ |
| Frontend | `USERNAME/tracelt-frontend:v1` |
| Backend  | `USERNAME/tracelt-backend:v1`  |

> Ganti `USERNAME` dengan username Docker Hub masing-masing anggota yang melakukan push.

### Dokumentasi Arsitektur

Dokumentasi arsitektur Docker secara lengkap tersedia di [`docs/docker-architecture.md`](docs/docker-architecture.md), mencakup diagram Mermaid, port mapping, network, volume, environment variables, dan alur komunikasi antar service.

### Diagram Arsitektur Docker

![Docker Architecture](docs/docker-architecture-diagram.png)

**Penjelasan Diagram:**

- **User/Browser** mengakses frontend via `localhost:3000` dan backend API via `localhost:8000`
- **tracelt-frontend** (Nginx + React) berjalan di container port 80, di-map ke host port 3000
- **tracelt-backend** (FastAPI) berjalan di container port 8000, menerima env vars dari `.env.docker`
- **tracelt-db** (PostgreSQL 15) berjalan di container port 5432, data disimpan di named volume `pgdata`
- Ketiga container terhubung dalam Docker network `cc-kelompok-a-miracle_default`
- Frontend container hanya menyajikan file React via Nginx. Request API dilakukan oleh browser user ke `localhost:8000`, bukan dari frontend container langsung ke backend

---

## CI/CD — Optimasi Docker Image & Push ke Docker Hub (Modul 9-11)

### Perbandingan Ukuran Image: Sebelum vs Sesudah Optimasi

#### Backend (`tracelt-backend`)

| Aspek              | Sebelum Optimasi            | Sesudah Optimasi (v2)              |
| ------------------ | --------------------------- | ---------------------------------- |
| **Base Image**     | `python:3.12` (full Debian) | `python:3.12-alpine`               |
| **Build Strategy** | Single-stage                | Multi-stage (builder + production) |
| **Ukuran Image**   | ~1.2 GB                     | **216 MB**                         |
| **.dockerignore**  | Tidak ada                   | Ada                                |
| **User**           | root                        | non-root (`appuser`)               |
| **Healthcheck**    | Tidak ada                   | Ada                                |

#### Frontend (`tracelt-frontend`)

| Aspek                     | Sebelum Optimasi             | Sesudah Optimasi (v1)           |
| ------------------------- | ---------------------------- | ------------------------------- |
| **Base Image**            | `node:20` (full Debian)      | `node:20-slim` + `nginx:alpine` |
| **Build Strategy**        | Single-stage (Node.js serve) | Multi-stage (build + Nginx)     |
| **Ukuran Image**          | ~1.1 GB                      | **93.8 MB**                     |
| **node_modules di final** | Ya (~500 MB+)                | Tidak                           |
| **.dockerignore**         | Tidak ada                    | Ada                             |

#### Ringkasan Pengurangan

| Image     | Sebelum     | Sesudah     | Pengurangan |
| --------- | ----------- | ----------- | ----------- |
| Backend   | ~1.2 GB     | **216 MB**  | **~82%**    |
| Frontend  | ~1.1 GB     | **93.8 MB** | **~91%**    |
| **Total** | **~2.3 GB** | **~310 MB** | **~87%**    |

### Teknik Optimasi yang Diterapkan

| Teknik             | Backend | Frontend | Keterangan                               |
| ------------------ | ------- | -------- | ---------------------------------------- |
| Multi-stage build  | Ya      | Ya       | Memisahkan build dan runtime             |
| Alpine base image  | Ya      | Ya       | Image minimal (~5-50 MB vs ~100-1000 MB) |
| `.dockerignore`    | Ya      | Ya       | Mengurangi build context                 |
| Non-root user      | Ya      | -        | Security best practice                   |
| Healthcheck        | Ya      | -        | Monitoring container health              |
| No cache pip/npm   | Ya      | Ya       | `--no-cache-dir`                         |
| Layer optimization | Ya      | Ya       | Mengurutkan COPY untuk cache efficiency  |

### Push ke Docker Hub

Image yang telah dioptimasi di-push ke Docker Hub:

```bash
# Tag image
docker tag tracelt-backend:v1 <DOCKERHUB_USERNAME>/backend:v2
docker tag tracelt-frontend:v1-fe <DOCKERHUB_USERNAME>/frontend:v1

# Push ke Docker Hub
docker push <DOCKERHUB_USERNAME>/backend:v2
docker push <DOCKERHUB_USERNAME>/frontend:v1
```

| Image    | Tag  | Docker Hub                         | Ukuran  |
| -------- | ---- | ---------------------------------- | ------- |
| Backend  | `v2` | `<DOCKERHUB_USERNAME>/backend:v2`  | 216 MB  |
| Frontend | `v1` | `<DOCKERHUB_USERNAME>/frontend:v1` | 93.8 MB |

> Ganti `<DOCKERHUB_USERNAME>` dengan username Docker Hub tim.

### Cara Pull & Jalankan dari Docker Hub

```bash
# Pull image
docker pull <DOCKERHUB_USERNAME>/backend:v2
docker pull <DOCKERHUB_USERNAME>/frontend:v1

# Jalankan
docker run -d --name backend -p 8000:8000 --env-file backend/.env.docker <DOCKERHUB_USERNAME>/backend:v2
docker run -d --name frontend -p 3000:80 <DOCKERHUB_USERNAME>/frontend:v1
```

> Dokumentasi lengkap optimasi image tersedia di [`docs/laporan-cicd-image-optimization.md`](docs/laporan-cicd-image-optimization.md)

## Dokumentasi Week 1

![alt text](image-1.png)
![alt text](image.png)

## Dokumentasi Week 2

![alt text](image-2.png)

## Dokumentasi week 3

![alt text](image-3.png)

## Dokumentasi sebelum UTS
