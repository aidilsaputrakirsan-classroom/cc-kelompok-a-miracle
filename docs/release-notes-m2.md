# Release Notes Milestone 2 - TraceIt

Tanggal rilis: 26 Mei 2026  
Tag release: `v2.0`  
PIC dokumentasi: Lead QA & Docs

Milestone 2 berfokus pada kesiapan deployment production, CI/CD, validasi end-to-end backend, dan dokumentasi kualitas rilis.

## URL Production

| Service | URL |
| --- | --- |
| Frontend | `https://tracelt-frontend-production.up.railway.app` |
| Backend API | `https://tracelt-backend-production.up.railway.app` |
| Backend Health Check | `https://tracelt-backend-production.up.railway.app/health` |
| Backend Swagger Docs | `https://tracelt-backend-production.up.railway.app/docs` |

## Fitur yang Sudah Ada

### Backend API

- Health check backend melalui endpoint `/health`.
- Endpoint informasi stok darah publik melalui `/api/public/blood-stock`.
- Autentikasi admin dan pengguna menggunakan JWT bearer token.
- Registrasi dan login pengguna.
- Registrasi dan login admin.
- CRUD data pendonor.
- CRUD riwayat donor.
- Verifikasi atau penolakan riwayat donor oleh admin.
- Endpoint pengguna untuk melihat dan mengelola riwayat donor miliknya sendiri.
- Validasi data request menggunakan Pydantic.
- Koneksi database PostgreSQL melalui SQLAlchemy.

### Frontend

- Landing page aplikasi TraceIt.
- Halaman login untuk admin dan pengguna.
- Halaman registrasi pengguna.
- Form pendaftaran pendonor.
- Halaman stok darah publik.
- Dashboard admin.
- Daftar pendonor dengan pencarian dan filter.
- Antrian verifikasi donor untuk admin.
- Dashboard pengguna untuk riwayat donor.

### Deployment dan CI/CD

- CI/CD menggunakan GitHub Actions.
- Build dan test backend pada pipeline.
- Build, lint, dan test frontend pada pipeline.
- Build Docker image backend dan frontend.
- Deployment otomatis ke Railway saat ada push ke branch `main`.
- Health check backend otomatis setelah deployment.
- Dockerfile backend dan frontend sudah menggunakan pendekatan production build.

## Hasil Testing Production

| Endpoint | Method | Status | Catatan |
| --- | --- | --- | --- |
| `/health` | `GET` | `200` | Backend healthy, database connected |
| `/api/public/blood-stock` | `GET` | `200` | Data stok darah publik berhasil tampil |
| `/api/auth/admin/register` | `POST` | `201` | Registrasi admin berhasil |
| `/api/auth/admin/login` | `POST` | Belum dieksekusi | Perlu follow-up QA |
| `/api/auth/pengguna/register` | `POST` | `400` | Validasi email duplikat berjalan |
| `/api/auth/pengguna/login` | `POST` | `200` | Login pengguna berhasil dan token diterima |

## Tech Stack

| Area | Teknologi |
| --- | --- |
| Backend | FastAPI, Uvicorn, Pydantic, SQLAlchemy |
| Authentication | JWT, passlib, bcrypt |
| Database | PostgreSQL |
| Frontend | React, Vite, React Router, Axios |
| Styling dan UI | Tailwind CSS, Framer Motion, Lucide React, Recharts |
| Testing | Pytest, HTTPX, Vitest, Testing Library |
| Container | Docker, Docker Compose, Nginx |
| CI/CD dan Deployment | GitHub Actions, Railway |

## Known Issues

- Login admin pada production belum dieksekusi pada sesi QA terakhir.
- Endpoint `/api/public/blood-stock` sudah berhasil diakses, tetapi seluruh stok masih bernilai `0` karena belum ada data donor terverifikasi yang menambah stok.
- Response registrasi admin production yang terdokumentasi masih menampilkan nilai placeholder pada beberapa field (`id_admin`, `nama_admin`, `email`) sehingga perlu diverifikasi ulang dengan data aktual.
- Dokumentasi Docker Hub pada README masih menggunakan placeholder `USERNAME` dan perlu diganti setelah image final dipush oleh pemilik akun Docker Hub.
- Beberapa URL pada bagian Docker lokal README masih menggunakan `localhost`; gunakan URL Railway pada bagian production.

## Kesimpulan Rilis

Milestone 2 siap ditandai sebagai rilis `v2.0` karena pipeline CI/CD, deployment Railway, health check production, endpoint publik, dan login pengguna sudah tervalidasi. Follow-up utama untuk QA berikutnya adalah mengeksekusi login admin production dan memverifikasi ulang response registrasi admin dengan data aktual.
