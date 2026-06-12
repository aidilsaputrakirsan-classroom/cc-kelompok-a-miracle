# API Contract - TraceIt Microservices

Dokumen ini adalah kontrak API terpusat untuk TraceIt version `3.0.0`. Semua endpoint pada dokumen ini diakses melalui API Gateway lokal di port `80`.

## Base URL

| Environment | Base URL | Catatan |
| --- | --- | --- |
| Local Docker Compose | `http://localhost` | Jalur utama untuk QA lokal |
| Auth Service internal | `http://auth-service:8001` | Dipakai antar-container, bukan browser |
| Item/Donor Service internal | `http://item-service:8002` | Dipakai antar-container, bukan browser |
| Production example | `https://tracelt-production.up.railway.app` | Gunakan URL Railway tim saat deploy final |

## Authentication

Endpoint protected membutuhkan JWT pada header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature
```

Token diperoleh dari endpoint login Auth Service. Default expiry adalah 30 menit melalui `TOKEN_EXPIRE_MINUTES`.

## Common Headers

| Header | Required | Contoh | Fungsi |
| --- | --- | --- | --- |
| `Content-Type` | Ya untuk request body | `application/json` | Format payload JSON |
| `Authorization` | Ya untuk endpoint protected | `Bearer eyJhbGciOi...` | JWT user/admin |
| `X-Correlation-ID` | Opsional | `qa-final-001` | Tracing request lintas service |

Jika `X-Correlation-ID` tidak dikirim, gateway membuat request ID otomatis dan meneruskannya ke backend.

## Error Response Format

FastAPI mengembalikan error memakai field `detail`. Untuk gateway rate limiting, response production direkomendasikan tetap JSON agar mudah dikonsumsi frontend.

### HTTP 400 - Business Validation Error

Dipakai ketika request secara format valid, tetapi gagal aturan bisnis.

```json
{
  "detail": "Email already registered"
}
```

Contoh penyebab:

- Email sudah terdaftar.
- Riwayat donor yang sudah diverifikasi tidak dapat diubah.
- Request mencoba menghapus data yang tidak sesuai aturan aplikasi.

### HTTP 422 - Pydantic Validation Error

Dipakai ketika tipe data, format email, enum, panjang string, atau batas angka tidak valid.

```json
{
  "detail": [
    {
      "type": "greater_than_equal",
      "loc": ["body", "umur"],
      "msg": "Input should be greater than or equal to 17",
      "input": 15,
      "ctx": {"ge": 17}
    }
  ]
}
```

Contoh penyebab:

- `email` bukan format email valid.
- `umur` di bawah `17`.
- `golongan_darah` bukan salah satu dari `O+`, `O-`, `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`.
- `no_telepon` mengandung karakter selain angka, spasi, `+`, atau `-`.

### HTTP 429 - Rate Limited

Dipakai oleh gateway production ketika jumlah request melebihi batas.

```json
{
  "detail": "Too many requests. Please try again later."
}
```

Kebijakan production yang direkomendasikan:

| Route | Limit | Tujuan |
| --- | --- | --- |
| `/auth/login`, `/auth/pengguna/login`, `/auth/admin/login` | 5 req/s per IP | Mengurangi brute force login |
| `/auth/register`, `/auth/pengguna/register`, `/auth/admin/register` | 5 req/s per IP | Mengurangi spam registrasi |
| API data donor | 20 req/s per IP | Menjaga stabilitas service |
| Frontend/general | 30 req/s per IP | Melindungi gateway dari burst traffic |

### HTTP 503 - Service Unavailable

Dipakai ketika service atau dependency tidak tersedia.

```json
{
  "detail": "Auth Service unavailable"
}
```

Contoh penyebab:

- Auth Service down saat Item/Donor Service memverifikasi token.
- Circuit breaker sedang `OPEN`.
- Database health check gagal.

## Auth Service

Gateway prefix: `/auth`

### Endpoint Summary

| Method | Endpoint | Auth | Response sukses | Deskripsi |
| --- | --- | --- | --- | --- |
| `GET` | `/auth/health` | Tidak | `200` | Health check Auth Service |
| `GET` | `/auth/metrics` | Tidak | `200` | Metrics Auth Service |
| `POST` | `/auth/register` | Tidak | `201` | Registrasi user umum |
| `POST` | `/auth/pengguna/register` | Tidak | `201` | Registrasi pengguna frontend |
| `POST` | `/auth/admin/register` | Tidak | `201` | Registrasi admin frontend |
| `POST` | `/auth/login` | Tidak | `200` | Login user umum |
| `POST` | `/auth/pengguna/login` | Tidak | `200` | Login pengguna frontend |
| `POST` | `/auth/admin/login` | Tidak | `200` | Login admin frontend |
| `GET` | `/auth/verify` | Ya | `200` | Verifikasi JWT |

### GET /auth/health

Response `200`:

```json
{
  "status": "healthy",
  "service": "auth-service",
  "version": "2.0.0"
}
```

### POST /auth/pengguna/register

Request:

```json
{
  "email": "rani.saputri@example.com",
  "password": "RaniPass123",
  "nama_pengguna": "Rani Saputri"
}
```

Response `201`:

```json
{
  "id": 12,
  "email": "rani.saputri@example.com",
  "name": "Rani Saputri"
}
```

### POST /auth/admin/register

Request:

```json
{
  "email": "admin.traceit@example.com",
  "password": "AdminPass123",
  "nama_admin": "Admin TraceIt"
}
```

Response `201`:

```json
{
  "id": 13,
  "email": "admin.traceit@example.com",
  "name": "Admin TraceIt"
}
```

### POST /auth/pengguna/login

Request:

```json
{
  "email": "rani.saputri@example.com",
  "password": "RaniPass123"
}
```

Response `200`:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature",
  "token_type": "bearer"
}
```

### GET /auth/verify

Request header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature
```

Response `200`:

```json
{
  "user_id": 12,
  "email": "rani.saputri@example.com",
  "name": "Rani Saputri",
  "nama_pengguna": "Rani Saputri",
  "user_type": "pengguna"
}
```

## Item/Donor Service

Service container bernama `item-service`, sedangkan domain bisnisnya adalah pendonor dan riwayat donor.

### Endpoint Summary

| Method | Endpoint | Auth | Response sukses | Deskripsi |
| --- | --- | --- | --- | --- |
| `GET` | `/donor/health` | Tidak | `200` atau `503` | Health check service dan dependency |
| `GET` | `/donor/metrics` | Tidak | `200` | Metrics Item/Donor Service |
| `GET` | `/api/public/blood-stock` | Tidak | `200` | Stok darah publik |
| `GET` | `/pendonor/stats` | Tidak | `200` | Statistik pendonor |
| `POST` | `/pendonor` | Tidak | `201` | Buat data pendonor |
| `GET` | `/pendonor` | Tidak | `200` | List pendonor |
| `GET` | `/pendonor/{pendonor_id}` | Tidak | `200` | Detail pendonor |
| `PUT` | `/pendonor/{pendonor_id}` | Tidak | `200` | Update pendonor |
| `DELETE` | `/pendonor/{pendonor_id}` | Ya | `204` | Hapus pendonor |
| `POST` | `/riwayat-donor` | Tidak | `201` | Buat riwayat donor publik |
| `GET` | `/riwayat-donor` | Tidak | `200` | List riwayat donor |
| `GET` | `/riwayat-donor/{riwayat_id}` | Tidak | `200` | Detail riwayat donor |
| `POST` | `/riwayat-donor/{riwayat_id}/verifikasi` | Ya | `200` | Verifikasi atau tolak riwayat |
| `GET` | `/pengguna/me` | Ya | `200` | Profil pengguna login |
| `POST` | `/pengguna/riwayat-donor` | Ya | `201` | Buat riwayat donor milik user |
| `GET` | `/pengguna/riwayat-donor` | Ya | `200` | List riwayat donor milik user |
| `GET` | `/pengguna/riwayat-donor/{riwayat_id}` | Ya | `200` | Detail riwayat donor milik user |
| `PUT` | `/pengguna/riwayat-donor/{riwayat_id}` | Ya | `200` | Update riwayat donor milik user |
| `DELETE` | `/pengguna/riwayat-donor/{riwayat_id}` | Ya | `204` | Hapus riwayat donor milik user |

### GET /donor/health

Response `200` saat sehat:

```json
{
  "status": "healthy",
  "service": "donor-service",
  "version": "2.0.0",
  "dependencies": {
    "auth-service": {
      "status": "available",
      "circuit_breaker": {
        "state": "CLOSED",
        "failure_count": 0
      }
    },
    "database": {
      "status": "connected"
    }
  }
}
```

### POST /pendonor

Request:

```json
{
  "nama_lengkap": "Rani Saputri",
  "email": "rani.saputri@example.com",
  "jenis_kelamin": "Perempuan",
  "berat_badan": 58,
  "tinggi_badan": 162,
  "golongan_darah": "A+",
  "umur": 22,
  "tanggal_lahir": "2004-02-14",
  "tanggal_terakhir_donor": "2026-05-10",
  "total_donor": 2,
  "alamat": "Jl. Mulawarman No. 12, Balikpapan",
  "no_telepon": "081234567890",
  "riwayat_kesehatan": "Tidak ada"
}
```

Response `201`:

```json
{
  "id_pendonor": 7,
  "nama_lengkap": "Rani Saputri",
  "email": "rani.saputri@example.com",
  "jenis_kelamin": "Perempuan",
  "berat_badan": 58,
  "tinggi_badan": 162,
  "golongan_darah": "A+",
  "umur": 22,
  "tanggal_lahir": "2004-02-14",
  "tanggal_terakhir_donor": "2026-05-10",
  "total_donor": 2,
  "alamat": "Jl. Mulawarman No. 12, Balikpapan",
  "no_telepon": "081234567890",
  "riwayat_kesehatan": "Tidak ada",
  "created_at": "2026-06-12T09:00:00"
}
```

### GET /pendonor

Query parameter:

| Parameter | Type | Aturan | Contoh |
| --- | --- | --- | --- |
| `skip` | integer | Minimum `0`, default `0` | `0` |
| `limit` | integer | `1..1000`, default `20` | `20` |
| `nama` | string | Opsional | `Rani` |
| `jenis_kelamin` | string | `Laki-laki` atau `Perempuan` | `Perempuan` |
| `golongan_darah` | string | Enum golongan darah | `A+` |
| `umur_min` | integer | Minimum `17` | `18` |
| `umur_max` | integer | Maksimum `120` | `60` |

Response `200`:

```json
{
  "total": 1,
  "pendonor": [
    {
      "id_pendonor": 7,
      "nama_lengkap": "Rani Saputri",
      "email": "rani.saputri@example.com",
      "jenis_kelamin": "Perempuan",
      "berat_badan": 58,
      "tinggi_badan": 162,
      "golongan_darah": "A+",
      "umur": 22,
      "tanggal_lahir": "2004-02-14",
      "tanggal_terakhir_donor": "2026-05-10",
      "total_donor": 2,
      "alamat": "Jl. Mulawarman No. 12, Balikpapan",
      "no_telepon": "081234567890",
      "riwayat_kesehatan": "Tidak ada",
      "created_at": "2026-06-12T09:00:00"
    }
  ]
}
```

### POST /riwayat-donor

Request:

```json
{
  "id_pendonor": 7,
  "golongan_darah": "A+"
}
```

Response `201`:

```json
{
  "id_riwayat": 21,
  "id_pendonor": 7,
  "id_pengguna": null,
  "golongan_darah": "A+",
  "status_verifikasi": false
}
```

### POST /riwayat-donor/{riwayat_id}/verifikasi

Request header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin.signature
```

Request body:

```json
{
  "status_verifikasi": true
}
```

Response `200`:

```json
{
  "id_riwayat": 21,
  "id_pendonor": 7,
  "id_pengguna": null,
  "golongan_darah": "A+",
  "status_verifikasi": true
}
```

### GET /api/public/blood-stock

Response `200`:

```json
{
  "blood_stock": [
    {"golongan_darah": "A+", "jumlah_stok": 4},
    {"golongan_darah": "O+", "jumlah_stok": 8},
    {"golongan_darah": "B+", "jumlah_stok": 3}
  ]
}
```

### GET /pengguna/me

Request header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature
```

Response `200`:

```json
{
  "user_id": 12,
  "email": "rani.saputri@example.com",
  "nama_pengguna": "Rani Saputri",
  "user_type": "pengguna"
}
```

## Metrics Response

Metrics shape dapat bertambah sesuai implementasi, tetapi minimal berisi identitas service dan ringkasan request.

```json
{
  "service": "auth-service",
  "total_requests": 128,
  "total_errors": 2,
  "latency": {
    "p50_ms": 18,
    "p95_ms": 120,
    "p99_ms": 240
  },
  "last_minute": {
    "request_count": 12,
    "error_rate_percent": 0,
    "alert_threshold_percent": 5
  }
}
```

## Compatibility Notes

- Gateway path `/donor/health` dan `/donor/metrics` tetap dipakai untuk health dan metrics Donor Service walaupun container backend bernama `item-service`.
- Public endpoint stok darah memakai prefix `/api/public/blood-stock`.
- Frontend sebaiknya selalu memanggil API melalui gateway agar CORS, header, dan routing konsisten.
- Jika route baru ditambahkan, update dokumen ini bersama `README.md` dan `docs/final-checklist.md`.
