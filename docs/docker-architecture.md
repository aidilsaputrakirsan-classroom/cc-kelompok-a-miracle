# Docker Architecture — TraceIt Multi-Container

Dokumentasi arsitektur Docker untuk aplikasi TraceIt yang terdiri dari 3 container.

## Diagram Arsitektur

```mermaid
flowchart TD
    USER["Browser"]

    subgraph NET["Docker Network: cc-kelompok-a-miracle_default"]
        FE["tracelt-frontend\nNginx + React\nPort 80"]
        BE["tracelt-backend\nFastAPI + Uvicorn\nPort 8000"]
        DB["tracelt-db\nPostgreSQL 15\nPort 5432"]
    end

    VOL["Volume: pgdata\n/var/lib/postgresql/data"]

    USER -->|"localhost:3000"| FE
    USER -->|"localhost:8000"| BE
    BE -->|"DATABASE_URL"| DB
    DB --> VOL
```

## Container Services

| Container | Image | Fungsi |
|-----------|-------|--------|
| `tracelt-frontend` | `tracelt-frontend:v1-fe` | Menyajikan frontend React melalui Nginx |
| `tracelt-backend` | `tracelt-backend:v1` | Menjalankan REST API FastAPI |
| `tracelt-db` | `postgres:15` | Menjalankan database PostgreSQL |

## Port Mapping

| Container | Host Port | Container Port | Akses |
|-----------|-----------|----------------|-------|
| `tracelt-frontend` | 3000 | 80 | `http://localhost:3000` |
| `tracelt-backend` | 8000 | 8000 | `http://localhost:8000` |
| `tracelt-db` | 5432 | 5432 | `localhost:5432` |

## Docker Network

- **Nama:** `cc-kelompok-a-miracle_default`
- **Driver:** bridge
- **Fungsi:** Menghubungkan ketiga container agar dapat saling berkomunikasi menggunakan nama container sebagai hostname

Contoh: backend mengakses database menggunakan hostname `tracelt-db` di dalam network, bukan `localhost`.

## Docker Volume

- **Nama:** `pgdata`
- **Mount path:** `/var/lib/postgresql/data`
- **Fungsi:** Menyimpan data PostgreSQL secara persist. Data tidak hilang meskipun container database dihapus dan dibuat ulang.

## Environment Variables

### Backend (`backend/.env.docker`)

| Variable | Nilai | Keterangan |
|----------|-------|------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@tracelt-db:5432/tracelt` | Koneksi ke database container |
| `SECRET_KEY` | *(secret)* | Untuk JWT token |
| `ALGORITHM` | `HS256` | Algoritma JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Masa berlaku token |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | CORS origins |

### Database

| Variable | Nilai | Keterangan |
|----------|-------|------------|
| `POSTGRES_USER` | `postgres` | Username database |
| `POSTGRES_PASSWORD` | `postgres` | Password database |
| `POSTGRES_DB` | `tracelt` | Nama database |

## Alur Komunikasi

1. **User** membuka `http://localhost:3000` di browser
2. **Nginx** (frontend container) menyajikan file React (HTML, CSS, JS)
3. **Browser** mengirim request API ke `http://localhost:8000`
4. **FastAPI** (backend container) memproses request
5. **Backend** mengakses **PostgreSQL** (database container) melalui Docker network menggunakan hostname `tracelt-db`
6. Data database disimpan di volume `pgdata` agar persist

> **Catatan:** Frontend container hanya menyajikan file statis. Request API dilakukan oleh browser user langsung ke backend, bukan dari frontend container ke backend container.

## Image Size

| Image | Tag | Size |
|-------|-----|------|
| `tracelt-backend` | `v1` | 216 MB |
| `tracelt-frontend` | `v1-fe` | 93.8 MB |

Frontend menggunakan multi-stage build (Node.js untuk build, Nginx untuk serve), sehingga ukuran image jauh lebih kecil dibanding menggunakan Node.js penuh (~1 GB).

## ERD 

![alt text](CCMiracle.png)