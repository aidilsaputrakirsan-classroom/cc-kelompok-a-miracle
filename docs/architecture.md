# Microservices Architecture - TraceIt

Dokumen ini menjelaskan arsitektur microservices TraceIt untuk Modul 12. Fokusnya adalah batas tanggung jawab service, kontrak API, cara menjalankan lokal, dan panduan debug untuk QA.

## Ringkasan

TraceIt dipisah dari pendekatan monolith menjadi beberapa service kecil yang berjalan di Docker Compose. Frontend hanya mengakses satu pintu masuk, yaitu Nginx API Gateway di `http://localhost`. Gateway meneruskan request ke Auth Service atau Item Service sesuai path URL.

Prinsip utama yang digunakan:

- Auth Service mengelola user, login, JWT, dan verifikasi token.
- Item Service mengelola data donor/item milik user yang login.
- Setiap service punya database sendiri.
- Item Service tidak membaca `auth_db` secara langsung. Verifikasi token dilakukan dengan HTTP call ke Auth Service.
- Nginx Gateway menyembunyikan detail service dari frontend.

## Diagram Arsitektur

```mermaid
flowchart TD
    USER["Browser"] -->|"http://localhost"| GW["tracelt-gateway\nNginx :80"]

    subgraph NET["Docker Compose Network"]
        GW -->|"/auth/*"| AUTH["tracelt-auth-service\nFastAPI :8001"]
        GW -->|"/items*"| ITEM["tracelt-item-service\nFastAPI :8002"]
        GW -->|"/"| FE["tracelt-frontend\nReact static app :80"]

        AUTH -->|"DATABASE_URL"| AUTHDB[("tracelt-auth-db\nauth_db :5432")]
        ITEM -->|"DATABASE_URL"| ITEMDB[("tracelt-item-db\nitem_db :5432")]
        ITEM -.->|"GET /verify\nAuthorization: Bearer token"| AUTH
    end

    AUTHDB --- AUTHVOL["Volume: auth_db_data"]
    ITEMDB --- ITEMVOL["Volume: item_db_data"]
```

## Service dan Port

| Service | Container | Internal Port | Host Port | Fungsi |
|---------|-----------|---------------|-----------|--------|
| API Gateway | `tracelt-gateway` | 80 | 80 | Reverse proxy untuk frontend dan API |
| Frontend | `tracelt-frontend` | 80 | Tidak diekspos langsung | Menyajikan React static app |
| Auth Service | `tracelt-auth-service` | 8001 | Tidak diekspos langsung | Register, login, verify JWT |
| Item Service | `tracelt-item-service` | 8002 | Tidak diekspos langsung | CRUD data donor/item dan stats |
| Auth Database | `tracelt-auth-db` | 5432 | 5433 | PostgreSQL database `auth_db` |
| Item Database | `tracelt-item-db` | 5432 | 5434 | PostgreSQL database `item_db` |

## Routing Gateway

Konfigurasi routing ada di `services/gateway/nginx.conf`.

| Request dari Browser | Diteruskan ke | Service Tujuan |
|----------------------|---------------|----------------|
| `GET /health` | Response langsung dari gateway | API Gateway |
| `POST /auth/register` | `http://auth-service:8001/register` | Auth Service |
| `POST /auth/login` | `http://auth-service:8001/login` | Auth Service |
| `GET /auth/verify` | `http://auth-service:8001/verify` | Auth Service |
| `GET /items` | `http://item-service:8002/items` | Item Service |
| `POST /items` | `http://item-service:8002/items` | Item Service |
| `GET /items/stats` | `http://item-service:8002/items/stats` | Item Service |
| `GET /items/{id}` | `http://item-service:8002/items/{id}` | Item Service |
| `PUT /items/{id}` | `http://item-service:8002/items/{id}` | Item Service |
| `DELETE /items/{id}` | `http://item-service:8002/items/{id}` | Item Service |
| `/` | `http://frontend` | Frontend |

## API Contract

Semua endpoint API diakses dari host melalui gateway `http://localhost`.

### Auth Service

#### `GET /health`

Mengecek status Auth Service.

Response `200 OK`:

```json
{
  "status": "healthy",
  "service": "auth-service",
  "version": "2.0.0"
}
```

#### `POST /auth/register`

Mendaftarkan user baru.

Request body:

```json
{
  "email": "test@example.com",
  "password": "Pass123",
  "name": "Test User"
}
```

Response `201 Created`:

```json
{
  "id": 1,
  "email": "test@example.com",
  "name": "Test User"
}
```

Kemungkinan error:

| Status | Penyebab |
|--------|----------|
| 400 | Email sudah terdaftar |
| 422 | Format body tidak valid |
| 500 | Register gagal di service/database |

#### `POST /auth/login`

Login user dan menghasilkan JWT access token.

Request body:

```json
{
  "email": "test@example.com",
  "password": "Pass123"
}
```

Response `200 OK`:

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

Kemungkinan error:

| Status | Penyebab |
|--------|----------|
| 401 | Email atau password salah |
| 422 | Format body tidak valid |
| 500 | Login gagal di service/database |

#### `GET /auth/verify`

Memverifikasi JWT token. Endpoint ini digunakan oleh Item Service saat ada request yang membutuhkan autentikasi.

Header:

```http
Authorization: Bearer <access_token>
```

Response `200 OK`:

```json
{
  "user_id": 1,
  "email": "test@example.com",
  "name": "Test User"
}
```

Kemungkinan error:

| Status | Penyebab |
|--------|----------|
| 401 | Header authorization tidak valid, token invalid, atau token expired |

### Item Service

Semua endpoint Item Service membutuhkan header berikut:

```http
Authorization: Bearer <access_token>
```

#### `GET /items`

Mengambil daftar data donor/item milik user yang login.

Query parameter:

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `search` | string | `null` | Filter berdasarkan nama |
| `skip` | integer | 0 | Offset pagination |
| `limit` | integer | 20 | Jumlah data, maksimal 100 |

Response `200 OK`:

```json
{
  "total": 1,
  "items": [
    {
      "id": 1,
      "name": "Donasi Buku",
      "description": "Program donasi buku sekolah",
      "total_donor": 12,
      "owner_id": 1
    }
  ]
}
```

#### `POST /items`

Membuat data donor/item baru.

Request body:

```json
{
  "name": "Donasi Buku",
  "description": "Program donasi buku sekolah",
  "total_donor": 12
}
```

Response `201 Created`:

```json
{
  "id": 1,
  "name": "Donasi Buku",
  "description": "Program donasi buku sekolah",
  "total_donor": 12,
  "owner_id": 1
}
```

#### `GET /items/stats`

Mengambil ringkasan statistik data donor/item milik user yang login.

Response `200 OK`:

```json
{
  "total_items": 2,
  "total_value": 20.0,
  "termurah": 8.0,
  "termahal": 12.0
}
```

Catatan: field `total_value`, `termurah`, dan `termahal` dihitung dari field `total_donor` pada data item.

#### `GET /items/{item_id}`

Mengambil satu data donor/item milik user yang login.

Response `200 OK`:

```json
{
  "id": 1,
  "name": "Donasi Buku",
  "description": "Program donasi buku sekolah",
  "total_donor": 12,
  "owner_id": 1
}
```

Kemungkinan error:

| Status | Penyebab |
|--------|----------|
| 404 | Data tidak ditemukan atau bukan milik user login |

#### `PUT /items/{item_id}`

Mengubah data donor/item milik user yang login.

Request body dapat berisi sebagian field:

```json
{
  "name": "Donasi Buku Updated",
  "description": "Program donasi buku dan alat tulis",
  "total_donor": 18
}
```

Response `200 OK`:

```json
{
  "id": 1,
  "name": "Donasi Buku Updated",
  "description": "Program donasi buku dan alat tulis",
  "total_donor": 18,
  "owner_id": 1
}
```

#### `DELETE /items/{item_id}`

Menghapus data donor/item milik user yang login.

Response `204 No Content`.

### Error Umum Item Service

| Status | Penyebab |
|--------|----------|
| 401 | Token tidak ada atau tidak valid |
| 422 | Request body atau query parameter tidak valid |
| 503 | Auth Service tidak tersedia atau circuit breaker sedang open |
| 504 | Timeout saat Item Service memanggil Auth Service |

## Database per Service

| Database | Service Pemilik | Tabel | Catatan |
|----------|-----------------|-------|---------|
| `auth_db` | Auth Service | `users` | Menyimpan user dan hashed password |
| `item_db` | Item Service | `items` | Menyimpan data donor/item dan `owner_id` |

`owner_id` di `item_db.items` hanya integer reference ke user di Auth Service. Field ini bukan foreign key karena tabel `users` berada di database yang berbeda.

## Alur Request Utama

### Login

```mermaid
sequenceDiagram
    participant B as Browser
    participant G as Gateway
    participant A as Auth Service
    participant DB as auth_db

    B->>G: POST /auth/login
    G->>A: POST /login
    A->>DB: Cari user + verifikasi password
    DB-->>A: Data user
    A-->>G: access_token
    G-->>B: access_token
```

### Membuat Item

```mermaid
sequenceDiagram
    participant B as Browser
    participant G as Gateway
    participant I as Item Service
    participant A as Auth Service
    participant DB as item_db

    B->>G: POST /items + Bearer token
    G->>I: POST /items + Bearer token
    I->>A: GET /verify + Bearer token
    A-->>I: user_id, email, name
    I->>DB: Insert item dengan owner_id
    DB-->>I: Item tersimpan
    I-->>G: Item response
    G-->>B: Item response
```

## Menjalankan Lokal

Jalankan dari root repository.

```bash
docker compose up --build -d
```

Cek status container:

```bash
docker compose ps
```

Status yang diharapkan:

| Service | Status Minimal |
|---------|----------------|
| `auth-db` | running/healthy |
| `item-db` | running/healthy |
| `auth-service` | running/healthy |
| `item-service` | running/healthy |
| `frontend` | running/healthy |
| `gateway` | running/healthy |

Akses aplikasi:

```text
http://localhost
```

Matikan semua container:

```bash
docker compose down
```

Matikan container dan hapus data database lokal:

```bash
docker compose down -v
```

## Test Manual via Gateway

### 1. Health Check Gateway

```bash
curl http://localhost/health
```

Expected response:

```json
{"status": "healthy", "service": "gateway"}
```

### 2. Register User

```bash
curl -X POST http://localhost/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123","name":"Test User"}'
```

Expected: response `201 Created` berisi `id`, `email`, dan `name`.

### 3. Login User

```bash
curl -X POST http://localhost/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123"}'
```

Expected: response `200 OK` berisi `access_token`.

Simpan token dari response untuk step berikutnya.

### 4. Create Item

```bash
curl -X POST http://localhost/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN" \
  -d '{"name":"Donasi Buku","description":"Program donasi buku sekolah","total_donor":12}'
```

Expected: response `201 Created` berisi item baru dan `owner_id` user login.

### 5. Get Items

```bash
curl http://localhost/items \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN"
```

Expected: response `200 OK` berisi daftar item milik user login.

### 6. Get Item Stats

```bash
curl http://localhost/items/stats \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN"
```

Expected: response `200 OK` berisi `total_items`, `total_value`, `termurah`, dan `termahal`.

## Panduan Debug per Service

### Cek Semua Log

```bash
docker compose logs -f
```

### Cek Log Auth Service

```bash
docker compose logs auth-service
```

Gunakan ini saat register, login, atau verify token gagal.

### Cek Log Item Service

```bash
docker compose logs item-service
```

Gunakan ini saat CRUD item gagal, token tidak terbaca, atau Item Service gagal memanggil Auth Service.

### Cek Log Gateway

```bash
docker compose logs gateway
```

Gunakan ini saat URL `http://localhost/auth/...` atau `http://localhost/items...` tidak diarahkan ke service yang benar.

### Cek Status Healthcheck

```bash
docker compose ps
```

Jika service `unhealthy`, lanjutkan dengan log service tersebut.

### Cek Koneksi Database dari Host

Auth database tersedia di host port `5433`:

```bash
psql postgresql://postgres:postgres@localhost:5433/auth_db
```

Item database tersedia di host port `5434`:

```bash
psql postgresql://postgres:postgres@localhost:5434/item_db
```

### Masalah Umum

| Gejala | Kemungkinan Penyebab | Langkah Debug |
|--------|----------------------|---------------|
| `curl http://localhost/health` gagal | Gateway belum running atau port 80 bentrok | Jalankan `docker compose ps`, cek apakah ada aplikasi lain memakai port 80 |
| Register/login gagal `500` | Auth Service gagal akses `auth_db` | Cek `docker compose logs auth-service` dan health `auth-db` |
| Request `/items` mendapat `401` | Token kosong, salah format, atau expired | Login ulang dan pastikan header `Authorization: Bearer <token>` |
| Request `/items` mendapat `503` | Auth Service tidak bisa dihubungi dari Item Service | Cek `docker compose logs item-service` dan `docker compose logs auth-service` |
| Frontend tampil tapi API gagal | `VITE_API_URL` tidak mengarah ke gateway | Pastikan build frontend memakai `VITE_API_URL=http://localhost` |
| Data hilang setelah restart | Volume database dihapus | Hindari `docker compose down -v` jika ingin data lokal tetap ada |

## QA Checklist Modul 12

- [ ] `docker compose up --build -d` berhasil tanpa error build.
- [ ] `docker compose ps` menunjukkan semua service running dan database healthy.
- [ ] `GET /health` melalui gateway mengembalikan status healthy.
- [ ] `POST /auth/register` berhasil membuat user baru.
- [ ] `POST /auth/login` berhasil menghasilkan token.
- [ ] `GET /auth/verify` berhasil memverifikasi token valid.
- [ ] `POST /items` berhasil membuat data dengan token valid.
- [ ] `GET /items` hanya menampilkan data milik user login.
- [ ] `GET /items/stats` mengembalikan statistik sesuai data user login.
- [ ] `PUT /items/{id}` hanya bisa mengubah data milik user login.
- [ ] `DELETE /items/{id}` hanya bisa menghapus data milik user login.
- [ ] Request Item Service tanpa token mengembalikan `401`.
- [ ] Saat Auth Service bermasalah, Item Service mengembalikan error service unavailable, bukan crash.
- [ ] Frontend dapat register, login, dan CRUD melalui `http://localhost`.

## Catatan untuk Pull Request

Branch tugas Lead QA & Docs:

```bash
git checkout -b docs/microservices-architecture
```

File utama yang dikumpulkan:

```text
docs/architecture.md
```

Ringkasan PR yang disarankan:

```text
docs: add microservices architecture documentation

- Document Docker Compose microservices architecture
- Add service list, ports, gateway routing, and API contract
- Add local run, manual test, and per-service debugging guide
- Add QA checklist for Modul 12 verification
```
