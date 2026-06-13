# UAS Presentation Outline

## Slide 1: Title (🎤 Speaker: Betran - Lead QA & Docs | Durasi: 0.5 menit)
- Nama proyek: Tracelt
- Nama tim: Miracle
- Anggota:
  - Debora Intania Subekti (Lead Backend)
  - Avhilla Catton Andalucia (Lead Container)
  - Chelsy Olivia (Lead CI/CD & Deploy)
  - Yosan Pratiwi (Lead Frontend)
  - Betran (Lead QA & Docs)

## Slide 2: Problem & Solution (🎤 Speaker: Betran - Lead QA & Docs | Durasi: 1 menit)
- Masalah yang diselesaikan: Kekurangan informasi terkait penyedia sukarelawan donor darah yang dapat diakses oleh penerima di lingkungan civitas akademika Institut Teknologi Kalimantan.
- Target pengguna: Civitas akademika Institut Teknologi Kalimantan yang berperan sebagai pendonor sukarela, dan Admin UTD/Sistem sebagai verifikator data kesiapan pendonor.
- Solusi: Platform web "TraceLT" berbasis cloud sebagai repositori terpusat untuk pendataan pendonor darah sukarela, riwayat donor, verifikasi administratif, serta pemantauan stok darah secara real-time.

## Slide 3: Architecture Journey (🎤 Speaker: Chelsy - Lead CI/CD & Deploy | Durasi: 2 menit)
- Week 1-4: Monolith (1 backend FastAPI, 1 DB PostgreSQL, React Frontend) →
```text
[React Frontend] <--HTTP--> [FastAPI Backend] <--SQL--> [PostgreSQL]
       |                            |
  Vite + JSX               REST API Endpoints
(Port 3000/5173)              (Port 8000)
```
- Week 5-7: Containerized (Docker Compose) → [diagram Docker monolith: frontend, backend, postgres-db dalam bridge network]
- Week 9-11: CI/CD (GitHub Actions + Railway) → [screenshot workflow CI/CD badge & Railway live]
- Week 12-14: Microservices (2 services FastAPI + 2 DB + 1 Nginx Gateway + Frontend) → [diagram arsitektur microservices akhir]

## Slide 4: Tech Stack & Infrastructure (🎤 Speaker: Avhilla - Lead Container | Durasi: 2 menit)
- Diagram arsitektur final: [Diagram: Frontend -> Nginx Gateway -> Auth Service & Donor Service -> Auth DB & Item DB]
- Jumlah containers, services, endpoints:
  - 6 Containers: `tracelt-frontend`, `tracelt-gateway`, `tracelt-auth-service`, `tracelt-item-service`, `tracelt-auth-db`, `tracelt-item-db`
  - 6 Services Utama: React Frontend, Nginx Gateway, 2 FastAPI Microservices (Auth Service + Donor Service), 2 PostgreSQL Database (auth-db + item-db)
  - ~29 Endpoints (Perbandingan: pada folder `backend/` monolith lama terdapat 32 endpoint terdaftar/28 unik, sedangkan pada arsitektur microservices baru terdapat total 29 endpoint unik terbagi atas 9 di `auth-service` dan 20 di `item-service`).
- CI/CD pipeline flow: GitHub Actions (`make lint`, `make test`) → Build Docker Image / Deploy ke Railway
- Monitoring & observability: Endpoint `/auth/health`, `/donor/health`, dan *structured logging* Docker (format JSON).

## Slide 5: Live Demo (🎤 Speaker: Yosan & Debora | Durasi: 38 menit)
- **Skenario Pembagian Peran Demo:**
  - **Yosan (Frontend):** Bertugas sebagai *driver* (berbagi layar/menjalankan aplikasi) dan menjelaskan alur UI/UX secara langsung.
  - **Debora (Backend):** Memberikan sisipan narasi teknis (*backend insight*) terkait komunikasi antar-servis yang terjadi saat Yosan melakukan klik/aksi.
- **Detail Flow:**
  1. **Open App & Register:**
     - *Yosan:* Menampilkan halaman beranda publik, lalu mendemokan fitur daftar akun (*Register*).
     - *Debora:* "Di balik layar, Nginx Gateway meneruskan form ini ke *Auth Service*, yang kemudian mem-hash password dan menyimpannya ke *Database*."
  2. **Login & View Items (Katalog Pendonor):**
     - *Yosan:* Login dengan email tadi, lalu menampilkan daftar pendonor.
     - *Debora:* "Login sukses membuahkan token JWT. Nginx memvalidasi *header* tersebut dan meneruskan akses menu pendonor ke *Donor Service*."
  3. **Create & Update (Pendaftaran Pendonor):**
     - *Yosan:* Mendemokan registrasi pendonor (Create) dan mendemokan perubahan/update status pendonor oleh Admin.
     - *Debora:* "*Donor Service* mengonfirmasi data fisik dan memodifikasi database secara aman, memastikan kelayakan sebelum terverifikasi."
  4. **Delete Item & Halaman Status:**
     - *Yosan:* Mendemokan fitur hapus data riwayat donor, kemudian beralih menunjukkan navigasi halaman monitoring sistem `/status`.
     - *Debora:* "Halaman status memvalidasi kesehatan (*health check*) seluruh layanan. Kode 200 OK berarti Gateway, Auth, dan Donor merespons secara optimal."
- **Backup:** Rekaman video demonstrasi lengkap telah disiapkan (untuk antisipasi apabila terjadi kendala jaringan).

## Slide 6: Challenges & Lessons Learned (🎤 Speaker: Semua Anggota / Round-robin | Durasi: 1.5 menit)
Bagian ini dibacakan secara estafet (*round-robin*) sesuai dengan domain kendala masing-masing:
- **Debora (Lead Backend):**
  - *Challenge:* Mengintegrasikan middleware metrik in-memory agar efisien tanpa mengorbankan performa respon endpoint utama.
  - *Solution:* Mengimplementasikan penguncian thread-safe (Lock) minimal di luar proses logging dan menormalkan parameter path dengan regex.
- **Yosan (Lead Frontend):**
  - *Challenge:* Menyelaraskan grafik Recharts dan data tabel metrik dinamis agar terus memperbarui data secara asinkron tanpa kebocoran memori.
  - *Solution:* Memanfaatkan hook useEffect dengan cleanup timer interval secara terstruktur untuk auto-refresh.
- **Avhilla (Lead Container):**
  - *Challenge:* Mengurangi ukuran image build Docker Node.js dan Python yang awalnya melebihi 1 GB.
  - *Solution:* Menerapkan teknik multi-stage build, menggunakan alpine base image, dan mengoptimalkan konfigurasi Nginx statis.
- **Chelsy (Lead CI/CD & Deploy):**
  - *Challenge:* Menghindari kegagalan build pipeline CI/CD saat unit test membutuhkan database aktif di runner GitHub Actions.
  - *Solution:* Mengintegrasikan service PostgreSQL runner di dalam workflow `ci.yml` GitHub Actions.
- **Betran (Lead QA & Docs) — Biggest Learning:**
  - *Kesimpulan Pelajaran:* "Pelajaran terbesar dari tim Miracle adalah menyelaraskan koordinasi antar-disiplin backend, frontend, kontainerisasi, dan deployment. Pentingnya standardisasi skema, dokumentasi API Contract, dan uji fungsionalitas menyeluruh agar seluruh komponen terhubung tanpa jeda."

## Slide 7: Team Contributions (🎤 Speaker: Semua Anggota / Round-robin | Durasi: 1.5 menit)
- Debora Intania Subekti — Lead Backend — Pemecahan FastAPI ke *microservices*, skema *database*, logika bisnis *endpoint* API — [71 commits, 16 PRs]
- Avhilla Catton Andalucia — Lead Container — Setup kontainerisasi (Docker/Compose), Nginx Gateway, CI/CD Pipeline ke Railway — [50 commits, 20 PRs]
- Chelsy Olivia — Lead CI/CD & Deploy — Setup workflow GitHub Actions, automated testing pipeline, deploy ke Railway — [52 commits, 22 PRs]
- Yosan Pratiwi — Lead Frontend — Integrasi React UI dengan Nginx Gateway, implementasi halaman status, perbaikan UI/UX — [47 commits, 10 PRs]
- Betran — Lead QA & Docs — Uji coba API (Swagger/Thunder Client), *API Contract*, rilis dokumentasi, dan ERD — [31 commits, 15 PRs]
![alt text](image-18.png)

---

## Demo Script (Skenario Perekaman Video)

**Persiapan Awal:** Pastikan aplikasi sudah berjalan lokal (*Docker*) dan siapkan *tab* GitHub repositori Anda di *browser*.

1. **Akses Beranda (Open App):**
   - **Aksi:** Buka browser dan akses `http://localhost` (Docker) atau `http://localhost:5173` (dev). Aplikasi berjalan melalui Nginx Gateway di port 80 yang meneruskan request ke frontend container.
   - **Penjelasan:** "Ini halaman utama TraceLT. Pengunjung biasa dapat mencari stok darah sukarela secara real-time."

2. **Registrasi Akun Baru (Register):**
   - **Aksi:** Klik "Daftar". Isi formulir registrasi akun pengguna baru civitas akademika ITK.
   - **Penjelasan:** "Kami mendemokan pendaftaran akun. *Auth Service* memvalidasi format data dan menyimpan *password* dalam bentuk *hash* secara aman."

3. **Autentikasi Pengguna (Login):**
   - **Aksi:** Masuk ke menu Login, ketik email dan *password* yang baru didaftarkan.
   - **Penjelasan:** "Gateway meneruskan *request* ini ke *Auth Service*. Setelah validasi sukses, *frontend* menerima token JWT untuk memulai sesi."

4. **Manajemen Pendonor (Create & View Items):**
   - **Aksi:** Klik form "Daftar Pendonor Sukarela". Isi form 3 langkah (identitas, fisik, kesehatan) dan klik Simpan.
   - **Penjelasan:** "Ini adalah bukti fitur *Create* berjalan. Data yang di-input akan dikelola langsung oleh *Donor Service* dan riwayat donor akan otomatis terhubung."

5. **Verifikasi Admin (Simulasi Transaksi):**
   - **Aksi:** Login menggunakan akun Admin (`admin@itk.ac.id`), buka Antrian Verifikasi, lalu klik Setujui pada pengajuan tadi.
   - **Penjelasan:** "Admin masuk ke portal untuk memverifikasi data kelayakan pendonor. Status otomatis ter-update."

6. **Pembaruan & Penghapusan (Update & Delete Items):**
   - **Aksi:** Buka detail pendonor, ubah golongan darah atau status donornya (*Update*), lalu lakukan simulasi penghapusan data uji (*Delete*).
   - **Penjelasan:** "Fitur Edit dan Hapus membuktikan API berfungsi penuh. Walaupun *microservices*, integrasinya dari UI sangat mulus berkat Nginx Gateway."

7. **Monitoring Sistem (Cek Halaman Status):**
   - **Aksi:** Buka halaman monitoring sistem `/status` (atau *hit endpoint* `/health` / `/auth/metrics`).
   - **Penjelasan:** "Ini adalah *dashboard health-check*. Memastikan bahwa baik *Auth Service*, *Donor Service*, beserta PostgreSQL berjalan sehat (Healthy)."

8. **Bukti Automasi CI/CD (Show CI/CD Badge):**
   - **Aksi:** Pindah ke *tab* repositori GitHub. Tunjukkan *badge* hijau "passing", klik tab "Actions" untuk melihat riwayat *pipeline*.
   - **Penjelasan:** "Di repositori GitHub, setiap kode yang di-*push* akan melewati automasi *testing* dan *linting* menggunakan GitHub Actions."

9. **Pembuktian Log Arsitektur (Structured Logs):**
   - **Aksi:** Buka Terminal proyek Anda. Jalankan `docker compose ps` (memperlihatkan status kontainer `Up`), lalu `docker compose logs --tail=20 gateway`.
   - **Penjelasan:** "Sebagai penutup, ini bukti nyata implementasi *microservices* kontainer kami. Lalu lintas antar layanan terekam di terminal secara *real-time*."
