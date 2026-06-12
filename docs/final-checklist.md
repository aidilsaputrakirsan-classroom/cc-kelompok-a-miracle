# Final Checklist - TraceIt v3.0.0

Dokumen ini adalah lembar centang akhir untuk Lead QA & Docs sebelum UAS. Checklist mencakup kode, dokumentasi, Docker Compose, API, CI/CD, security, monitoring, dan kesiapan presentasi tim.

## Metadata Verifikasi

| Item | Keterangan |
| --- | --- |
| Project | TraceIt by Miracle |
| Version target | `3.0.0` |
| Fase | Final Polish / UAS Preparation |
| Tanggal QA lokal | 2026-06-12 |
| PIC | Betran, Lead QA & Docs |
| Environment utama | Docker Compose lokal di Windows |
| Base URL lokal | `http://localhost` |

## 1. Repository Readiness

| Checklist | Status | Bukti / Catatan |
| --- | --- | --- |
| README final tersedia | PASS | `README.md` menjelaskan overview, arsitektur, setup, endpoint, security, monitoring, testing, dan kontribusi |
| API contract final tersedia | PASS | `docs/api-contract.md` berisi kontrak Auth Service dan Item/Donor Service |
| Release notes Milestone 3 tersedia | PASS | `docs/release-notes-m3.md` menjelaskan version `3.0.0` |
| Final checklist tersedia | PASS | `docs/final-checklist.md` menjadi bukti QA akhir |
| `.env` diabaikan Git | PASS | `.gitignore` memuat `.env` |
| Folder dependency tidak di-commit | PASS | `.gitignore` memuat `node_modules/`, `dist/`, `__pycache__/`, dan `*.pyc` |
| File panduan lokal tidak menjadi artefak rilis | PASS | `.panduan/` tercantum di `.gitignore` |
| Tag release disiapkan | READY | Tag `v3.0.0` dibuat setelah merge final ke `main` dan CI hijau |

## 2. Code dan Service Readiness

| Checklist | Status | Bukti / Catatan |
| --- | --- | --- |
| Frontend React tersedia | PASS | Folder `frontend/`, Vite, dan React tersedia |
| API Gateway tersedia | PASS | `services/gateway/nginx.conf` mengatur routing gateway |
| Auth Service tersedia | PASS | `services/auth-service/` berisi FastAPI auth, schemas, database, metrics, logging |
| Item/Donor Service tersedia | PASS | `services/item-service/` berisi FastAPI donor, auth client, circuit breaker, metrics, logging |
| Database per service tersedia | PASS | `auth-db` dan `item-db` ada di `docker-compose.yml` |
| Health check container tersedia | PASS | Health check didefinisikan untuk DB, services, frontend, dan gateway |
| Logging middleware tersedia | PASS | Backend service memakai `RequestLoggingMiddleware` |
| Metrics endpoint tersedia | PASS | `/auth/metrics` dan `/donor/metrics` tersedia melalui gateway |

## 3. Docker Compose Verification

Jalankan:

```bash
docker compose up -d
docker compose ps
```

| Service | Ekspektasi | Status QA |
| --- | --- | --- |
| `tracelt-gateway` | `Up` dan `healthy`, port `80:80` | PASS |
| `tracelt-frontend` | `Up` dan `healthy` | PASS |
| `tracelt-auth-service` | `Up` dan `healthy` | PASS |
| `tracelt-item-service` | `Up` dan `healthy` | PASS |
| `tracelt-auth-db` | `Up` dan `healthy`, port `5433:5432` | PASS |
| `tracelt-item-db` | `Up` dan `healthy`, port `5434:5432` | PASS |

## 4. API Smoke Test

Jalankan dari root repository setelah Docker Compose aktif.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/health
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/auth/health
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/donor/health
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/auth/metrics
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/donor/metrics
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/
```

| Endpoint | Ekspektasi | Hasil QA lokal |
| --- | --- | --- |
| `GET /health` | `200` | PASS, `200` |
| `GET /auth/health` | `200` | PASS, `200` |
| `GET /donor/health` | `200` jika dependency sehat | PASS, `200` |
| `GET /auth/metrics` | `200` | PASS, `200` |
| `GET /donor/metrics` | `200` | PASS, `200` |
| `GET /` | `200` | PASS, `200` |

## 5. Authentication Smoke Test

### Register pengguna

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost/auth/pengguna/register \
  -H "Content-Type: application/json" \
  -d '{"email":"qa.final@example.com","password":"FinalPass123","nama_pengguna":"QA Final"}'
```

Ekspektasi: `201` untuk email baru, atau `400` jika email sudah pernah dipakai pada database lokal.

### Login pengguna

```bash
curl -s -X POST http://localhost/auth/pengguna/login \
  -H "Content-Type: application/json" \
  -d '{"email":"qa.final@example.com","password":"FinalPass123"}'
```

Ekspektasi:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature",
  "token_type": "bearer"
}
```

| Skenario | Ekspektasi | Status QA |
| --- | --- | --- |
| Register pengguna baru | `201 Created` | PASS pada email unik lokal |
| Login pengguna valid | `200 OK` dan JWT | PASS |
| Login password salah | `401 Unauthorized` | Siap diuji saat dry run |
| Verify token | `200 OK` dengan data user | Siap diuji saat dry run |

## 6. Documentation Checklist

| Dokumen | Status | Catatan |
| --- | --- | --- |
| `README.md` | PASS | Menjadi landing page dokumentasi GitHub |
| `docs/api-contract.md` | PASS | Memuat endpoint, auth, header, error response, dan contoh payload |
| `docs/release-notes-m3.md` | PASS | Memuat transisi monolith ke microservices dan statistik proyek |
| `docs/final-checklist.md` | PASS | Memuat checklist final untuk QA dan UAS |
| `docs/architecture.md` | PASS | Menjelaskan arsitektur microservices lebih detail |
| `docs/reliability-testing.md` | PASS | Bukti retry, timeout, circuit breaker |
| `docs/observability-testing.md` | PASS | Bukti structured logging, metrics, correlation ID |
| `docs/production-test.md` | PASS | Catatan hasil QA production sebelumnya |

## 7. Security Checklist

| Checklist | Status | Catatan |
| --- | --- | --- |
| Password user di-hash | PASS | Auth Service memakai bcrypt |
| JWT token digunakan | PASS | Login mengembalikan `access_token` dan `token_type` |
| JWT expiry tersedia | PASS | `TOKEN_EXPIRE_MINUTES` default 30 menit |
| `.env` tidak di-commit | PASS | `.env` tercantum di `.gitignore` |
| Secret production via env var | READY | Railway atau production host wajib mengisi `SECRET_KEY` kuat |
| Database per service | PASS | `auth_db` dan `item_db` dipisahkan |
| Metrics tidak mengekspos secret | PASS | Metrics berisi request/error/latency summary |
| Rate limiting gateway | REVIEW | Direkomendasikan untuk production: auth 5 req/s, API 20 req/s, general 30 req/s |
| CORS production | REVIEW | Batasi `CORS_ORIGINS` ke domain frontend production sebelum go-live |

## 8. Monitoring dan Reliability Checklist

| Checklist | Status | Catatan |
| --- | --- | --- |
| Gateway health | PASS | `/health` mengembalikan `200` |
| Auth health | PASS | `/auth/health` mengembalikan `200` |
| Donor health | PASS | `/donor/health` mengembalikan `200` saat dependency sehat |
| Auth metrics | PASS | `/auth/metrics` mengembalikan `200` |
| Donor metrics | PASS | `/donor/metrics` mengembalikan `200` |
| Structured logging | PASS | Backend memakai logging middleware dan JSON formatter |
| Correlation ID | PASS | Gateway meneruskan `X-Correlation-ID` ke backend |
| Retry dan timeout | PASS | Item/Donor Service memiliki auth client untuk dependency Auth Service |
| Circuit breaker | PASS | Donor health melaporkan state dependency Auth Service |

## 9. CI/CD Checklist

| Checklist | Status | Bukti / Catatan |
| --- | --- | --- |
| Workflow tersedia | PASS | `.github/workflows/ci.yml` |
| Badge CI tampil di README | PASS | Badge GitHub Actions ada di bagian atas README |
| CI dicek sebelum merge | READY | Buka tab Actions dan pastikan run terbaru hijau |
| Deployment production dicek | READY | Validasi ulang Railway URL sebelum UAS |
| Tag release disiapkan | READY | Buat `v3.0.0` setelah merge final |

## 10. Presentation Readiness

| Checklist | Status | Catatan |
| --- | --- | --- |
| Slide 5-7 halaman tersedia | READY | Isi: problem, architecture journey, tech stack, demo, challenges, team contribution |
| Demo script tersedia | READY | Gunakan flow register, login, create donor, view stock, status page |
| Backup video tersedia | READY | Rekam demo 3-5 menit untuk mitigasi internet gagal |
| Data demo tersedia | READY | Gunakan akun `qa.final@example.com` atau akun demo baru |
| Semua anggota paham arsitektur | READY | Latihan Q&A sebelum UAS |
| Production URL dicek ulang | READY | Jalankan smoke test production pada hari presentasi |

## 11. Suggested Demo Flow

1. Buka `http://localhost` atau production URL.
2. Tunjukkan landing page TraceIt.
3. Register pengguna baru.
4. Login sebagai pengguna.
5. Buat data pendonor.
6. Lihat daftar pendonor dan filter golongan darah.
7. Buat riwayat donor.
8. Login admin atau gunakan token demo admin.
9. Verifikasi riwayat donor.
10. Buka stok darah publik.
11. Buka status page atau endpoint `/donor/health`.
12. Tunjukkan GitHub Actions badge dan dokumen API contract.

## 12. Sign-off

| Peran | Nama | Status | Catatan |
| --- | --- | --- | --- |
| Lead Backend | Debora Intania Subekti | Ready | Endpoint utama dan auth flow siap didemokan |
| Lead Container / DevOps | Avhilla Catton Andalucia | Ready | Docker Compose dan gateway siap divalidasi |
| Lead CI/CD & Deploy | Chelsy Olivia | Ready | CI/CD dan deployment dicek sebelum tag final |
| Lead Frontend | Yosan Pratiwi | Ready | UI user/admin dan status page siap demo |
| Lead QA & Docs | Betran | Ready | README, API contract, release notes, dan checklist final tersedia |

## Kesimpulan QA

TraceIt siap untuk tahap UAS apabila seluruh checklist dengan status `READY` sudah divalidasi ulang pada branch final dan CI GitHub Actions hijau. Fokus follow-up terakhir sebelum tagging `v3.0.0` adalah memastikan secret production, CORS production, dan rate limiting gateway sesuai kebijakan rilis final.
