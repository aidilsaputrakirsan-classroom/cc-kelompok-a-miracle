# Laporan CI/CD — Perbandingan Image Size & Push ke Docker Hub

**Proyek:** TraceIt — Sistem Manajemen Donor Darah  
**Kelompok:** A-Miracle  
**Tanggal:** 13 April 2026  
**Lead CI/CD:** Tim CI/CD (5 orang)

---

## 1. Ringkasan

Dokumen ini mencatat:
1. Perbandingan ukuran Docker image **sebelum** dan **sesudah** optimasi
2. Teknik optimasi yang diterapkan pada setiap image
3. Proses push image `backend:v2` dan `frontend:v1` ke Docker Hub

---

## 2. Perbandingan Ukuran Image

### 2.1 Backend — `tracelt-backend`

| Aspek | Sebelum Optimasi (v1 - tanpa multi-stage) | Sesudah Optimasi (v2 - multi-stage alpine) |
|-------|-------------------------------------------|-------------------------------------------|
| **Base Image** | `python:3.12` (full Debian) | `python:3.12-alpine` |
| **Build Strategy** | Single-stage | Multi-stage (builder + production) |
| **Ukuran Base Image** | ~1.02 GB | ~52 MB |
| **Ukuran Final Image** | ~1.2 GB (estimasi) | **216 MB** |
| **.dockerignore** | Tidak ada | Ada (exclude venv, cache, docs, tests) |
| **User** | root | non-root (`appuser`) |
| **Healthcheck** | Tidak ada | Ada (`curl /health`) |

**Pengurangan:** ~1.2 GB → 216 MB (**~82% lebih kecil**)

#### Teknik Optimasi Backend:
1. **Multi-stage build** — Stage 1 (builder) install dependencies, Stage 2 (production) hanya copy virtual environment
2. **Alpine base image** — `python:3.12-alpine` jauh lebih kecil dari `python:3.12` (Debian)
3. **Virtual environment isolation** — Dependencies di-install di `/opt/venv` pada builder, lalu di-copy ke production stage
4. **`pip install --no-cache-dir`** — Tidak menyimpan cache pip, mengurangi ukuran layer
5. **`.dockerignore`** — Mengecualikan `venv/`, `__pycache__/`, `.git/`, `tests/`, `docs/`, `*.md`
6. **Non-root user** — Menjalankan aplikasi sebagai `appuser` (security best practice)

#### Dockerfile Backend (v2 — Optimized):
```dockerfile
# Stage 1: Builder
FROM python:3.12-alpine AS builder
WORKDIR /app
RUN apk add --no-cache build-base
COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Production
FROM python:3.12-alpine
WORKDIR /app
RUN apk add --no-cache curl postgresql-client
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY . .
RUN sed -i 's/\r$//' /app/scripts/wait-for-db.sh && chmod +x /app/scripts/wait-for-db.sh
RUN adduser -D appuser && chown -R appuser /app
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1
CMD ["sh", "-c", "/app/scripts/wait-for-db.sh && exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

---

### 2.2 Frontend — `tracelt-frontend`

| Aspek | Sebelum Optimasi (tanpa multi-stage) | Sesudah Optimasi (v1 - multi-stage nginx) |
|-------|--------------------------------------|------------------------------------------|
| **Base Image** | `node:20` (full Debian) | `node:20-slim` (build) + `nginx:alpine` (serve) |
| **Build Strategy** | Single-stage (Node.js serve) | Multi-stage (build + Nginx serve) |
| **Ukuran Base Image** | ~1.1 GB (node:20) | ~43 MB (nginx:alpine) |
| **Ukuran Final Image** | ~1.1 GB (estimasi) | **93.8 MB** |
| **node_modules di final** | Ya (~500 MB+) | Tidak (hanya static files) |
| **.dockerignore** | Tidak ada | Ada (exclude node_modules, .git) |
| **Web Server** | Node.js (dev server) | Nginx (production-grade) |

**Pengurangan:** ~1.1 GB → 93.8 MB (**~91% lebih kecil**)

#### Teknik Optimasi Frontend:
1. **Multi-stage build** — Stage 1 build React app dengan Node.js, Stage 2 serve static files dengan Nginx
2. **Nginx Alpine** — Image production hanya berisi Nginx + static files (HTML/CSS/JS), tanpa Node.js
3. **Eliminasi node_modules** — `node_modules` hanya ada di builder stage, tidak masuk ke production image
4. **`.dockerignore`** — Mengecualikan `node_modules/`, `.git/`, `.env`
5. **Custom Nginx config** — Gzip compression, security headers, SPA routing, static asset caching
6. **Build-time ARG** — `VITE_API_URL` di-set saat build, bukan runtime

#### Dockerfile Frontend (v1 — Optimized):
```dockerfile
# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### 2.3 Tabel Ringkasan Perbandingan

| Image | Versi | Sebelum Optimasi | Sesudah Optimasi | Pengurangan |
|-------|-------|------------------|------------------|-------------|
| **Backend** | v1 → v2 | ~1.2 GB | **216 MB** | **~82%** |
| **Frontend** | - → v1 | ~1.1 GB | **93.8 MB** | **~91%** |
| **Total** | | ~2.3 GB | **309.8 MB** | **~87%** |

> **Catatan:** Ukuran "Sebelum Optimasi" adalah estimasi berdasarkan penggunaan base image full (non-alpine, single-stage build tanpa .dockerignore). Ukuran "Sesudah Optimasi" adalah ukuran aktual dari `docker images`.

---

## 3. Layer Breakdown

### 3.1 Backend Image Layers (216 MB)

| Layer | Ukuran | Keterangan |
|-------|--------|------------|
| `python:3.12-alpine` (base) | ~52 MB | Base OS + Python runtime |
| `apk add curl postgresql-client` | 9.57 MB | Tools untuk healthcheck & DB wait |
| `COPY --from=builder /opt/venv` | 98.4 MB | Python dependencies (FastAPI, SQLAlchemy, dll) |
| `COPY . .` | 69.6 KB | Source code aplikasi |
| `adduser + chown` | 106 KB | Non-root user setup |
| **Total** | **~216 MB** | |

### 3.2 Frontend Image Layers (93.8 MB)

| Layer | Ukuran | Keterangan |
|-------|--------|------------|
| `nginx:alpine` (base) | ~43 MB | Nginx web server |
| Nginx modules + curl | 51.8 MB | Nginx packages |
| `COPY --from=builder /app/dist/` | 963 KB | React build output (HTML/CSS/JS) |
| `COPY nginx.conf` | 16.4 KB | Custom Nginx configuration |
| **Total** | **~93.8 MB** | |

---

## 4. Push ke Docker Hub

### 4.1 Prasyarat

- Akun Docker Hub aktif
- Docker CLI sudah login (`docker login`)
- Image sudah di-build secara lokal

### 4.2 Langkah Push

```bash
# 1. Login ke Docker Hub
docker login

# 2. Tag image untuk Docker Hub
docker tag tracelt-backend:v1 <DOCKERHUB_USERNAME>/backend:v2
docker tag tracelt-frontend:v1-fe <DOCKERHUB_USERNAME>/frontend:v1

# 3. Push ke Docker Hub
docker push <DOCKERHUB_USERNAME>/backend:v2
docker push <DOCKERHUB_USERNAME>/frontend:v1

# 4. Verifikasi
docker pull <DOCKERHUB_USERNAME>/backend:v2
docker pull <DOCKERHUB_USERNAME>/frontend:v1
```

> Ganti `<DOCKERHUB_USERNAME>` dengan username Docker Hub tim.

### 4.3 Hasil Push

| Image | Tag | Docker Hub Repository | Ukuran |
|-------|-----|-----------------------|--------|
| Backend | `v2` | `<DOCKERHUB_USERNAME>/backend:v2` | 216 MB |
| Frontend | `v1` | `<DOCKERHUB_USERNAME>/frontend:v1` | 93.8 MB |

### 4.4 Cara Pull dari Docker Hub

```bash
# Pull backend
docker pull <DOCKERHUB_USERNAME>/backend:v2

# Pull frontend
docker pull <DOCKERHUB_USERNAME>/frontend:v1

# Jalankan
docker run -d --name backend -p 8000:8000 --env-file backend/.env.docker <DOCKERHUB_USERNAME>/backend:v2
docker run -d --name frontend -p 3000:80 <DOCKERHUB_USERNAME>/frontend:v1
```

---

## 5. Best Practices yang Diterapkan

| Practice | Backend | Frontend | Keterangan |
|----------|---------|----------|------------|
| Multi-stage build | Ya | Ya | Memisahkan build dan runtime |
| Alpine base image | Ya | Ya | Image minimal (~5-50 MB vs ~100-1000 MB) |
| `.dockerignore` | Ya | Ya | Mengurangi build context |
| Non-root user | Ya | Tidak* | Security best practice |
| Healthcheck | Ya | Tidak** | Monitoring container health |
| No cache pip/npm | Ya | Ya | `--no-cache-dir` / tidak menyimpan cache |
| Minimal packages | Ya | Ya | Hanya install yang diperlukan |
| Layer optimization | Ya | Ya | Mengurutkan COPY untuk cache efficiency |

> \* Nginx sudah menjalankan worker process sebagai user `nginx` secara default  
> \** Nginx bisa ditambahkan healthcheck via `curl localhost:80` jika diperlukan

---

## 6. Rekomendasi Lanjutan

1. **CI/CD Pipeline** — Implementasi GitHub Actions untuk auto-build dan push ke Docker Hub saat ada push ke branch `main`
2. **Image Scanning** — Gunakan `docker scout` atau `trivy` untuk scan vulnerability pada image
3. **Versioning** — Gunakan semantic versioning (v1.0.0, v1.1.0, dll) untuk tracking yang lebih baik
4. **Registry Private** — Pertimbangkan GitHub Container Registry (ghcr.io) sebagai alternatif Docker Hub
5. **Compress Layers** — Gunakan `--squash` flag (experimental) untuk menggabungkan layers

---

## 7. Kesimpulan

Dengan menerapkan teknik optimasi Docker (multi-stage build, Alpine base image, .dockerignore, dan non-root user), ukuran total image berhasil dikurangi dari **~2.3 GB menjadi ~310 MB** (pengurangan **~87%**). Image `backend:v2` dan `frontend:v1` telah siap untuk di-push ke Docker Hub untuk distribusi dan deployment.