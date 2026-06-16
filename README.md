#satu dua tiga

# 🩸 TraceIt — Platform Pendataan Donor Darah

[![CI/CD Pipeline](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-miracle/actions/workflows/ci.yml/badge.svg)](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-miracle/actions/workflows/ci.yml)

> **TraceIt** adalah aplikasi berbasis web untuk membantu pendataan pendonor darah sukarela, pencatatan riwayat donor, verifikasi data donor, dan pemantauan stok darah publik. Sistem ini dikembangkan dengan arsitektur **microservices** menggunakan React, Nginx API Gateway, FastAPI, PostgreSQL, Docker Compose, dan GitHub Actions.

---

## 🌐 Live Demo

| Service          | URL                                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Frontend         | [https://tracelt-frontend-production.up.railway.app/](https://tracelt-frontend-production.up.railway.app/)       |
| Backend          | [https://tracelt-backend-production.up.railway.app/](https://tracelt-backend-production.up.railway.app/)         |
| Backend Docs API | [https://tracelt-backend-production.up.railway.app/docs](https://tracelt-backend-production.up.railway.app/docs) |

## 🔄 CI/CD

[![CI/CD Pipeline](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-miracle/actions/workflows/ci.yml/badge.svg)](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-miracle/actions/workflows/ci.yml)

Pipeline otomatis berjalan pada `push` dan `pull_request` ke branch utama.

1. ✅ Validasi backend dan dependency Python
2. ✅ Validasi frontend React/Vite
3. ✅ Build Docker image
4. ✅ Integration test dengan Docker Compose
5. 🚀 Deploy ke cloud platform saat perubahan sudah masuk branch utama

### Workflow CI/CD

- Pull Request → menjalankan build dan test otomatis
- Merge ke `main` → menjalankan CI dan proses deploy sesuai konfigurasi workflow
- Badge di README menampilkan status pipeline terbaru

---

## 🌟 Highlight Utama

- 🔐 Login pengguna dan admin menggunakan JWT
- 🧑‍⚕️ Pendaftaran data pendonor darah
- 🩸 Pencatatan dan verifikasi riwayat donor
- 📊 Stok darah publik berdasarkan riwayat donor terverifikasi
- 🚪 API Gateway Nginx sebagai satu pintu akses service
- 🐳 Fully Dockerized dengan Docker Compose
- 📈 Structured logging, metrics endpoint, health check, dan correlation ID
- 🔁 Retry, timeout, dan circuit breaker untuk komunikasi antar-service

---

## 📋 Daftar Isi

1. [Tentang TraceIt](#-tentang-traceit)
2. [Fitur Sistem](#-fitur-sistem)
3. [Fitur Per Role](#-fitur-per-role)
4. [Arsitektur Sistem](#️-arsitektur-sistem)
5. [Tech Stack](#️-tech-stack)
6. [Dokumentasi API](#-dokumentasi-api)
7. [Security & Monitoring](#-security--monitoring)
8. [Testing](#-testing)
9. [Panduan Menjalankan](#-panduan-menjalankan)
10. [Struktur Proyek](#-struktur-proyek)
11. [Tim Pengembang](#-tim-pengembang)
12. [Roadmap](#-roadmap)

---

## 🧩 Tentang TraceIt

TraceIt hadir sebagai solusi digital untuk pengelolaan data pendonor darah di lingkungan Institut Teknologi Kalimantan. Aplikasi ini membantu pendonor mendaftarkan data diri, membantu admin memverifikasi riwayat donor, dan membantu pengguna umum melihat informasi stok darah yang tersedia.

Masalah yang diselesaikan:

- Data pendonor sering tersebar dan sulit dicari saat dibutuhkan
- Riwayat donor perlu dicatat agar stok darah lebih mudah dipantau
- Admin membutuhkan dashboard untuk memverifikasi data donor
- Tim pengembang membutuhkan sistem yang mudah dijalankan, diuji, dan dipantau

---

## ✨ Fitur Sistem

### 🎯 Core Features

- Registrasi dan login pengguna
- Registrasi dan login admin
- Pendaftaran data pendonor
- Daftar pendonor dengan filter dan pagination
- Pencatatan riwayat donor
- Verifikasi atau penolakan riwayat donor
- Stok darah publik
- Dashboard pengguna dan admin
- Status page untuk memantau service

---

## 👥 Fitur Per Role

### 👤 Pengguna / Pendonor

- Register dan login sebagai pengguna
- Mengisi data pendonor
- Membuat riwayat donor milik sendiri
- Melihat riwayat donor yang sudah dibuat
- Melihat stok darah publik

---

### 🛡️ Admin

- Register dan login sebagai admin
- Melihat daftar pendonor
- Melihat antrean riwayat donor
- Memverifikasi atau menolak riwayat donor
- Memantau status service melalui halaman status

---

### 👀 Pengunjung Publik

- Melihat landing page
- Melihat stok darah publik
- Melihat informasi umum aplikasi

---

## 🏗️ Arsitektur Sistem

TraceIt menggunakan arsitektur **microservices**. Frontend dan seluruh API diakses melalui **Nginx API Gateway** pada port `80`.

```mermaid
flowchart TD
    USER["User Browser"] --> GW["API Gateway\nNginx :80"]
    GW -->|"/"| FE["Frontend\nReact + Vite"]
    GW -->|"/auth/*"| AUTH["Auth Service\nFastAPI :8001"]
    GW -->|"/pendonor, /pengguna, /riwayat-donor, /api/*"| ITEM["Item/Donor Service\nFastAPI :8002"]
    AUTH --> AUTHDB[("auth_db\nPostgreSQL 15")]
    ITEM --> ITEMDB[("item_db\nPostgreSQL 15")]
    ITEM -.->|"GET /verify"| AUTH
```

### 🔹 Komponen Utama

| Komponen               | Container              | Fungsi                                                     |
| ---------------------- | ---------------------- | ---------------------------------------------------------- |
| **Frontend**           | `tracelt-frontend`     | Menyediakan UI React untuk pengguna dan admin              |
| **API Gateway**        | `tracelt-gateway`      | Routing request frontend dan API ke service tujuan         |
| **Auth Service**       | `tracelt-auth-service` | Register, login, verifikasi JWT, health check, metrics     |
| **Item/Donor Service** | `tracelt-item-service` | Pendonor, riwayat donor, stok darah, profile user, metrics |
| **Auth DB**            | `tracelt-auth-db`      | Database khusus data autentikasi                           |
| **Item DB**            | `tracelt-item-db`      | Database khusus data pendonor dan riwayat donor            |

### 🔹 Karakteristik Sistem

- 🔐 **JWT Authentication** untuk pengguna dan admin
- 🚪 **Single Entry Point** melalui Nginx API Gateway
- 🧱 **Database per Service** untuk memisahkan domain data
- 🔁 **Reliability Pattern** dengan retry, timeout, dan circuit breaker
- 📊 **Observability** melalui structured logging, metrics, health check, dan correlation ID
- 🐳 **Containerized Deployment** dengan Docker Compose

---

## 🛠️ Tech Stack

TraceIt dibangun menggunakan teknologi modern berbasis web dan cloud-native development.

### 🎨 Frontend

| Teknologi        | Fungsi       | Penjelasan                                                     |
| ---------------- | ------------ | -------------------------------------------------------------- |
| **React**        | UI Framework | Membangun antarmuka pengguna berbasis komponen                 |
| **Vite**         | Build Tool   | Menjalankan development server dan build frontend dengan cepat |
| **React Router** | Routing      | Mengatur halaman landing, login, admin, user, dan status       |
| **Axios**        | HTTP Client  | Menghubungkan frontend dengan API Gateway                      |
| **Tailwind CSS** | Styling      | Membantu styling UI responsif dan konsisten                    |

### ⚙️ Backend

| Teknologi        | Fungsi        | Penjelasan                                                     |
| ---------------- | ------------- | -------------------------------------------------------------- |
| **FastAPI**      | API Framework | Menyediakan REST API untuk Auth Service dan Item/Donor Service |
| **SQLAlchemy**   | ORM           | Mengelola model dan query database PostgreSQL                  |
| **Pydantic**     | Validation    | Memvalidasi request dan response schema                        |
| **Uvicorn**      | ASGI Server   | Menjalankan aplikasi FastAPI                                   |
| **bcrypt + JWT** | Auth          | Hash password dan token-based authentication                   |

### 🗄️ Database & Infrastructure

| Teknologi          | Fungsi           | Penjelasan                                       |
| ------------------ | ---------------- | ------------------------------------------------ |
| **PostgreSQL 15**  | Database         | Menyimpan data auth, pendonor, dan riwayat donor |
| **Nginx**          | API Gateway      | Reverse proxy dan routing antar-service          |
| **Docker**         | Containerization | Membungkus service agar konsisten dijalankan     |
| **Docker Compose** | Orchestration    | Menjalankan semua container dalam satu command   |
| **GitHub Actions** | CI/CD            | Menjalankan pipeline otomatis                    |
| **Railway**        | Deployment       | Platform cloud untuk deployment production       |

---

## 📚 Dokumentasi API

Semua endpoint lokal diakses melalui API Gateway:

```text
http://localhost
```

### Endpoint Summary

| Category               | Total Endpoint |
| ---------------------- | -------------: |
| Swagger/Monolith Total |             32 |
| Micro API Total        |             29 |
| Auth Service           |              9 |
| Item/Donor Service     |             20 |

### Notes

- Total endpoint pada Micro API adalah 29 endpoint, terdiri dari 9 endpoint pada Auth Service dan 20 endpoint pada Item/Donor Service.
- Jumlah 32 endpoint yang terlihat pada Swagger UI merupakan total endpoint pada Swagger/monolith secara keseluruhan, sehingga tidak seluruhnya dihitung sebagai endpoint Micro API.
- Endpoint gateway/monolith tambahan seperti `/`, `/health`, `/metrics`, `/info`, atau alias `/api/auth/*` tidak dimasukkan ke hitungan Micro API.

### Auth Service Endpoints

|  No | Method | Endpoint                  | Description               |
| --: | ------ | ------------------------- | ------------------------- |
|   1 | `GET`  | `/auth/health`            | Health check Auth Service |
|   2 | `POST` | `/auth/register`          | Registrasi user umum      |
|   3 | `POST` | `/auth/pengguna/register` | Registrasi pengguna       |
|   4 | `POST` | `/auth/admin/register`    | Registrasi admin          |
|   5 | `POST` | `/auth/login`             | Login user umum           |
|   6 | `POST` | `/auth/pengguna/login`    | Login pengguna            |
|   7 | `POST` | `/auth/admin/login`       | Login admin               |
|   8 | `GET`  | `/auth/verify`            | Verifikasi JWT            |
|   9 | `GET`  | `/auth/metrics`           | Metrics Auth Service      |

### Item/Donor Service Endpoints

|  No | Method   | Endpoint                                 | Description                        |
| --: | -------- | ---------------------------------------- | ---------------------------------- |
|   1 | `GET`    | `/donor/health`                          | Health check Item/Donor Service    |
|   2 | `GET`    | `/api/public/blood-stock`                | Stok darah publik                  |
|   3 | `GET`    | `/pendonor/stats`                        | Statistik pendonor                 |
|   4 | `POST`   | `/pendonor`                              | Membuat data pendonor              |
|   5 | `GET`    | `/pendonor`                              | Daftar pendonor                    |
|   6 | `GET`    | `/pendonor/{pendonor_id}`                | Detail pendonor                    |
|   7 | `PUT`    | `/pendonor/{pendonor_id}`                | Update pendonor                    |
|   8 | `DELETE` | `/pendonor/{pendonor_id}`                | Hapus pendonor                     |
|   9 | `POST`   | `/riwayat-donor`                         | Membuat riwayat donor              |
|  10 | `GET`    | `/riwayat-donor`                         | Daftar riwayat donor               |
|  11 | `GET`    | `/riwayat-donor/pendonor/{pendonor_id}`  | Riwayat donor berdasarkan pendonor |
|  12 | `GET`    | `/riwayat-donor/{riwayat_id}`            | Detail riwayat donor               |
|  13 | `POST`   | `/riwayat-donor/{riwayat_id}/verifikasi` | Verifikasi riwayat donor           |
|  14 | `GET`    | `/pengguna/me`                           | Profil pengguna login              |
|  15 | `POST`   | `/pengguna/riwayat-donor`                | Membuat riwayat donor milik user   |
|  16 | `GET`    | `/pengguna/riwayat-donor`                | Daftar riwayat donor milik user    |
|  17 | `GET`    | `/pengguna/riwayat-donor/{riwayat_id}`   | Detail riwayat donor milik user    |
|  18 | `PUT`    | `/pengguna/riwayat-donor/{riwayat_id}`   | Update riwayat donor milik user    |
|  19 | `DELETE` | `/pengguna/riwayat-donor/{riwayat_id}`   | Hapus riwayat donor milik user     |
|  20 | `GET`    | `/donor/metrics`                         | Metrics Item/Donor Service         |

Dokumentasi kontrak API lengkap tersedia di [`docs/api-contract.md`](docs/api-contract.md).

---

## 🔐 Security & Monitoring

### Security

- Password disimpan menggunakan bcrypt
- JWT digunakan untuk autentikasi pengguna dan admin
- Secret production disimpan melalui environment variable
- `.env` tidak di-commit ke repository
- Auth DB dan Item DB dipisahkan sesuai domain service
- Gateway meneruskan header `Authorization` ke service tujuan

### Monitoring & Observability

- Health check tersedia pada gateway dan service backend
- Metrics endpoint tersedia untuk Auth Service dan Donor Service
- Structured logging menggunakan format JSON
- Correlation ID diteruskan dari gateway ke backend
- Circuit breaker membantu mencegah cascading failure saat Auth Service bermasalah

---

## 🧪 Testing

### Frontend

```bash
cd frontend
npm test
npm run build
```

### Backend Legacy/Core

```bash
cd backend
pip install -r requirements.txt
pytest
```

### Integration Test

```bash
pip install httpx pytest
pytest tests/integration -v
```

### Smoke Test Docker

```bash
docker compose up -d
curl http://localhost/health
curl http://localhost/auth/health
curl http://localhost/donor/health
curl http://localhost/api/public/blood-stock
```

---

## 🚀 Panduan Menjalankan

### 🐳 Menjalankan dengan Docker Compose

Jalankan dari root repository:

```bash
docker compose up --build -d
```

Cek status container:

```bash
docker compose ps
```

Hentikan semua service:

```bash
docker compose down
```

Hapus container dan volume database lokal:

```bash
docker compose down -v
```

---

### 💻 Menjalankan Tanpa Docker

Mode ini digunakan jika ingin menjalankan service satu per satu untuk debugging.

#### Auth Service

```powershell
cd services/auth-service
pip install -r requirements.txt
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5433/auth_db"
$env:SECRET_KEY="traceit-local-dev-secret"
$env:SERVICE_NAME="auth-service"
uvicorn main:app --reload --port 8001
```

#### Item/Donor Service

```powershell
cd services/item-service
pip install -r requirements.txt
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5434/item_db"
$env:AUTH_SERVICE_URL="http://localhost:8001"
$env:SERVICE_NAME="item-service"
uvicorn main:app --reload --port 8002
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Untuk QA end-to-end, gunakan Docker Compose karena gateway dan semua service langsung tersambung seperti production-like environment.

---

## 📁 Struktur Proyek

Struktur berikut mengikuti file yang sudah masuk Git dan menjadi bagian dari repository GitHub.

```text
cc-kelompok-a-miracle/
├── .github/
│   ├── CODEOWNERS
│   ├── copilot-instructions.md
│   ├── pull_request_template.md
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── CHANGELOG.md
├── Makefile
├── README.md
├── backend/
│   ├── .dockerignore
│   ├── .env.docker
│   ├── .env.example
│   ├── .railwayignore
│   ├── Dockerfile
│   ├── auth.py
│   ├── config.py
│   ├── crud.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── ruff.toml
│   ├── schemas.py
│   ├── setup.sh
│   ├── test_db_connection.py
│   ├── test_pagination.py
│   ├── scripts/
│   │   └── wait-for-db.sh
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_health.py
│       ├── test_items.py
│       ├── test_pendonor.py
│       └── test_riwayat_donor.py
├── frontend/
│   ├── .dockerignore
│   ├── .env.example
│   ├── .env.production
│   ├── .gitignore
│   ├── .railwayignore
│   ├── Dockerfile
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── metadata.json
│   ├── nginx.conf
│   ├── package-lock.json
│   ├── package.json
│   ├── public/
│   │   ├── 404.html
│   │   ├── 50x.html
│   │   └── vite.svg
│   ├── src/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── AboutPage.jsx
│   │   │   ├── AdminDashboardCharts.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AuthServiceBanner.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── ItemCard.jsx
│   │   │   ├── ItemForm.jsx
│   │   │   ├── ItemList.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── ServiceUnavailable.jsx
│   │   │   └── __tests__/
│   │   │       ├── Header.test.jsx
│   │   │       ├── ItemCard.test.jsx
│   │   │       ├── ItemForm.test.jsx
│   │   │       ├── ItemList.test.jsx
│   │   │       └── SearchBar.test.jsx
│   │   ├── hooks/
│   │   │   └── useDarkMode.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsersDashboard.jsx
│   │   │   ├── DonorList.jsx
│   │   │   ├── DonorRegistration.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── PublicStock.jsx
│   │   │   ├── StatusPage.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── UserRegister.jsx
│   │   │   └── VerificationQueue.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── test/
│   │       ├── api.test.js
│   │       └── setup.js
│   └── vite.config.js
├── services/
│   ├── auth-service/
│   │   ├── Dockerfile
│   │   ├── database.py
│   │   ├── logging_config.py
│   │   ├── logging_middleware.py
│   │   ├── main.py
│   │   ├── metrics.py
│   │   ├── models.py
│   │   ├── requirements.txt
│   │   ├── schemas.py
│   │   └── tests/
│   │       ├── __init__.py
│   │       └── test_metrics_alerting.py
│   ├── item-service/
│   │   ├── Dockerfile
│   │   ├── auth_client.py
│   │   ├── circuit_breaker.py
│   │   ├── database.py
│   │   ├── logging_config.py
│   │   ├── logging_middleware.py
│   │   ├── main.py
│   │   ├── metrics.py
│   │   ├── models.py
│   │   ├── requirements.txt
│   │   ├── schemas.py
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── test_item_stats.py
│   │       └── test_metrics_alerting.py
│   ├── gateway/
│   │   └── nginx.conf
│   └── shared/
│       ├── __init__.py
│       ├── logging_config.py
│       ├── logging_middleware.py
│       ├── main.py
│       ├── metrics.py
│       └── requirements.txt
├── tests/
│   └── integration/
│       ├── conftest.py
│       └── test_cross_service.py
├── docs/
│   ├── CCMiracle.png
│   ├── ERD CP.drawio.png
│   ├── ERD Konseptual.drawio.png
│   ├── Screenshot 2026-03-15 160027.png
│   ├── Screenshot 2026-03-15 191934.png
│   ├── UTS-demo-langkah.md
│   ├── UTS-demo-script.md
│   ├── api-test-results.md
│   ├── architecture.md
│   ├── database-schema.md
│   ├── docker-architecture.md
│   ├── git-workflow.md
│   ├── image.png
│   ├── image-1.png
│   ├── image-2.png
│   ├── image-3.png
│   ├── image-4.png
│   ├── image-5.png
│   ├── image-6.png
│   ├── image-7.png
│   ├── image-8.png
│   ├── image-9.png
│   ├── image-10.png
│   ├── image-11.png
│   ├── image-12.png
│   ├── image-13.png
│   ├── image-14.png
│   ├── image-15.png
│   ├── image-16.png
│   ├── image-17.png
│   ├── image2.png
│   ├── laporan-CICD-image-optimation.md
│   ├── member-Avhilla.md
│   ├── member-BETRAN.md
│   ├── member-Chelsy.md
│   ├── member-YOSAN.md
│   ├── member-intan.md
│   ├── milestone1-retrospective.md
│   ├── milestone2-release.md
│   ├── production-test.md
│   ├── release-notes-m2.md
│   ├── reliability-testing.md
│   ├── observability-testing.md
│   ├── testing-guide.md
│   └── ui-test-results.md
├── scripts/
│   ├── docker-run.sh
│   ├── logs.ps1
│   ├── logs.sh
│   └── migrate_data.py
├── image.png
├── image-1.png
├── image-2.png
├── image-3.png
├── image-4.png
├── image-5.jpeg
├── package-lock.json
├── testingrepo.md
├── test.txt
├── tash apply 4b1e286
├── docker-compose.yml
├── docker-compose.dev.yml
└── docker-compose.prod.yml
```

---

## 👨‍💻 Tim Pengembang

| Nama                     | NIM      | Peran                   | Kontribusi Utama                                         |
| ------------------------ | -------- | ----------------------- | -------------------------------------------------------- |
| Debora Intania Subekti   | 10231029 | Lead Backend            | Auth flow, endpoint FastAPI, business logic backend      |
| Avhilla Catton Andalucia | 10231021 | Lead Container / DevOps | Docker Compose, Dockerfile, gateway, konfigurasi service |
| Chelsy Olivia            | 10231025 | Lead CI/CD & Deploy     | GitHub Actions, deployment, release validation           |
| Yosan Pratiwi            | 10231091 | Lead Frontend           | React UI, dashboard user/admin, halaman status           |
| Betran                   | 10231023 | Lead QA & Docs          | Testing, API docs, release notes, final checklist        |

---

## 🗺️ Roadmap

| Minggu | Target                                        | Status             |
| ------ | --------------------------------------------- | ------------------ |
| 1-4    | Foundation, REST API, database, frontend awal | ✅ Selesai         |
| 5-7    | Docker dan containerization                   | ✅ Selesai         |
| 8      | UTS demo milestone 1                          | ✅ Selesai         |
| 9-11   | CI/CD dan cloud deployment                    | ✅ Selesai         |
| 12-14  | Microservices, reliability, monitoring        | ✅ Selesai         |
| 15     | Final polish, security, dokumentasi UAS       | ✅ Selesai         |
| 16     | UAS demo final                                | ⏳ Siap presentasi |

---

## 📌 Dokumentasi Pendukung

| Dokumen                                                          | Isi                                             |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| [`docs/api-contract.md`](docs/api-contract.md)                   | Kontrak API Auth Service dan Item/Donor Service |
| [`docs/release-notes-m3.md`](docs/release-notes-m3.md)           | Release notes final version `3.0.0`             |
| [`docs/final-checklist.md`](docs/final-checklist.md)             | Checklist akhir sebelum UAS                     |
| [`docs/architecture.md`](docs/architecture.md)                   | Detail arsitektur microservices                 |
| [`docs/reliability-testing.md`](docs/reliability-testing.md)     | Pengujian retry, timeout, circuit breaker       |
| [`docs/observability-testing.md`](docs/observability-testing.md) | Pengujian logging, metrics, dan correlation ID  |
| [`docs/production-test.md`](docs/production-test.md)             | Catatan QA production                           |

---

## ✅ Status Akhir

TraceIt sudah berada pada tahap final polish untuk UAS. Sistem dapat dijalankan secara lokal menggunakan Docker Compose, memiliki dokumentasi API, release notes, checklist QA, serta observability dasar untuk mendukung proses debugging dan presentasi akhir.
