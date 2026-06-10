# Production End-to-End Testing

Dokumentasi ini berisi hasil pengujian production URL yang dilakukan oleh Lead QA & Docs. Pengujian berfokus pada health check backend, koneksi database, endpoint publik stok darah, serta autentikasi admin dan pengguna setelah deployment.

## Ringkasan Hasil

| Endpoint | Method | Status | Hasil QA |
| --- | --- | --- | --- |
| `/health` | `GET` | `200` | Backend sehat dan database terhubung |
| `/api/public/blood-stock` | `GET` | `200` | Stok darah publik berhasil ditampilkan |
| `/api/auth/admin/register` | `POST` | `201` | Registrasi admin berhasil dibuat |
| `/api/auth/admin/login` | `POST` | Belum dieksekusi | Perlu diuji sebagai follow-up |
| `/api/auth/pengguna/register` | `POST` | `400` | Validasi email duplikat berjalan |
| `/api/auth/pengguna/login` | `POST` | `200` | Login pengguna berhasil dan token bearer diterima |

---

## Detail Hasil Testing

### GET `/health`

**Code:** `200`

**Response Body:**

```json
{
  "status": "healthy",
  "service": "backend",
  "version": "1.0.0",
  "database": "connected"
}
```

### GET `/api/public/blood-stock`

**Code:** `200`

**Response Body:**

```json
[
  { "golongan_darah": "O", "jumlah_stok": 0 },
  { "golongan_darah": "A+", "jumlah_stok": 0 },
  { "golongan_darah": "A-", "jumlah_stok": 0 },
  { "golongan_darah": "B+", "jumlah_stok": 0 },
  { "golongan_darah": "B-", "jumlah_stok": 0 },
  { "golongan_darah": "AB+", "jumlah_stok": 0 },
  { "golongan_darah": "AB-", "jumlah_stok": 0 }
]
```

### POST `/api/auth/admin/register`

**Request Body:**

```json
{
  "nama_admin": "Admin ITK",
  "email": "admin@itk.ac.id",
  "password": "AdminPass123!"
}
```

**Code:** `201`

**Response Body:**

```json
{
  "id_admin": 0,
  "nama_admin": "string",
  "email": "string"
}
```

### POST `/api/auth/admin/login`

**Request Body:**

```json
{
  "email": "admin@itk.ac.id",
  "password": "AdminPass123!"
}
```

**Code:** belum dieksekusi

**Catatan QA:** endpoint login admin perlu diuji ulang setelah akun admin production dipastikan tersedia.

### POST `/api/auth/pengguna/register`

**Request Body:**

```json
{
  "nama_pengguna": "Budi Santoso",
  "email": "pengguna@example.com",
  "password": "UserPass123!"
}
```

**Code:** `400`

**Response Body:**

```json
{
  "detail": "Email pengguna sudah terdaftar"
}
```

### POST `/api/auth/pengguna/login`

**Request Body:**

```json
{
  "email": "pengguna@example.com",
  "password": "UserPass123!"
}
```

**Code:** `200`

**Response Body:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_type": "pengguna"
}
```

---

## Kesimpulan QA

Production backend dapat diakses, database terhubung, endpoint publik berjalan, validasi registrasi pengguna duplikat aktif, dan login pengguna berhasil mengembalikan token bearer. Skenario yang masih perlu ditindaklanjuti adalah eksekusi login admin production.
