# Release Notes - Milestone 3

| Item | Keterangan |
| --- | --- |
| Project | TraceIt by Miracle |
| Version | `3.0.0` |
| Release type | Final release untuk UAS |
| Release date | 2026-06-12 |
| Architecture | Microservices dengan API Gateway |
| Maintainer dokumen | Lead QA & Docs |

## Ringkasan Rilis

Milestone 3 adalah rilis final TraceIt sebagai aplikasi donor darah berbasis microservices. Rilis ini menutup transisi dari aplikasi monolith menuju arsitektur production-ready yang terdiri dari frontend React, Nginx API Gateway, Auth Service, Item/Donor Service, dan dua database PostgreSQL yang dipisahkan per service.

Fokus utama rilis ini adalah stabilitas, reliability, observability, security hardening, dokumentasi final, dan kesiapan presentasi UAS.

## Perjalanan Arsitektur

| Fase | Periode | Arsitektur | Hasil utama |
| --- | --- | --- | --- |
| Foundation | Minggu 1-4 | Monolith FastAPI + React + PostgreSQL | CRUD awal, auth dasar, UI awal |
| Containerization | Minggu 5-7 | Docker Compose untuk frontend, backend, database | Aplikasi dapat dijalankan konsisten secara lokal |
| CI/CD | Minggu 9-11 | GitHub Actions + Railway | Build, test, dan deployment otomatis |
| Microservices | Minggu 12-14 | Gateway, Auth Service, Item Service, 2 DB | Service boundary, reliability, monitoring |
| Final Polish | Minggu 15 | Production-ready documentation dan QA sign-off | Kontrak API, release notes, final checklist |

## Perubahan Utama dari Milestone 2

### Microservices Decomposition

- Auth logic dipisahkan ke Auth Service.
- Data pendonor dan riwayat donor dipindahkan ke Item/Donor Service.
- Database dipisah menjadi `auth_db` dan `item_db`.
- Frontend dan semua API diakses melalui Nginx API Gateway di port `80`.
- Item/Donor Service melakukan verifikasi token ke Auth Service melalui HTTP REST internal.

### API Gateway

- Gateway menjadi satu-satunya entry point lokal untuk browser dan API client.
- Prefix `/auth/*` diarahkan ke Auth Service.
- Prefix `/pendonor`, `/pengguna`, `/riwayat-donor`, dan `/api/*` diarahkan ke Item/Donor Service.
- Header `Authorization` diteruskan ke backend service.
- Header `X-Correlation-ID` diteruskan agar request dapat ditelusuri lintas service.

### Reliability

- Item/Donor Service memiliki timeout saat memanggil Auth Service.
- Retry digunakan untuk mengurangi kegagalan sementara saat dependency lambat.
- Circuit breaker mencegah cascading failure ketika Auth Service bermasalah.
- Health check Donor Service menampilkan status dependency Auth Service dan database.
- Public endpoint seperti stok darah tetap tersedia selama tidak membutuhkan auth.

### Observability

- Structured logging dalam format JSON tersedia di service backend.
- Correlation ID membantu QA mencari log untuk satu request end-to-end.
- Metrics endpoint tersedia pada Auth Service dan Item/Donor Service.
- Gateway, Auth Service, Item/Donor Service, dan frontend memiliki health check.
- Dokumentasi observability tersedia di `docs/observability-testing.md`.

### Security Hardening

- Password disimpan menggunakan bcrypt.
- JWT memiliki expiry time dan diverifikasi melalui Auth Service.
- Secret production wajib disediakan melalui environment variable.
- `.env` tidak boleh masuk Git dan sudah tercantum di `.gitignore`.
- Database per service membatasi akses data antar domain.
- Rate limiting direkomendasikan untuk konfigurasi gateway production: auth `5 req/s`, API umum `20 req/s`, dan general/frontend `30 req/s`.
- Health dan metrics endpoint tidak menampilkan secret, password, atau token.

### Documentation dan QA

- `README.md` disusun ulang sebagai entry point dokumentasi final.
- `docs/api-contract.md` menyediakan kontrak API terpusat.
- `docs/final-checklist.md` menyediakan checklist akhir sebelum UAS.
- `docs/reliability-testing.md` dan `docs/observability-testing.md` menjadi bukti QA Modul 13-14.

## Statistik Proyek

| Metric | Nilai |
| --- | --- |
| Frontend app | 1 React/Vite app |
| API Gateway | 1 Nginx gateway |
| Backend services | 2 FastAPI services |
| Databases | 2 PostgreSQL 15 databases |
| Main containers | 6 containers: gateway, frontend, auth-service, item-service, auth-db, item-db |
| Public health endpoints | 3: `/health`, `/auth/health`, `/donor/health` |
| Metrics endpoints | 2: `/auth/metrics`, `/donor/metrics` |
| Auth endpoints via gateway | 8 documented endpoints |
| Donor/item endpoints via gateway | 17 documented endpoints |
| CI/CD workflow | `.github/workflows/ci.yml` |
| Final docs | README, API contract, release notes, final checklist |

## Komponen Rilis

| Komponen | Status rilis | Catatan |
| --- | --- | --- |
| Frontend React | Ready | Diakses melalui gateway `/` |
| API Gateway | Ready | Routing utama dan correlation ID tersedia |
| Auth Service | Ready | Register, login, verify, health, metrics |
| Item/Donor Service | Ready | Pendonor, riwayat donor, stok darah, health, metrics |
| Auth DB | Ready | PostgreSQL service untuk data auth |
| Item DB | Ready | PostgreSQL service untuk data donor |
| CI/CD | Ready | Workflow GitHub Actions tersedia |
| Documentation | Ready | Dokumen final tersedia di README dan `docs/` |

## Hasil Final Verification Lokal

Eksekusi smoke test lokal terakhir menggunakan Docker Compose menghasilkan:

| Check | Hasil |
| --- | --- |
| `docker compose up -d` | PASS, semua service running |
| `docker compose ps` | PASS, semua container utama healthy |
| `GET /health` | `200` |
| `GET /auth/health` | `200` |
| `GET /donor/health` | `200` |
| `GET /auth/metrics` | `200` |
| `GET /donor/metrics` | `200` |
| `GET /` | `200` |
| Register pengguna | `201 Created` |
| Login pengguna | `200 OK` dengan JWT |

## Known Issues dan Risiko Rilis

| Area | Risiko | Dampak | Mitigasi |
| --- | --- | --- | --- |
| Rate limiting gateway | Konfigurasi `limit_req` perlu dipastikan aktif sebelum production final | Brute force login lebih sulit dibatasi di gateway | Lead DevOps memvalidasi Nginx production config dan menambahkan test HTTP `429` |
| Secret production | Default development secret tidak boleh dipakai di Railway | Token bisa ditebak jika secret lemah | Set `SECRET_KEY` kuat minimal 32 karakter di environment Railway |
| CORS | CORS wildcard nyaman untuk lokal tetapi terlalu longgar untuk production | Origin tidak dikenal dapat mengakses API publik | Batasi `CORS_ORIGINS` ke domain frontend production |
| Data demo | Database lokal dapat berubah setelah reset volume | Demo UAS kehilangan data contoh | Siapkan seed data atau akun demo sebelum presentasi |
| Internet saat UAS | Production URL bisa terganggu oleh jaringan | Demo live tidak stabil | Siapkan rekaman demo dan jalankan Docker Compose lokal |

## Checklist Release v3.0.0

- README final sudah menjelaskan setup, arsitektur, API, security, monitoring, testing, dan kontribusi tim.
- API contract final tersedia di `docs/api-contract.md`.
- Final checklist tersedia di `docs/final-checklist.md`.
- Docker Compose menjalankan semua service utama.
- Health check dan metrics endpoint terverifikasi secara lokal.
- Register dan login pengguna lolos smoke test.
- CI/CD workflow tersedia dan siap dicek dari tab GitHub Actions.
- Tim memiliki demo script dan backup video untuk UAS.

## Rekomendasi Tag Rilis

Tag dibuat setelah semua perubahan final di-merge ke `main` dan CI hijau.

```bash
git checkout main
git pull origin main
git tag -a v3.0.0 -m "Release v3.0.0 - TraceIt Final Microservices"
git push origin v3.0.0
```

## Kesimpulan

TraceIt version `3.0.0` merepresentasikan aplikasi microservices yang siap dipresentasikan pada UAS. Sistem sudah memiliki pemisahan service, gateway routing, database per service, mekanisme auth, reliability pattern, observability dasar, dan dokumentasi final yang dapat dipakai oleh reviewer maupun anggota tim.
