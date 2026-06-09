# Changelog

## [1.0.0] - 2026-05-04 (Milestone 1)

### Added
- Full project setup untuk aplikasi **TraceIt** (Pengajuan Pendonor Darah)
- Struktur folder `backend` (FastAPI) dan `frontend` (React)
- Docker Compose setup (`docker-compose.yml` + `docker-compose.prod.yml`)
- Database PostgreSQL dengan volume persistence
- Backend API lengkap:
  - Authentication (Admin & Pengguna)
  - CRUD Pendonor
  - Riwayat Donor + Verifikasi
  - Health check endpoint
- Frontend React SPA dengan Nginx
- Makefile untuk development workflow
- GitHub PR Template untuk standardisasi kontribusi tim
- CHANGELOG.md mengikuti Keep a Changelog
- Dokumentasi lengkap di README.md (Architecture, Tech Stack, Team, dll)

### Changed
- Update Dockerfile frontend
- Penyesuaian konfigurasi Docker network dan environment

### Chore
- Inisialisasi repository GitHub Classroom
- Setup CI/CD dasar dan best practices
- Penambahan .gitignore dan konfigurasi awal
- Penambahan file coreowners di folder .github

---

## [2.0.0] - 2026-06-09 (Modul 12–14: Microservices & Observability)

### Fixed — Kritis

- **`docker-compose.yml`**: Hapus semua duplikasi service definition (`auth-db`, `item-db`, `auth-service`, `item-service` masing-masing terdefinisi dua kali). Port `5433:5432` dipindah ke `auth-db` (sebelumnya salah berada di `auth-service`). Blok `gateway.depends_on` yang mencampur format object dan list diperbaiki.
- **`services/gateway/nginx.conf`**: Upstream `donor_service` menunjuk ke `donor-service:8002` yang tidak ada — diganti ke `item-service:8002`. Blok `location /items {` yang tidak tertutup dan blok `location /health` duplikat dihapus.
- **`.gitignore`**: Hapus dua baris shell command (`cat .gitignore | grep .env` dan `# Harus ada baris: .env`) yang tidak sengaja tersimpan sebagai konten file.

### Added — Modul 13 (Reliability)

- **`services/item-service/circuit_breaker.py`**: Implementasi Circuit Breaker (CLOSED → OPEN → HALF_OPEN) dengan `failure_threshold=5` dan `cooldown_seconds=30`.
- **`services/item-service/auth_client.py`**: Retry logic 3x dengan exponential backoff (0.5s, 1s, 2s) dan integrasi circuit breaker.
- **`tests/integration/conftest.py`** + **`test_cross_service.py`**: 8 integration test yang memverifikasi komunikasi antar Auth Service dan Donor Service.
- **`scripts/migrate_data.py`**: Script migrasi data dari monolith ke microservices (auth_db + item_db).
- **`docker-compose.dev.yml`**: Override untuk development (hot-reload).
- **`deploy.resources.limits`** di semua services: CPU dan memory limits.

### Changed — Domain TraceLT (Item Service → Donor Service)

- **`services/item-service/models.py`**: Ganti `Item` → `Pendonor` + `RiwayatDonor` (identik dengan `backend/models.py`). `id_pengguna` pada `RiwayatDonor` adalah integer tanpa FK (cross-database reference ke auth_db).
- **`services/item-service/schemas.py`**: Ganti semua schema `Item*` dengan `Pendonor*`, `RiwayatDonor*`, `PublicBloodStockResponse`, `PendonorStatsResponse`, `PenggunaMeResponse`.
- **`services/item-service/main.py`**: Ganti semua endpoint `/items*` dengan endpoint TraceLT yang sesuai `backend/main.py`: `/pendonor`, `/riwayat-donor`, `/pengguna/riwayat-donor`, `/api/public/blood-stock`, `/pendonor/stats` (degraded mode), `/pengguna/me`.
- **`services/gateway/nginx.conf`**: Route `/items` dihapus, diganti dengan `/pendonor`, `/riwayat-donor`, `/pengguna`, `/api/public`.

### Added — Modul 14.1 (Structured Logging)

- **`services/shared/logging_config.py`**: `JSONFormatter` — format log sebagai JSON dengan field `timestamp`, `level`, `service`, `logger`, `message`, `correlation_id`, `method`, `path`, `status_code`, `duration_ms`.
- **`services/shared/logging_middleware.py`**: `RequestLoggingMiddleware` — log setiap HTTP request/response dengan timing dan correlation ID.
- **`services/auth-service/logging_config.py`** + **`logging_middleware.py`**: Copy dari shared, sudah diintegrasikan ke auth-service.
- **`services/item-service/logging_config.py`** + **`logging_middleware.py`**: Copy dari shared, sudah diintegrasikan ke item-service.
- **`docker-compose.yml`**: Tambah `SERVICE_NAME` dan `LOG_LEVEL` di `environment` auth-service dan item-service.

### Added — Modul 14.2 (Correlation ID)

- **`services/item-service/auth_client.py`**: Parameter `correlation_id` diteruskan sebagai header `X-Correlation-ID` ke Auth Service. Semua log menyertakan `correlation_id`. Dependency `verify_token_with_auth_service` menerima `Request` untuk mengambil `correlation_id` dari `request.state`.
- **`services/gateway/nginx.conf`**: Tambah `map` directive untuk generate `X-Correlation-ID` dari `$request_id` nginx jika client tidak mengirim header tersebut. Semua API route meneruskan header ini ke upstream dan menambahkannya ke response.

### Changed — Infrastruktur

- **`.gitignore`**: Tambah `changelog.md`, `docs/changelog.md`, `modul/`, `moduls/`.

---