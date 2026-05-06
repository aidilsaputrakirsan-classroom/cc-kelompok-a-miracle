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