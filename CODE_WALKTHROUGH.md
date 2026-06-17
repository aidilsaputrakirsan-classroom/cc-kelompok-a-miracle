# Code Walkthrough - TraceIt (Kelompok A Miracle)

## Daftar Isi

- [1. Gambaran Umum Proyek](#1-gambaran-umum-proyek)
- [2. Project Structure](#2-project-structure)
- [3. Backend Walkthrough](#3-backend-walkthrough)
  - [3.1 Entry Point & Routing (main.py)](#31-entry-point--routing-mainpy)
  - [3.2 Database Connection (database.py)](#32-database-connection-databasepy)
  - [3.3 ORM Models (models.py)](#33-orm-models-modelspy)
  - [3.4 Validation Schemas (schemas.py)](#34-validation-schemas-schemaspy)
  - [3.5 Business Logic (crud.py)](#35-business-logic-crudpy)
  - [3.6 Authentication (auth.py)](#36-authentication-authpy)
- [4. Frontend Walkthrough](#4-frontend-walkthrough)
  - [4.1 Entry Point (main.jsx)](#41-entry-point-mainjsx)
  - [4.2 Routing (App.jsx)](#42-routing-appjsx)
  - [4.3 API Service Layer (services/api.js)](#43-api-service-layer-servicesapijs)
  - [4.4 Pages](#44-pages)
  - [4.5 Components](#45-components)
- [5. Docker & Containerization](#5-docker--containerization)
  - [5.1 docker-compose.yml](#51-docker-composeyml)
  - [5.2 Backend Dockerfile](#52-backend-dockerfile)
  - [5.3 Frontend Dockerfile](#53-frontend-dockerfile)
  - [5.4 Nginx Configuration](#54-nginx-configuration)
- [6. CI/CD Pipeline](#6-cicd-pipeline)
- [7. Makefile Shortcuts](#7-makefile-shortcuts)
- [8. Alur Data End-to-End](#8-alur-data-end-to-end)
- [9. Dependency Summary](#9-dependency-summary)

---

## 1. Gambaran Umum Proyek

**TraceIt** adalah aplikasi web untuk manajemen pengajuan pendonor darah sukarela di lingkungan Institut Teknologi Kalimantan (ITK). Aplikasi ini memiliki dua role pengguna:

| Role        | Kemampuan                                                                 |
| ----------- | ------------------------------------------------------------------------- |
| **Admin**   | Memverifikasi data donor, menghapus pendonor, melihat dashboard statistik |
| **Pengguna** | Mendaftarkan diri sebagai pendonor, mengelola riwayat donor sendiri       |

**Tech Stack:**

| Layer     | Teknologi                                      |
| --------- | ---------------------------------------------- |
| Backend   | Python 3.12, FastAPI, SQLAlchemy, Pydantic v2  |
| Frontend  | React 19, Vite 6, Tailwind CSS 4, React Router |
| Database  | PostgreSQL 15                                  |
| Container | Docker (multi-stage build), Docker Compose     |
| CI/CD     | GitHub Actions, Docker Hub                     |

---

## 2. Project Structure

```
cc-kelompok-a-miracle/
│
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI/CD pipeline
│
├── backend/                           # FastAPI REST API
│   ├── scripts/
│   │   └── wait-for-db.sh            # Script tunggu database siap sebelum start
│   ├── .env                           # Environment variables (lokal, git-ignored)
│   ├── .env.docker                    # Environment variables untuk Docker
│   ├── .env.example                   # Template environment
│   ├── .dockerignore                  # File yang dikecualikan dari Docker build
│   ├── auth.py                        # JWT authentication & password hashing
│   ├── crud.py                        # Business logic (CRUD + auto-linking)
│   ├── database.py                    # Koneksi PostgreSQL via SQLAlchemy
│   ├── Dockerfile                     # Multi-stage build (Alpine + healthcheck)
│   ├── main.py                        # FastAPI app, routes, CORS, startup hooks
│   ├── models.py                      # SQLAlchemy ORM models (4 tabel)
│   ├── requirements.txt               # Python dependencies
│   ├── schemas.py                     # Pydantic v2 request/response schemas
│   ├── setup.sh                       # Script setup lokal (venv + install)
│   ├── test_db_connection.py          # Test koneksi database
│   └── test_pagination.py            # Test pagination
│
├── frontend/                          # React SPA
│   ├── public/
│   │   ├── 404.html                   # Custom 404 error page
│   │   ├── 50x.html                   # Custom 5xx error page
│   │   └── vite.svg                   # Vite default icon
│   ├── src/
│   │   ├── assets/
│   │   │   └── react.svg              # React logo
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx        # Sidebar layout untuk halaman admin
│   │   │   └── Header.jsx             # Navbar responsive
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx     # Dashboard statistik (grafik bar/pie)
│   │   │   ├── DonorList.jsx          # Daftar pendonor + search & filter
│   │   │   ├── DonorRegistration.jsx  # Form pendaftaran pendonor (3 langkah)
│   │   │   ├── LandingPage.jsx        # Halaman utama / hero
│   │   │   ├── Login.jsx              # Login admin & user (dual mode)
│   │   │   ├── PublicStock.jsx        # Tabel stok darah publik
│   │   │   ├── UserDashboard.jsx      # Dashboard riwayat donor user
│   │   │   ├── UserRegister.jsx       # Registrasi akun pengguna baru
│   │   │   └── VerificationQueue.jsx  # Antrian verifikasi admin
│   │   ├── services/
│   │   │   └── api.js                 # Axios HTTP client + JWT interceptor
│   │   ├── App.jsx                    # React Router (routing utama)
│   │   ├── App.css                    # Global styles
│   │   ├── index.css                  # Tailwind CSS imports
│   │   └── main.jsx                   # React DOM entry point
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile                     # Multi-stage build (Node + Nginx)
│   ├── index.html                     # HTML template (Vite entry)
│   ├── nginx.conf                     # Nginx config (reverse proxy + SPA + gzip)
│   ├── package.json                   # NPM dependencies & scripts
│   └── vite.config.js                 # Vite config (proxy, Tailwind plugin)
│
├── docs/                              # Dokumentasi proyek
│   ├── api-test-results.md            # Hasil pengujian API
│   ├── database-schema.md             # Dokumentasi schema database
│   ├── docker-architecture.md         # Dokumentasi arsitektur Docker
│   ├── laporan-CICD-image-optimation.md # Laporan optimasi Docker image
│   ├── member-*.md                    # Dokumentasi kontribusi anggota tim
│   ├── ui-test-results.md             # Hasil pengujian UI
│   ├── UTS-demo-langkah.md            # Langkah demo UTS
│   └── UTS-demo-script.md             # Script narasi demo UTS
│
├── scripts/
│   └── docker-run.sh                  # Script manual docker run/stop
│
├── docker-compose.yml                 # Orchestration 3 services
├── Makefile                           # Shortcut commands (make up/down/logs)
└── README.md                          # Dokumentasi utama proyek
```

**Penjelasan pembagian folder:**

| Folder       | Fungsi                                                        |
| ------------ | ------------------------------------------------------------- |
| `backend/`   | Seluruh kode server-side (API, database, auth, business logic) |
| `frontend/`  | Seluruh kode client-side (React SPA, styling, routing)        |
| `docs/`      | Dokumentasi teknis, hasil testing, laporan anggota            |
| `scripts/`   | Helper scripts untuk Docker manual run                        |
| `.github/`   | CI/CD pipeline configuration                                  |

---

## 3. Backend Walkthrough

Backend menggunakan arsitektur berlapis (layered architecture) dengan pemisahan tanggung jawab yang jelas.

### 3.1 Entry Point & Routing (`main.py`)

**Lokasi:** `backend/main.py`

File ini adalah titik masuk utama aplikasi FastAPI. Berikut yang terjadi saat server dimulai:

```
Startup Flow:
1. Import semua module (database, models, schemas, auth, crud)
2. Base.metadata.create_all(bind=engine)  → Auto-create tabel jika belum ada
3. @app.on_event("startup"):
   a. ensure_schema_compatibility()       → Tambah kolom id_pengguna jika belum ada
   b. _ensure_backend_schema_compatibility() → Tambah kolom email, fix tipe no_telepon
   c. _cleanup_duplicate_admins()         → Pastikan hanya 1 admin tersisa
4. CORS middleware dikonfigurasi dari env ALLOWED_ORIGINS
```

**Endpoint yang didefinisikan:**

| Grup                | Prefix              | Jumlah Endpoint | Auth Required |
| ------------------- | ------------------- | --------------- | ------------- |
| Health & Info       | `/health`, `/info`  | 2               | Tidak         |
| Public              | `/api/public/*`     | 1               | Tidak         |
| Auth Admin          | `/auth/admin/*`     | 2               | Tidak         |
| Auth Pengguna       | `/auth/pengguna/*`  | 2               | Tidak         |
| Pendonor CRUD       | `/pendonor/*`       | 4               | DELETE = Admin |
| Riwayat Donor       | `/riwayat-donor/*`  | 4               | Verifikasi = Admin |
| Pengguna Endpoints  | `/pengguna/*`       | 5               | Ya (User)     |

**Pola penting:** Setiap endpoint auth memiliki dua decorator — satu tanpa prefix `/api/` dan satu dengan prefix `/api/`. Ini untuk kompatibilitas dengan Nginx reverse proxy di Docker yang me-strip prefix `/api`.

```python
# Contoh dual-route pattern (main.py:103-104)
@app.post("/auth/admin/register", ...)
@app.post("/api/auth/admin/register", ...)
def register_admin(...):
```

### 3.2 Database Connection (`database.py`)

**Lokasi:** `backend/database.py`

File ini menangani koneksi ke PostgreSQL menggunakan SQLAlchemy.

**Alur resolusi environment:**

```
_resolve_env_file():
  1. Cek env var ENV_FILE → gunakan jika ada
  2. Cek apakah jalan di container (/.dockerenv) → gunakan .env.docker
  3. Default → gunakan .env
```

**Komponen utama:**

| Komponen       | Fungsi                                                    |
| -------------- | --------------------------------------------------------- |
| `engine`       | Koneksi pool ke PostgreSQL (`pool_pre_ping=True`)         |
| `SessionLocal` | Factory untuk membuat database session                    |
| `Base`         | Base class untuk semua ORM model                          |
| `get_db()`     | Dependency injection — yield session, auto-close di akhir |

`get_db()` digunakan sebagai FastAPI dependency di hampir semua endpoint:

```python
# Pattern penggunaan di main.py
def list_pendonor(..., db: Session = Depends(get_db)):
```

### 3.3 ORM Models (`models.py`)

**Lokasi:** `backend/models.py`

Mendefinisikan 4 tabel database menggunakan SQLAlchemy ORM:

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    Admin     │       │  RiwayatDonor    │       │   Pengguna   │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id_admin PK  │       │ id_riwayat PK    │       │id_pengguna PK│
│ nama_admin   │       │ id_pendonor FK───┼──┐    │nama_pengguna │
│ email (UQ)   │       │ id_pengguna FK───┼──┼──► │ email (UQ)   │
│ password     │       │ golongan_darah   │  │    │ password     │
└──────────────┘       │ status_verifikasi│  │    │ created_at   │
                       └──────────────────┘  │    └──────────────┘
                                             │
                       ┌─────────────────────▼──┐
                       │       Pendonor         │
                       ├────────────────────────┤
                       │ id_pendonor PK         │
                       │ nama_lengkap           │
                       │ email, no_telepon      │
                       │ jenis_kelamin (enum)   │
                       │ berat_badan, tinggi    │
                       │ golongan_darah (enum)  │
                       │ umur, tanggal_lahir    │
                       │ alamat, riwayat_kes.   │
                       │ total_donor, created_at│
                       └────────────────────────┘
```

**Enum yang digunakan:**

| Enum                 | Nilai                                          |
| -------------------- | ---------------------------------------------- |
| `GolonganDarahEnum`  | O+, O-, A+, A-, B+, B-, AB+, AB-              |
| `JenisKelaminEnum`   | Laki-laki, Perempuan                           |

**Relasi:**

- `Pendonor` 1:N `RiwayatDonor` — satu pendonor bisa punya banyak riwayat
- `Pengguna` 1:N `RiwayatDonor` — satu pengguna bisa punya banyak riwayat
- `RiwayatDonor` berfungsi sebagai **junction table** yang menghubungkan pendonor dengan pengguna

**Schema migration otomatis:** Fungsi `ensure_schema_compatibility()` di `models.py:8-26` menambahkan kolom `id_pengguna` ke tabel `riwayat_donor` jika belum ada — ini menghindari kebutuhan migration tool terpisah.

### 3.4 Validation Schemas (`schemas.py`)

**Lokasi:** `backend/schemas.py`

Menggunakan **Pydantic v2** untuk validasi request/response. Pola yang digunakan:

| Pattern          | Contoh                  | Fungsi                                |
| ---------------- | ----------------------- | ------------------------------------- |
| `*Create`        | `PendonorCreate`        | Validasi data saat membuat record baru |
| `*Update`        | `PendonorUpdate`        | Semua field Optional untuk partial update |
| `*Response`      | `PendonorResponse`      | Shape data yang dikembalikan ke client |
| `*ListResponse`  | `PendonorListResponse`  | Wrapper dengan `total` + list items   |

**Validasi password** (digunakan di `AdminCreate` dan `PenggunaCreate`):

```python
# schemas.py:28-36
@field_validator("password")
def validate_password_strength(cls, value: str) -> str:
    # Minimal 1 huruf besar
    # Minimal 1 huruf kecil
    # Minimal 1 angka
    # Minimal 8 karakter (dari Field min_length)
```

**Config `from_attributes = True`** pada semua Response model memungkinkan Pydantic membaca langsung dari SQLAlchemy ORM object (bukan hanya dict).

### 3.5 Business Logic (`crud.py`)

**Lokasi:** `backend/crud.py`

File ini berisi seluruh business logic aplikasi. Beberapa pola penting:

**1. Auto-linking Pendonor ↔ Pengguna**

Ini adalah fitur kunci: ketika email pendonor dan pengguna sama, sistem otomatis membuat `RiwayatDonor` untuk menghubungkan keduanya.

```
Skenario A: Pengguna registrasi, pendonor sudah ada
  create_pengguna() → cek Pendonor dengan email sama → buat RiwayatDonor

Skenario B: Pendonor dibuat, pengguna sudah ada
  create_pendonor() → cek Pengguna dengan email sama → buat RiwayatDonor

Skenario C: Pendonor di-update emailnya
  update_pendonor() → cek Pengguna dengan email baru → buat RiwayatDonor
```

**2. Admin singleton pattern**

```python
# crud.py:20-23 — Hanya boleh ada 1 admin
def create_admin(db, admin_data):
    existing_admin = db.query(Admin).first()
    if existing_admin:
        return None  # Tolak registrasi admin kedua
```

**3. Verifikasi donor + increment total_donor**

```python
# crud.py:330-344
def verifikasi_riwayat_donor(db, riwayat_id, verifikasi_data):
    # Set status_verifikasi
    # Jika diverifikasi (True), increment total_donor pada pendonor terkait
```

**4. Email normalization**

Semua email di-normalize ke lowercase dan di-trim sebelum disimpan (`_normalize_email()`).

### 3.6 Authentication (`auth.py`)

**Lokasi:** `backend/auth.py`

Implementasi autentikasi menggunakan JWT (JSON Web Token) + bcrypt password hashing.

**Alur autentikasi:**

```
Login Request
  │
  ├─ Cari user by email (normalized)
  ├─ Verify password (bcrypt)
  ├─ Generate JWT token:
  │    payload = { sub: user_id, user_type: "admin"|"pengguna", exp: now+60min }
  │    algorithm = HS256
  └─ Return { access_token, token_type: "bearer", user_type }

Protected Request
  │
  ├─ Extract token dari header "Authorization: Bearer <token>"
  ├─ Decode JWT → dapatkan sub (user_id) dan user_type
  ├─ Query database untuk validasi user masih ada
  └─ Return user object sebagai dependency
```

**Dependency injection pattern:**

```python
# Digunakan di endpoint yang butuh admin auth
current_admin: Admin = Depends(get_current_admin)

# Digunakan di endpoint yang butuh user auth
current_pengguna: Pengguna = Depends(get_current_pengguna)
```

**Konfigurasi dari environment:**

| Variable                     | Default                          |
| ---------------------------- | -------------------------------- |
| `SECRET_KEY`                 | `fallback-secret-key-for-development` |
| `ALGORITHM`                  | `HS256`                          |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60`                             |

---

## 4. Frontend Walkthrough

### 4.1 Entry Point (`main.jsx`)

**Lokasi:** `frontend/src/main.jsx`

Standard React entry point — me-render `<App />` ke DOM element `#root` yang ada di `index.html`.

### 4.2 Routing (`App.jsx`)

**Lokasi:** `frontend/src/App.jsx`

Menggunakan **React Router v7** (react-router-dom) dengan pattern berikut:

```
Routes
├── Public Routes (tanpa auth)
│   ├── /              → LandingPage
│   ├── /login         → Login
│   ├── /user/register → UserRegister
│   ├── /register      → DonorRegistration
│   └── /stock         → PublicStock
│
├── Admin Routes (dilindungi AdminRoute)
│   ├── /admin         → AdminDashboard
│   ├── /admin/donors  → DonorList
│   └── /admin/verify  → VerificationQueue
│
├── User Routes (dilindungi UserRoute)
│   └── /user/dashboard → UserDashboard
│
└── Catch-all → Redirect ke /
```

**Route Guard Pattern:**

Kedua guard (`AdminRoute` dan `UserRoute`) menggunakan pola yang sama:

```
1. useState(loading=true, isValid=false)
2. useEffect → cek token di localStorage
3. Jika token ada → panggil API untuk validasi
4. Jika valid → render children
5. Jika tidak valid → Navigate ke /login
```

Perbedaannya:
- `AdminRoute` menyimpan token di `localStorage.admin_token` dan membungkus children dengan `<AdminLayout>`
- `UserRoute` menyimpan token di `localStorage.user_token` dan langsung render children

### 4.3 API Service Layer (`services/api.js`)

**Lokasi:** `frontend/src/services/api.js`

Menggunakan **Axios** dengan konfigurasi:

- **Base URL:** `/api` — semua request di-prefix dengan `/api`
- **Interceptor:** Otomatis menyisipkan JWT token berdasarkan endpoint:

```
Request ke /pengguna/*  → gunakan user_token
Request ke /pendonor/*  → gunakan admin_token
Request ke /riwayat-donor/* → gunakan admin_token
Request lainnya         → gunakan admin_token || user_token
```

**Exported methods:**

| Kategori        | Methods                                                                |
| --------------- | ---------------------------------------------------------------------- |
| Auth Admin      | `loginAdmin`, `registerAdmin`                                          |
| Auth Pengguna   | `loginPengguna`, `registerPengguna`, `getPenggunaMe`                   |
| Pendonor        | `registerPendonor`, `getPendonorList`, `getPendonorById`, `updatePendonor`, `deletePendonor` |
| Public          | `getPublicBloodStock`                                                  |
| Riwayat (Admin) | `createRiwayatDonor`, `getRiwayatDonorAll`, `verifyRiwayatDonor`, dll  |
| Riwayat (User)  | `createRiwayatDonorPengguna`, `getRiwayatDonorPengguna`, dll           |
| Stats           | `getStats` — menghitung statistik dari multiple API calls              |

**`getStats()` pattern:** Fungsi ini melakukan 4 API call secara paralel (`Promise.all`) lalu menghitung statistik di client-side — ini karena backend tidak menyediakan endpoint statistik agregat khusus.

### 4.4 Pages

| File                      | Route             | Deskripsi                                                    |
| ------------------------- | ----------------- | ------------------------------------------------------------ |
| `LandingPage.jsx`         | `/`               | Hero section, info aplikasi, CTA untuk register/login        |
| `Login.jsx`               | `/login`          | Form login dual-mode (admin/user), switch via query param    |
| `UserRegister.jsx`        | `/user/register`  | Form registrasi akun pengguna baru                           |
| `DonorRegistration.jsx`   | `/register`       | Form pendaftaran pendonor multi-step (3 langkah)             |
| `PublicStock.jsx`         | `/stock`          | Tabel stok darah publik per golongan darah                   |
| `AdminDashboard.jsx`      | `/admin`          | Dashboard dengan grafik (Recharts: BarChart, PieChart)       |
| `DonorList.jsx`           | `/admin/donors`   | Tabel pendonor dengan search, filter, pagination             |
| `VerificationQueue.jsx`   | `/admin/verify`   | Antrian verifikasi riwayat donor (approve/reject)            |
| `UserDashboard.jsx`       | `/user/dashboard` | Riwayat donor milik user yang sedang login                   |

### 4.5 Components

| File               | Fungsi                                                              |
| ------------------ | ------------------------------------------------------------------- |
| `Header.jsx`       | Navbar responsive — tampil di semua halaman publik                  |
| `AdminLayout.jsx`  | Sidebar navigation untuk halaman admin (dashboard, donors, verify)  |

**Library UI yang digunakan:**

| Library        | Fungsi                                |
| -------------- | ------------------------------------- |
| Tailwind CSS 4 | Utility-first styling                 |
| Framer Motion  | Animasi & transisi halaman            |
| Recharts       | Grafik (BarChart, PieChart) di admin  |
| Lucide React   | Icon library                          |
| date-fns       | Format tanggal (locale Indonesia)     |

---

## 5. Docker & Containerization

### 5.1 `docker-compose.yml`

**Lokasi:** `docker-compose.yml`

Mendefinisikan 3 services yang saling terhubung:

```
┌─────────────────────────────────────────────────────┐
│              Docker Compose Services                 │
│                                                      │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │    db    │   │   backend    │   │   frontend   │ │
│  │ postgres │◄──│   FastAPI    │   │ Nginx+React  │ │
│  │  :5433   │   │    :8000     │   │    :3000     │ │
│  └──────────┘   └──────────────┘   └──────────────┘ │
│       ▲              depends_on         depends_on   │
│       │              db (healthy)       backend       │
│   volume:pgdata                        (healthy)     │
└─────────────────────────────────────────────────────┘
```

**Dependency chain:** `frontend` → `backend` (healthy) → `db` (healthy)

Artinya Docker Compose akan:
1. Start `db` dulu, tunggu healthcheck pass
2. Start `backend`, tunggu healthcheck pass
3. Baru start `frontend`

**Port mapping:**

| Service  | Container Port | Host Port |
| -------- | -------------- | --------- |
| db       | 5432           | 5433      |
| backend  | 8000           | 8000      |
| frontend | 80             | 3000      |

### 5.2 Backend Dockerfile

**Lokasi:** `backend/Dockerfile`

Menggunakan **multi-stage build** untuk menghasilkan image yang kecil:

```
Stage 1: Builder (python:3.12-alpine)
  ├── Install build dependencies (build-base)
  ├── Create virtual environment di /opt/venv
  └── pip install requirements.txt

Stage 2: Production (python:3.12-alpine)
  ├── Install runtime deps (curl, postgresql-client)
  ├── Copy /opt/venv dari builder
  ├── Copy source code
  ├── Fix line endings (CRLF → LF) untuk wait-for-db.sh
  ├── Create non-root user (appuser)
  ├── Healthcheck: curl http://localhost:8000/health
  └── CMD: wait-for-db.sh && uvicorn main:app
```

**Hasil:** Image size ~216 MB (turun dari ~1.2 GB)

### 5.3 Frontend Dockerfile

**Lokasi:** `frontend/Dockerfile`

Juga menggunakan **multi-stage build**:

```
Stage 1: Builder (node:20-slim)
  ├── npm install
  ├── Copy source code
  ├── Set VITE_API_URL via build arg
  └── npm run build → output di /app/dist/

Stage 2: Production (nginx:alpine)
  ├── Install curl untuk healthcheck
  ├── Copy /app/dist/ ke Nginx html directory
  ├── Copy nginx.conf
  ├── Healthcheck: curl http://localhost:80/
  └── CMD: nginx -g "daemon off;"
```

**Hasil:** Image size ~93.8 MB (turun dari ~1.1 GB)

### 5.4 Nginx Configuration

**Lokasi:** `frontend/nginx.conf`

Nginx berfungsi sebagai:

1. **Static file server** — menyajikan React SPA build output
2. **Reverse proxy** — meneruskan `/api/*` ke backend container
3. **SPA handler** — semua route diarahkan ke `index.html` (client-side routing)

```
Konfigurasi utama:

location /api/ {
    proxy_pass http://tracelt-backend:8000/;
    # Strip /api prefix saat forward ke backend
}

location / {
    try_files $uri $uri/ /index.html;
    # SPA fallback
}

location ~* \.(js|css|png|...)$ {
    expires 1y;
    # Cache static assets
}

location = /index.html {
    add_header Cache-Control "no-cache";
    # Selalu serve versi terbaru
}
```

**Security headers** yang diterapkan:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`
- `Strict-Transport-Security` (HSTS)

**Gzip compression** diaktifkan untuk semua tipe konten umum.

---

## 6. CI/CD Pipeline

**Lokasi:** `.github/workflows/ci.yml`

Pipeline berjalan pada setiap `push` atau `pull_request` ke branch `main`.

```
┌─────────────────────────────────────────────────────────┐
│                   CI/CD Pipeline                         │
│                                                          │
│  ┌──────────────┐    ┌──────────────────┐               │
│  │ test-backend │    │ build-frontend   │  (parallel)   │
│  │              │    │                  │               │
│  │ 1. Checkout  │    │ 1. Checkout      │               │
│  │ 2. Python 3.12│   │ 2. Node.js 20   │               │
│  │ 3. pip install│   │ 3. npm ci        │               │
│  │ 4. Health test│   │ 4. npm run build │               │
│  │   (PostgreSQL │    └────────┬─────────┘               │
│  │    service)   │             │                         │
│  └──────┬────────┘             │                         │
│         │                      │                         │
│         └──────────┬───────────┘                         │
│                    ▼                                     │
│         ┌──────────────────┐                             │
│         │     docker       │  (hanya jika push ke main)  │
│         │                  │                             │
│         │ 1. Docker Buildx │                             │
│         │ 2. Login DockerHub│                            │
│         │ 3. Build & Push  │                             │
│         │    backend image │                             │
│         │ 4. Build & Push  │                             │
│         │    frontend image│                             │
│         └──────────────────┘                             │
└─────────────────────────────────────────────────────────┘
```

**Job details:**

| Job              | Trigger          | Apa yang dilakukan                                    |
| ---------------- | ---------------- | ----------------------------------------------------- |
| `test-backend`   | push & PR        | Spin up PostgreSQL service, install deps, run health check test |
| `build-frontend` | push & PR        | Install deps, build React app                         |
| `docker`         | push ke main saja | Build & push Docker images ke Docker Hub              |

**Docker image tags:**
- `latest` — selalu menunjuk ke build terbaru
- `<commit-sha>` — tag spesifik per commit untuk traceability

---

## 7. Makefile Shortcuts

**Lokasi:** `Makefile`

| Command           | Apa yang dilakukan                                |
| ----------------- | ------------------------------------------------- |
| `make up`         | `docker compose up -d`                            |
| `make build`      | `docker compose up --build -d`                    |
| `make down`       | `docker compose down`                             |
| `make clean`      | `docker compose down -v` + `docker system prune`  |
| `make restart`    | `docker compose restart`                          |
| `make logs`       | `docker compose logs -f` (semua services)         |
| `make logs-backend` | `docker compose logs -f backend`                |
| `make ps`         | `docker compose ps`                               |
| `make shell-backend` | Masuk ke shell backend container               |
| `make shell-db`   | Masuk ke PostgreSQL CLI                           |

---

## 8. Alur Data End-to-End

Berikut contoh alur lengkap saat pengguna mendaftarkan diri sebagai pendonor:

```
1. User buka browser → http://localhost:3000
   │
2. Nginx serve index.html → React SPA loaded
   │
3. User navigasi ke /register → DonorRegistration.jsx rendered
   │
4. User isi form 3 langkah → klik Submit
   │
5. api.js: apiService.registerPendonor(data)
   │  POST /api/pendonor { nama_lengkap, email, golongan_darah, ... }
   │
6. [Dev] Vite proxy: /api/pendonor → http://localhost:8000/pendonor
   [Docker] Nginx proxy: /api/pendonor → http://tracelt-backend:8000/pendonor
   │
7. FastAPI main.py: create_pendonor()
   │  → schemas.py: PendonorCreate validates input (Pydantic v2)
   │  → crud.py: create_pendonor()
   │     a. Normalize email
   │     b. Create Pendonor record
   │     c. Cek apakah ada Pengguna dengan email sama
   │     d. Jika ada → auto-create RiwayatDonor (linking)
   │  → database.py: commit to PostgreSQL
   │
8. Response: 201 Created { id_pendonor, nama_lengkap, ... }
   │
9. React: redirect ke halaman sukses / landing page
```

---

## 9. Dependency Summary

### Backend (Python)

| Package              | Versi   | Fungsi                              |
| -------------------- | ------- | ----------------------------------- |
| `fastapi`            | 0.115.0 | Web framework                       |
| `uvicorn`            | 0.30.0  | ASGI server                         |
| `sqlalchemy`         | 2.0.35  | ORM & database toolkit              |
| `psycopg2-binary`    | 2.9.10  | PostgreSQL driver                   |
| `python-dotenv`      | 1.0.1   | Load .env files                     |
| `pydantic[email]`    | 2.9.0   | Data validation + EmailStr          |
| `python-jose[crypto]`| 3.3.0   | JWT token encode/decode             |
| `passlib[bcrypt]`    | 1.7.4   | Password hashing                    |
| `bcrypt`             | 4.0.1   | Bcrypt algorithm implementation     |

### Frontend (Node.js)

| Package              | Versi   | Fungsi                              |
| -------------------- | ------- | ----------------------------------- |
| `react`              | 19.0.0  | UI library                          |
| `react-dom`          | 19.0.0  | React DOM renderer                  |
| `react-router-dom`   | 7.14.0  | Client-side routing                 |
| `axios`              | 1.14.0  | HTTP client                         |
| `tailwindcss`        | 4.1.14  | Utility-first CSS framework         |
| `framer-motion`      | 12.38.0 | Animation library                   |
| `recharts`           | 3.8.1   | Chart library (Bar, Pie)            |
| `lucide-react`       | 0.546.0 | Icon library                        |
| `date-fns`           | 4.1.0   | Date formatting                     |
| `vite`               | 6.2.0   | Build tool & dev server             |
| `@tailwindcss/vite`  | 4.1.14  | Tailwind Vite plugin                |
| `@vitejs/plugin-react` | 5.0.4 | React Vite plugin                   |

---

*Dokumen ini di-generate sebagai code walkthrough untuk proyek TraceIt — Kelompok A Miracle, Komputasi Awan SI ITK.*
