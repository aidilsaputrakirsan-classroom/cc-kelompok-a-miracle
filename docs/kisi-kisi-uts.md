# Rangkuman Kisi-Kisi UTS — Komputasi Awan

**Mata Kuliah:** Komputasi Awan
**Kelompok:** A - Miracle (TraceIt)
**Disusun oleh:** Betran (Lead QA & Docs)

---

## Minggu 1–2: Cloud Computing & REST API

### 1. Definisi Cloud Computing

Cloud computing adalah penyediaan sumber daya komputasi (server, storage, database, jaringan, software) melalui internet ("the cloud") yang bisa diakses kapan saja, dari mana saja, tanpa perlu mengelola infrastruktur fisik secara langsung.

**Contoh nyata di TraceIt:** Aplikasi kita di-deploy ke Railway/Render — kita tidak perlu beli server fisik, cukup push kode dan platform cloud yang menjalankannya.

### 2. Lima Karakteristik NIST

NIST (National Institute of Standards and Technology) mendefinisikan 5 karakteristik utama cloud computing:

| No | Karakteristik | Penjelasan | Contoh |
|----|--------------|------------|--------|
| 1 | **On-demand self-service** | Pengguna bisa menyediakan resource sendiri tanpa perlu interaksi manusia dengan provider | Buat database PostgreSQL di Railway dengan klik tombol, tanpa telepon admin |
| 2 | **Broad network access** | Layanan bisa diakses dari berbagai perangkat lewat jaringan (internet) | TraceIt bisa diakses dari laptop, HP, tablet — cukup buka browser |
| 3 | **Resource pooling** | Resource provider dipakai bersama oleh banyak pengguna (multi-tenant) | Satu server Railway dipakai oleh banyak project dari user berbeda |
| 4 | **Rapid elasticity** | Resource bisa ditambah/dikurangi secara cepat sesuai kebutuhan | Saat banyak user akses TraceIt, server otomatis scale up |
| 5 | **Measured service** | Penggunaan resource diukur dan dilaporkan (pay-as-you-go) | Railway menghitung berapa jam server jalan, bayar sesuai pemakaian |

### 3. Model Layanan: IaaS, PaaS, SaaS

```
┌─────────────────────────────────────────────────────────┐
│                    Tanggung Jawab                         │
│                                                           │
│  SaaS    → Semua dikelola provider, user tinggal pakai   │
│  PaaS    → Provider kelola infra, user kelola aplikasi   │
│  IaaS    → Provider kelola hardware, user kelola sisanya │
│  On-Prem → Semua dikelola sendiri                        │
└─────────────────────────────────────────────────────────┘
```

| Model | Apa yang dikelola user | Apa yang dikelola provider | Contoh |
|-------|----------------------|--------------------------|--------|
| **IaaS** (Infrastructure as a Service) | OS, runtime, aplikasi, data | Server fisik, jaringan, storage, virtualisasi | AWS EC2, Google Compute Engine, DigitalOcean |
| **PaaS** (Platform as a Service) | Aplikasi dan data saja | Server, OS, runtime, middleware | **Railway**, Render, Heroku, Google App Engine |
| **SaaS** (Software as a Service) | Tidak ada — tinggal pakai | Semuanya | Gmail, Google Docs, Zoom, Slack |

**TraceIt menggunakan PaaS** (Railway/Render) — kita hanya fokus ke kode aplikasi, platform yang urus server, OS, dan deployment.

### 4. Cloud-Native vs Tradisional

| Aspek | Tradisional | Cloud-Native |
|-------|------------|-------------|
| **Arsitektur** | Monolith (satu aplikasi besar) | Microservices (banyak service kecil) |
| **Deployment** | Manual, jarang update | Otomatis (CI/CD), sering update |
| **Scaling** | Vertical (tambah RAM/CPU) | Horizontal (tambah instance) |
| **Infrastruktur** | Server fisik / VM | Container (Docker) |
| **Resilience** | Satu error = semua down | Satu service error, yang lain tetap jalan |

**TraceIt sudah cloud-native:** pakai Docker container, CI/CD via GitHub Actions, dan deploy ke cloud platform.

### 5. HTTP Methods dan CRUD Mapping

HTTP methods adalah cara browser/client berkomunikasi dengan server. Setiap method punya tujuan spesifik:

| HTTP Method | CRUD | Tujuan | Contoh di TraceIt |
|-------------|------|--------|-------------------|
| **GET** | Read | Mengambil data | `GET /pendonor` → ambil daftar pendonor |
| **POST** | Create | Membuat data baru | `POST /pendonor` → daftarkan pendonor baru |
| **PUT** | Update | Mengubah data yang sudah ada | `PUT /pendonor/5` → update data pendonor ID 5 |
| **DELETE** | Delete | Menghapus data | `DELETE /pendonor/5` → hapus pendonor ID 5 |

### 6. HTTP Status Codes

Status code adalah "jawaban" server yang memberitahu apakah request berhasil atau gagal:

| Code | Nama | Arti | Kapan muncul di TraceIt |
|------|------|------|------------------------|
| **200** | OK | Request berhasil | `GET /pendonor` → data berhasil diambil |
| **201** | Created | Data baru berhasil dibuat | `POST /pendonor` → pendonor baru terdaftar |
| **204** | No Content | Berhasil tapi tidak ada data dikembalikan | `DELETE /pendonor/5` → pendonor dihapus |
| **400** | Bad Request | Request salah format / data tidak valid | Kirim form tanpa isi nama |
| **404** | Not Found | Data/endpoint tidak ditemukan | `GET /pendonor/999` → ID 999 tidak ada |
| **422** | Unprocessable Entity | Format benar tapi isi tidak valid | Email format salah, password kurang 8 karakter |

### 7. REST API Principles

REST (Representational State Transfer) adalah aturan desain API yang baik:

| Prinsip | Penjelasan | Contoh di TraceIt |
|---------|------------|-------------------|
| **Stateless** | Server tidak menyimpan state client. Setiap request harus lengkap sendiri | Setiap request kirim JWT token di header, server tidak ingat siapa yang login |
| **Resource-based** | URL menunjukkan resource (kata benda), bukan aksi (kata kerja) | `/pendonor` (benar) bukan `/getPendonor` (salah) |
| **HTTP methods** | Gunakan method yang tepat untuk aksi yang tepat | GET untuk baca, POST untuk buat, PUT untuk update, DELETE untuk hapus |
| **JSON format** | Data dikirim dan diterima dalam format JSON | `{"nama": "Betran", "golongan_darah": "O+"}` |
| **Status codes** | Gunakan status code yang tepat untuk setiap response | 201 untuk created, 404 untuk not found |

---

## Minggu 3: React Frontend

### 1. Component

Component adalah **blok bangunan** UI di React. Setiap bagian halaman adalah component yang bisa dipakai ulang.

```
TraceIt Component Tree:

App.jsx (root)
├── Header.jsx          → Navbar di semua halaman
├── LandingPage.jsx     → Halaman utama
├── Login.jsx           → Form login
├── AdminDashboard.jsx  → Dashboard admin
│   ├── BarChart         → Grafik golongan darah
│   └── PieChart         → Grafik jenis kelamin
├── DonorList.jsx       → Tabel daftar pendonor
└── UserDashboard.jsx   → Dashboard user
```

Component di React ditulis sebagai **function** yang return JSX (HTML-like syntax):

```jsx
function Header() {
  return (
    <nav>
      <h1>TraceIt</h1>
      <a href="/login">Login</a>
    </nav>
  );
}
```

### 2. Props

Props (properties) adalah **data yang dikirim dari parent ke child component**. Props bersifat read-only (tidak bisa diubah oleh child).

```
Analogi: Props seperti parameter fungsi

Parent (App.jsx)  →  props  →  Child (Header.jsx)
                    {title: "TraceIt"}
```

```jsx
// Parent mengirim props
<Header title="TraceIt" isLoggedIn={true} />

// Child menerima props
function Header({ title, isLoggedIn }) {
  return (
    <nav>
      <h1>{title}</h1>
      {isLoggedIn && <button>Logout</button>}
    </nav>
  );
}
```

### 3. State

State adalah **data yang bisa berubah** di dalam component. Ketika state berubah, component otomatis re-render (tampilan update).

```
Props vs State:
- Props  → data dari luar (parent), read-only
- State  → data dari dalam component, bisa berubah
```

### 4. React Hooks: useState

`useState` digunakan untuk membuat dan mengubah state:

```jsx
function DonorList() {
  // Deklarasi state: [nilai, fungsiUntukUbah] = useState(nilaiAwal)
  const [donors, setDonors] = useState([]);        // array kosong
  const [search, setSearch] = useState("");          // string kosong
  const [loading, setLoading] = useState(false);     // boolean false

  // Ubah state → component re-render
  setSearch("Betran");  // search berubah jadi "Betran", tampilan update
}
```

### 5. React Hooks: useEffect

`useEffect` digunakan untuk **side effects** — aksi yang terjadi di luar render (fetch data, subscribe, timer):

```jsx
function DonorList() {
  const [donors, setDonors] = useState([]);

  // useEffect(callback, dependencies)
  useEffect(() => {
    // Ini jalan saat component pertama kali muncul
    fetch("http://localhost:8000/pendonor")
      .then(res => res.json())
      .then(data => setDonors(data));
  }, []);  // [] = hanya jalan sekali saat mount

  // Dependency array:
  // []        → jalan sekali saat mount
  // [search]  → jalan ulang setiap kali `search` berubah
  // tanpa []  → jalan setiap render (jarang dipakai)
}
```

### 6. Fetch API: Komunikasi Frontend-Backend

Fetch API / Axios digunakan untuk mengirim HTTP request dari React ke FastAPI:

```
┌──────────────┐    HTTP Request     ┌──────────────┐
│    React     │ ──────────────────► │   FastAPI    │
│  (Frontend)  │                     │  (Backend)   │
│  port 3000   │ ◄────────────────── │  port 8000   │
└──────────────┘    JSON Response    └──────────────┘
```

Di TraceIt kita pakai **Axios** (di `frontend/src/services/api.js`):

```jsx
// GET — ambil data
const response = await axios.get("/pendonor");

// POST — kirim data baru
await axios.post("/pendonor", { nama: "Betran", golongan_darah: "O+" });

// PUT — update data
await axios.put("/pendonor/5", { nama: "Betran Updated" });

// DELETE — hapus data
await axios.delete("/pendonor/5");
```

### 7. Component Architecture dan Data Flow

Data di React mengalir **satu arah** (one-way data flow): dari parent ke child lewat props.

```
        App.jsx (state: user, token)
           │
     ┌─────┼──────────┐
     ▼     ▼          ▼
  Header  AdminRoute  UserRoute
  (props:  (props:     (props:
   user)    token)      token)
     │        │
     ▼        ▼
  Navbar   AdminDashboard
           (state: donors, stats)
              │
        ┌─────┼─────┐
        ▼     ▼     ▼
     BarChart PieChart StatCards
     (props:  (props:  (props:
      data)    data)    count)
```

**Aturan data flow:**
- Data mengalir **ke bawah** (parent → child) lewat props
- Event mengalir **ke atas** (child → parent) lewat callback function
- State ditaruh di component **paling atas** yang membutuhkannya

---

## Minggu 4: Full-Stack Integration

### 1. CORS (Cross-Origin Resource Sharing)

**Apa itu CORS?**
CORS adalah mekanisme keamanan browser yang **memblokir request dari domain/port berbeda**. Tanpa CORS, browser menolak request dari frontend (port 3000) ke backend (port 8000) karena dianggap "beda origin".

```
Origin = protocol + domain + port

http://localhost:3000  ← Frontend (origin A)
http://localhost:8000  ← Backend  (origin B)

Browser: "Origin berbeda! Blokir request!"
         (kecuali backend izinkan via CORS)
```

**Mengapa perlu CORS?**
Untuk keamanan — mencegah website jahat mengirim request ke API kita. Tapi kita perlu mengizinkan frontend kita sendiri.

**Cara konfigurasi di TraceIt** (di `backend/main.py`):

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # frontend
    allow_methods=["*"],      # izinkan semua HTTP methods
    allow_headers=["*"],      # izinkan semua headers
    allow_credentials=True,
)
```

**Di Docker:** Nginx reverse proxy mengatasi CORS karena frontend dan backend diakses dari origin yang sama (`localhost:3000`). Request `/api/*` di-proxy ke backend.

### 2. JWT (JSON Web Token)

**Apa itu JWT?**
JWT adalah token (string panjang) yang digunakan untuk **membuktikan identitas user** setelah login. Seperti "kartu akses" digital.

**Struktur JWT** (3 bagian dipisahkan titik):

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidHlwZSI6ImFkbWluIn0.abc123
│                      │                                        │
└── Header             └── Payload                              └── Signature
    (algoritma)            (data user)                              (tanda tangan)
```

| Bagian | Isi | Contoh di TraceIt |
|--------|-----|-------------------|
| **Header** | Algoritma enkripsi | `{"alg": "HS256"}` |
| **Payload** | Data user (claims) | `{"sub": "1", "user_type": "admin", "exp": 1713600000}` |
| **Signature** | Tanda tangan digital | Dibuat dari Header + Payload + SECRET_KEY |

**Alur Authentication di TraceIt:**

```
1. User login    → POST /auth/admin/login {email, password}
2. Server cek    → Cocokkan password (bcrypt hash)
3. Server buat   → Generate JWT token (berlaku 60 menit)
4. Kirim ke user → {"access_token": "eyJ...", "token_type": "bearer"}
5. User simpan   → localStorage.setItem("admin_token", token)
6. Request API   → Header: Authorization: Bearer eyJ...
7. Server decode → Validasi token, cek user_type, izinkan/tolak
```

### 3. Environment Variables

**Kenapa penting?**
Environment variables menyimpan **konfigurasi sensitif** (password, secret key, URL database) di luar kode. Supaya:
- Secret tidak masuk ke GitHub (keamanan)
- Konfigurasi bisa beda per environment (dev, staging, production)
- Mudah diubah tanpa edit kode

**Contoh di TraceIt** (`backend/.env.docker`):

```env
DATABASE_URL=postgresql://postgres:postgres@tracelt-db:5432/tracelt
SECRET_KEY=5b769f2517bed1cca68b77916edacc704465be6a1d8b2708da9003691ef41725
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**12-Factor App** (prinsip #3: Config):
> "Simpan konfigurasi di environment, bukan di kode."

Ini kenapa kita punya:
- `.env` → untuk development lokal (di-gitignore)
- `.env.docker` → untuk Docker container
- `.env.example` → template tanpa nilai sensitif (di-commit ke git)

### 4. Keamanan

| Aspek | Teknik | Implementasi di TraceIt |
|-------|--------|------------------------|
| **Password hashing** | bcrypt (one-way hash) | Password user di-hash sebelum disimpan ke database. Tidak bisa di-reverse |
| **Token expiry** | JWT exp claim | Token berlaku 60 menit. Setelah itu user harus login ulang |
| **Secret key** | Environment variable | `SECRET_KEY` untuk sign JWT, disimpan di `.env`, tidak di-commit |
| **Non-root user** | Docker USER | Container backend jalan sebagai `appuser`, bukan root (keamanan container) |

**Password hashing flow:**

```
Register:
  "MyPassword123" → bcrypt → "$2b$12$LJ3m..." (hash) → simpan ke DB

Login:
  "MyPassword123" → bcrypt verify → cocok dengan hash di DB? → Ya → buat JWT
```

Poin penting: **hash tidak bisa di-reverse**. Kita tidak bisa tahu password asli dari hash-nya. Yang bisa dilakukan hanya **memverifikasi** apakah password yang dimasukkan cocok dengan hash yang tersimpan.

---

## Minggu 5–6: Docker

### 1. Container vs Virtual Machine

```
Virtual Machine:                    Container:
┌─────────────────────┐            ┌─────────────────────┐
│   App A  │  App B   │            │   App A  │  App B   │
├──────────┼──────────┤            ├──────────┼──────────┤
│  Guest   │  Guest   │            │  Bins/   │  Bins/   │
│  OS      │  OS      │            │  Libs    │  Libs    │
├──────────┴──────────┤            ├──────────┴──────────┤
│     Hypervisor      │            │    Docker Engine     │
├─────────────────────┤            ├─────────────────────┤
│      Host OS        │            │      Host OS        │
├─────────────────────┤            ├─────────────────────┤
│     Hardware        │            │     Hardware        │
└─────────────────────┘            └─────────────────────┘
```

| Aspek | Virtual Machine | Container |
|-------|----------------|-----------|
| **Ukuran** | GB (termasuk OS lengkap) | MB (hanya app + dependencies) |
| **Startup** | Menit | Detik |
| **Isolasi** | Penuh (OS terpisah) | Proses level (share kernel) |
| **Resource** | Berat (RAM, CPU per VM) | Ringan (share resource host) |
| **Contoh** | VirtualBox, VMware | Docker, Podman |

**Kenapa TraceIt pakai container?** Karena ringan, cepat start, dan mudah di-deploy ke cloud. Kita tidak perlu install OS terpisah untuk setiap service.

### 2. Dockerfile: Instruksi dan Best Practices

Dockerfile adalah **resep** untuk membuat Docker image. Setiap instruksi membuat satu layer.

**Instruksi utama:**

| Instruksi | Fungsi | Contoh di TraceIt |
|-----------|--------|-------------------|
| `FROM` | Base image | `FROM python:3.12-alpine` |
| `WORKDIR` | Set working directory | `WORKDIR /app` |
| `COPY` | Copy file dari host ke image | `COPY requirements.txt .` |
| `RUN` | Jalankan command saat build | `RUN pip install -r requirements.txt` |
| `ENV` | Set environment variable | `ENV PATH="/opt/venv/bin:$PATH"` |
| `EXPOSE` | Dokumentasi port yang dipakai | `EXPOSE 8000` |
| `HEALTHCHECK` | Cek kesehatan container | `HEALTHCHECK CMD curl -f http://localhost:8000/health` |
| `USER` | Jalankan sebagai user tertentu | `USER appuser` |
| `CMD` | Command default saat container start | `CMD ["uvicorn", "main:app"]` |

**Layer caching:**
Docker meng-cache setiap layer. Jika satu layer berubah, semua layer di bawahnya di-rebuild. Best practice: **taruh yang jarang berubah di atas**.

```dockerfile
# BAIK — dependencies jarang berubah, di-cache
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .                              # kode sering berubah, di bawah

# BURUK — setiap kali kode berubah, install ulang dependencies
COPY . .
RUN pip install -r requirements.txt
```

### 3. Docker Image vs Container vs Registry

```
Dockerfile  →(build)→  Image  →(run)→  Container
                          │
                     (push/pull)
                          │
                       Registry
                    (Docker Hub)
```

| Konsep | Analogi | Penjelasan |
|--------|---------|------------|
| **Image** | Resep kue | Template read-only berisi OS + app + dependencies |
| **Container** | Kue yang sudah jadi | Instance yang berjalan dari image |
| **Registry** | Toko kue | Tempat menyimpan dan berbagi image (Docker Hub) |

Satu image bisa dijalankan menjadi **banyak container**. Contoh: image `postgres:15` bisa jadi 3 container database berbeda.

### 4. Multi-Stage Build

Multi-stage build memisahkan **proses build** dan **proses run** dalam satu Dockerfile. Hasilnya: image final jauh lebih kecil.

```dockerfile
# Stage 1: BUILD (besar, ada compiler, node_modules)
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json .
RUN npm install          # node_modules ~500MB
COPY . .
RUN npm run build        # output: /app/dist/ (~5MB)

# Stage 2: PRODUCTION (kecil, hanya file hasil build)
FROM nginx:alpine        # ~20MB
COPY --from=builder /app/dist/ /usr/share/nginx/html/
# Total image: ~25MB (bukan ~500MB+)
```

**Hasil di TraceIt:**

| Image | Tanpa multi-stage | Dengan multi-stage | Pengurangan |
|-------|-------------------|-------------------|-------------|
| Frontend | ~1.1 GB | 93.8 MB | ~91% |
| Backend | ~1.2 GB | 216 MB | ~82% |

### 5. Docker Volumes: Data Persistence

Secara default, data di dalam container **hilang** saat container dihapus. Volume menyimpan data secara **permanen** di luar container.

```
Tanpa volume:
  Container dihapus → Data hilang

Dengan volume:
  Container dihapus → Data tetap ada di volume
  Container baru    → Mount volume yang sama → Data kembali
```

**Di TraceIt:**

```yaml
# docker-compose.yml
services:
  db:
    volumes:
      - pgdata:/var/lib/postgresql/data   # data PostgreSQL disimpan di volume

volumes:
  pgdata:     # named volume — persist meskipun container dihapus
```

**Demo:** `docker compose down` lalu `docker compose up -d` → login → data masih ada. Itu karena volume `pgdata`.

### 6. Docker Networks: Komunikasi Antar Container

Docker network memungkinkan container **saling berkomunikasi** menggunakan nama container sebagai hostname.

```
┌─────────────── Docker Network ───────────────┐
│                                               │
│  tracelt-frontend ──► tracelt-backend:8000    │
│                                               │
│  tracelt-backend  ──► tracelt-db:5432         │
│                                               │
│  (saling kenal lewat nama container)          │
└───────────────────────────────────────────────┘
```

**Tanpa Docker network:** Container harus pakai IP address yang bisa berubah-ubah.
**Dengan Docker network:** Cukup pakai nama container (`tracelt-db`) sebagai hostname.

Di `backend/.env.docker`:
```
DATABASE_URL=postgresql://postgres:postgres@tracelt-db:5432/tracelt
                                            ^^^^^^^^^^
                                            nama container = hostname
```

### 7. .dockerignore: Fungsi dan Isi

`.dockerignore` mencegah file yang **tidak perlu** masuk ke Docker image. Mirip `.gitignore` tapi untuk Docker build context.

**Kenapa penting?**
- Mengurangi ukuran build context (lebih cepat build)
- Mencegah file sensitif (`.env`, secrets) masuk ke image
- Menghindari file yang tidak perlu (node_modules, .git, .venv)

**Contoh `backend/.dockerignore`:**

```
venv/
.venv/
.env
__pycache__
*.pyc
.git/
*.md
docs/
tests/
Dockerfile
.dockerignore
```

---

## Minggu 7: Docker Compose

### 1. Struktur docker-compose.yml

Docker Compose menjalankan **banyak container sekaligus** dengan satu file konfigurasi. Tiga bagian utama:

```yaml
services:     # Container apa saja yang dijalankan
  db:         # Service 1: Database
    image: postgres:15
    ...
  backend:    # Service 2: Backend
    build: ./backend
    ...
  frontend:   # Service 3: Frontend
    build: ./frontend
    ...

volumes:      # Penyimpanan data persistent
  pgdata:

networks:     # Jaringan komunikasi antar container
  cloudnet:
```

**Contoh lengkap di TraceIt:**

```yaml
services:
  db:
    image: postgres:15
    container_name: tracelt-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tracelt
    ports:
      - "5433:5432"          # host:container
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d tracelt"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: tracelt-backend
    env_file: ./backend/.env.docker
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    container_name: tracelt-frontend
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy

volumes:
  pgdata:
```

### 2. depends_on vs healthcheck

| Fitur | Fungsi | Perbedaan |
|-------|--------|-----------|
| **depends_on** | Mengatur **urutan start** container | Hanya memastikan container sudah start, **bukan** sudah siap |
| **healthcheck** | Mengecek apakah service **benar-benar siap** | Menjalankan command berkala untuk cek kesehatan |
| **depends_on + condition: service_healthy** | Kombinasi keduanya | Container B baru start **setelah** container A benar-benar healthy |

```yaml
# depends_on saja (KURANG BAIK):
# Backend start segera setelah DB container start
# Tapi DB mungkin belum siap terima koneksi!
depends_on:
  - db

# depends_on + healthcheck (BAIK):
# Backend start setelah DB benar-benar siap
depends_on:
  db:
    condition: service_healthy
```

**Di TraceIt:**
```
db (start) → healthcheck: pg_isready → healthy ✓
  → backend (start) → healthcheck: curl /health → healthy ✓
    → frontend (start) → healthy ✓
```

### 3. Restart Policy

Restart policy menentukan apa yang terjadi saat container crash/stop:

| Policy | Perilaku |
|--------|----------|
| `no` (default) | Tidak restart otomatis |
| `always` | Selalu restart, termasuk saat Docker daemon restart |
| `on-failure` | Restart hanya jika exit code bukan 0 (error) |
| `unless-stopped` | Seperti `always`, tapi tidak restart jika user manual stop |

**TraceIt pakai `unless-stopped`** — container otomatis restart jika crash, tapi tidak restart jika kita sengaja stop dengan `docker compose down`.

### 4. Docker Compose Commands

| Command | Fungsi | Makefile shortcut |
|---------|--------|-------------------|
| `docker compose up -d` | Start semua services (background) | `make up` |
| `docker compose up --build -d` | Rebuild image lalu start | `make build` |
| `docker compose down` | Stop & hapus semua container | `make down` |
| `docker compose down -v` | Stop, hapus container **dan volume** (data hilang!) | `make clean` |
| `docker compose logs -f` | Lihat logs semua services (follow) | `make logs` |
| `docker compose logs -f backend` | Lihat logs backend saja | `make logs-backend` |
| `docker compose ps` | Lihat status semua services | `make ps` |
| `docker compose exec db psql -U postgres -d tracelt` | Masuk ke database | `make shell-db` |
| `docker compose restart` | Restart semua services | `make restart` |

**Flag penting:**
- `-d` (detached) → jalan di background, terminal tidak terkunci
- `-f` (follow) → terus tampilkan log baru secara real-time
- `--build` → rebuild image sebelum start (jika ada perubahan Dockerfile/kode)

---

## Ringkasan Cepat (Cheat Sheet)

| Topik | Poin Kunci |
|-------|-----------|
| Cloud Computing | 5 karakteristik NIST: on-demand, broad access, pooling, elasticity, measured |
| IaaS/PaaS/SaaS | IaaS = infra, PaaS = platform (Railway), SaaS = software (Gmail) |
| HTTP Methods | GET=Read, POST=Create, PUT=Update, DELETE=Delete |
| Status Codes | 200=OK, 201=Created, 204=No Content, 400=Bad Request, 404=Not Found, 422=Unprocessable |
| React | Component (blok UI), Props (data dari parent), State (data berubah) |
| Hooks | useState (state), useEffect (side effects/fetch data) |
| CORS | Browser blokir cross-origin request, backend harus izinkan |
| JWT | Token autentikasi: Header.Payload.Signature, berlaku 60 menit |
| Env Variables | Simpan config sensitif di luar kode (.env), 12-Factor App |
| Container vs VM | Container ringan (MB, detik), VM berat (GB, menit) |
| Dockerfile | FROM, COPY, RUN, EXPOSE, CMD — layer caching: taruh yang jarang berubah di atas |
| Multi-stage | Pisah build & run → image kecil (frontend: 1.1GB → 93.8MB) |
| Volume | Data persist meskipun container dihapus |
| Network | Container saling komunikasi pakai nama container sebagai hostname |
| .dockerignore | Cegah file tidak perlu masuk image (.env, node_modules, .git) |
| docker-compose.yml | services + volumes + networks dalam satu file |
| depends_on + healthcheck | Pastikan service siap sebelum service lain start |
| Restart policy | `unless-stopped` = auto restart kecuali manual stop |
