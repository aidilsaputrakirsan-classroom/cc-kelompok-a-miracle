# Deployment Guide - Railway

## Service Information
- **Backend Service Name**: `tracelt-backend`
- **Backend URL**: https://backend-production-c556.up.railway.app
- **Frontend Service Name**: `tracelt-frontend`
- **Frontend URL**: https://tracelt-frontend-production.up.railway.app
- **Project ID**: `195e962a-39ca-46fe-9707-15df5a085364`
- **Environment**: `production`
- **Database**: PostgreSQL (internal Railway)

## Rollback Manual (Jika Deployment Gagal)

### Cara 1: Via Railway Dashboard (Rekomendasi)
1. Buka [Railway Dashboard](https://railway.app)
2. Pilih service (`backend` atau `frontend`)
3. Klik tab **Deployments**
4. Pilih deployment yang sebelumnya berhasil
5. Klik titik tiga (`...`) → **Rollback**

### Cara 2: Via Railway CLI
```bash
# Lihat riwayat deployment
railway deployments --service backend

# Rollback ke deployment sebelumnya
railway rollback --service backend

