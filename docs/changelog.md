# Changelog — TraceIt

Log perubahan yang dilakukan pada project TraceIt.

---

## 2026-04-20 — Tambah Tabel Penjelasan Architecture

Menambahkan tabel penjelasan yang mudah dipahami di setiap section Architecture README agar pembaca bisa langsung paham fungsi tiap komponen tanpa harus baca detail teknis.

| File | Aksi | Perubahan |
|------|------|-----------|
| `README.md` | Diubah | Tambah tabel penjelasan di System Overview (6 komponen), Backend Architecture (6 layer), dan Frontend Architecture (9 halaman) |

---

## 2026-04-20 — Fix Port Database Docker

Mengubah port mapping database agar tidak bentrok dengan PostgreSQL lokal yang sudah jalan di port 5432.

| File | Aksi | Perubahan |
|------|------|-----------|
| `docker-compose.yml` | Diubah | Port database diubah dari `5432:5432` ke `5433:5432` agar tidak bentrok dengan PostgreSQL lokal |

---

## 2026-04-20 — Fix .gitignore & Push Semua File

Menghapus entry di `.gitignore` yang memblokir file penting agar bisa ke-push ke GitHub. Sebelumnya `docker-compose.yml`, `.github/`, dan `docs/UTS-demo-script.md` tidak pernah masuk ke repo karena di-ignore.

| File | Aksi | Perubahan |
|------|------|-----------|
| `.gitignore` | Diubah | Hapus entry `.github/`, `docker-compose.yml`, dan `docs/UTS-demo-script.md` |

---

## 2026-04-20 — Buat Docker Compose, CI/CD Pipeline, & Architecture Docs

Setup Docker orchestration lengkap, CI/CD pipeline via GitHub Actions, dan dokumentasi architecture komprehensif di README.

| File | Aksi | Perubahan |
|------|------|-----------|
| `docker-compose.yml` | Baru | Orchestration 3 services (db, backend, frontend) dengan healthcheck, depends_on, volume persistence |
| `frontend/Dockerfile` | Diubah | Tambah install `curl` dan `HEALTHCHECK` agar container bisa report status healthy |
| `.github/workflows/ci.yml` | Baru | CI/CD pipeline: test backend (PostgreSQL service), build frontend (Node.js), build & push Docker images ke Docker Hub |
| `README.md` | Diubah | Tambah architecture komprehensif: System Overview, Backend Architecture, Frontend Architecture, Authentication Flow, Database Schema, Docker Container Architecture, CI/CD Pipeline, Komunikasi Antar Service |

---

## 2026-04-20 — Fix Python Virtual Environment

Buat ulang virtual environment karena Python 3.12 sudah dihapus dari sistem dan diganti Python 3.13. Semua command `python` dan `uvicorn` gagal karena venv masih mengarah ke Python 3.12 yang tidak ada.

| File | Aksi | Perubahan |
|------|------|-----------|
| `backend/.venv/` | Dibuat ulang | Hapus venv lama (Python 3.11/3.12), buat baru dengan `py -3.13 -m venv .venv`, reinstall semua dependencies dari `requirements.txt` |
