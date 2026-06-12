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
- Target pengguna: Civitas akademika Institut Teknologi Kalimantan sebagai pendonor sukarela, dan Admin UTD/Sistem sebagai verifikator data kesiapan pendonor.
- Solusi: Platform web "TraceLT" berbasis cloud sebagai repositori terpusat untuk pendataan pendonor darah sukarela, riwayat donor, verifikasi administratif, serta pemantauan stok darah secara real-time.

## Slide 3: Architecture Journey (🎤 Speaker: Chelsy - Lead CI/CD & Deploy | Durasi: 2 menit)
- Week 1-4: Monolith (1 backend FastAPI, 1 DB PostgreSQL, React Frontend) → [Diagram Monolith]
```text
[React Frontend] <--HTTP--> [FastAPI Backend] <--SQL--> [PostgreSQL]
       |                            |
  Vite + JSX               REST API Endpoints
(Port 3000/5173)              (Port 8000)
```
- Week 5-7: Containerized (Docker Compose) → [Diagram Docker Monolith: frontend, backend, postgres-db dalam bridge network]
- Week 9-11: CI/CD (GitHub Actions + Railway) → [Screenshot workflow green badge & auto-deployment Railway]
- Week 12-14: Microservices (2 services + gateway) → [Diagram arsitektur akhir dengan Gateway routing request ke Auth Service & Donor Service]

## Slide 4: Tech Stack & Infrastructure (🎤 Speaker: Avhilla - Lead Container | Durasi: 2 menit)
- Diagram arsitektur final: [Diagram: React Frontend -> Nginx Gateway -> Auth Service & Donor Service -> PostgreSQL Database]
- Jumlah containers, services, endpoints:
  - 3 Containers Utama (`tracelt-frontend`, `tracelt-backend`, `tracelt-db`)
  - 3 Services Terkoneksi (React SPA, FastAPI backend monolith/telemetry, PostgreSQL)
  - ~22 Endpoints (Authentication, Donors Management, Riwayat Donor, Public Blood Stock, System Status/Telemetry)
- CI/CD pipeline flow: GitHub Actions (`lint check`, `pytest runs`) → Build Docker Multi-stage → Deploy ke Railway.
- Monitoring & observability: Custom telemetry `/auth/metrics`, `/donor/metrics`, `/health` dashboard, p95 latency percentiles, dan log correlation ID tracking.

## Slide 5: Live Demo (🎤 Speaker: Yosan & Debora | Durasi: 3 menit)
- **Skenario Pembagian Peran Demo:**
  - **Yosan (Frontend):** Menjadi *driver* navigasi antarmuka web, mendemokan interaksi UI/UX, registrasi form, dashboard admin, dan halaman status.
  - **Debora (Backend):** Menjelaskan *telemetry insights*, proses validasi database, skema autentikasi token JWT, dan pemrosesan metrik di balik layar.
- **Detail Flow:**
  1. **Open App & Register Pengguna:**
     - *Yosan:* Buka Landing Page publik, isi form daftar akun pengguna baru civitas akademika ITK.
     - *Debora:* "Data pengguna baru divalidasi keunikan emailnya, password di-hash dengan bcrypt, lalu disimpan di database PostgreSQL."
  2. **Login & Isi Formulir Pendonor:**
     - *Yosan:* Login dengan akun baru, buka form pengajuan pendonor sukarela 3-langkah (Data Diri, Golongan Darah, Riwayat Kesehatan).
     - *Debora:* "Setiap submit form akan secara dinamis memverifikasi kelayakan umur/berat badan dan membuat relasi otomatis (auto-linking) riwayat donor."
  3. **Verifikasi Admin:**
     - *Yosan:* Login ke Portal Admin, buka Antrian Verifikasi, lalu menyetujui pengajuan pendonor yang baru masuk.
     - *Debora:* "Perubahan status diverifikasi oleh admin dengan otorisasi JWT admin, memperbarui riwayat donor secara instan."
  4. **Halaman Status Observabilitas:**
     - *Yosan:* Navigasi ke menu `/status` untuk menunjukkan dasbor kesehatan sistem yang responsif dan real-time.
     - *Debora:* "Dasbor ini memantau latency, uptime, persentil respon, status database, status circuit breaker, serta menampilkan top-endpoint terpopuler (GET /pendonor, POST /auth/pengguna/login, dll)."
- **Backup:** Video demo cadangan kualitas HD telah disiapkan jika terjadi kendala jaringan saat presentasi.

## Slide 6: Challenges & Lessons Learned (🎤 Speaker: Semua Anggota / Round-robin | Durasi: 1.5 menit)
- **Debora (Lead Backend):**
  - *Challenge:* Mengintegrasikan middleware metrik in-memory agar efisien tanpa mengorbankan performa respon endpoint utama.
  - *Solution:* Mengimplementasikan penguncian thread-safe (Lock) minimal di luar proses logging dan menormalkan parameter path dengan regex.
- **Yosan (Frontend):**
  - *Challenge:* Menyelaraskan grafik Recharts dan data tabel metrik dinamis agar terus memperbarui data secara asinkron tanpa kebocoran memori.
  - *Solution:* Memanfaatkan hook useEffect dengan cleanup timer interval secara terstruktur untuk auto-refresh.
- **Avhilla (Lead Container):**
  - *Challenge:* Mengurangi ukuran image build Docker Node.js dan Python yang awalnya melebihi 1 GB.
  - *Solution:* Menerapkan teknik multi-stage build, menggunakan alpine base image, dan mengoptimalkan konfigurasi Nginx statis.
- **Chelsy (Lead CI/CD & Deploy):**
  - *Challenge:* Menghindari kegagalan build pipeline CI/CD saat unit test membutuhkan database aktif di runner GitHub Actions.
  - *Solution:* Mengintegrasikan service PostgreSQL runner di dalam workflow `ci.yml` GitHub Actions.
- **Betran (Lead QA & Docs) — Biggest Learning:**
  - *Kesimpulan Pelajaran:* "Pelajaran terbesar bagi tim Miracle adalah menyelaraskan koordinasi antar-disiplin backend, frontend, kontainerisasi, dan deployment. Pentingnya standardisasi skema, dokumentasi API Contract, dan uji kegagalan sistem agar platform TraceLT dapat dinilai andal dan scalable."

## Slide 7: Team Contributions (🎤 Speaker: Semua Anggota / Round-robin | Durasi: 1.5 menit)
- Debora Intania Subekti — Lead Backend — Pemecahan logic, skema database, autentikasi JWT & bcrypt, monolith metrics & health telemetry — [60 commits, 11 PRs]
- Avhilla Catton Andalucia — Lead Container — Setup kontainerisasi Docker/Compose, optimasi multi-stage build frontend/backend — [45 commits, 12 PRs]
- Chelsy Olivia — Lead CI/CD & Deploy — Setup workflow GitHub Actions, automated testing pipeline, deploy ke Railway — [38 commits, 10 PRs]
- Yosan Pratiwi — Lead Frontend — Redesign halaman status observabilitas, integrasi UI dengan backend API, dynamic chart Recharts — [28 commits, 8 PRs]
- Betran — Lead QA & Docs — Uji coba API Swagger, penulisan dokumen laporan QA, api-test-results, dan ERD — [24 commits, 9 PRs]

---

## Demo Script (Skenario Perekaman Video)

1. **Akses Beranda (Open App):**
   - **Aksi:** Buka browser ke `http://localhost:3000`. Show landing page TraceLT.
   - **Narasi:** "Ini halaman utama TraceLT. Civitas akademika ITK dapat memantau stok darah sukarela yang tersedia secara real-time."

2. **Registrasi Akun Baru (Register):**
   - **Aksi:** Buka form registrasi akun pengguna baru, masukkan data valid, lalu klik Daftar.
   - **Narasi:** "Kami membuat akun pengguna baru. Validasi backend memastikan keunikan email dan kekuatan password."

3. **Autentikasi Pengguna (Login):**
   - **Aksi:** Buka halaman Login, masukkan email dan password yang baru saja didaftarkan.
   - **Narasi:** "Login berhasil dan frontend menyimpan token JWT untuk mengamankan komunikasi request ke backend."

4. **Pengajuan Pendonor Baru (Create):**
   - **Aksi:** Klik form "Daftar Pendonor Sukarela". Isi form 3 langkah (identitas, fisik, kesehatan) dan klik Simpan.
   - **Narasi:** "Pengguna mendaftarkan diri sebagai pendonor. Backend otomatis menghubungkan riwayat donor berdasarkan kecocokan email."

5. **Verifikasi Admin (Update):**
   - **Aksi:** Login menggunakan akun Admin (`admin@itk.ac.id`), buka Antrian Verifikasi, lalu klik Setujui pada pengajuan tadi.
   - **Narasi:** "Admin masuk ke portal untuk memverifikasi data kelayakan pendonor. Status otomatis ter-update."

6. **Monitoring Sistem (Cek /status):**
   - **Aksi:** Navigasi ke menu "Status Sistem" (`/status`). Perlihatkan service cards, latency distribution, dan tabel traffic endpoint.
   - **Narasi:** "Halaman ini memantau kesehatan seluruh sistem secara real-time. Tabel metrik menunjukkan endpoints teratas seperti GET /pendonor beserta statistik latency-nya."

7. **CI/CD Badge (Show GitHub):**
   - **Aksi:** Pindah ke tab repositori GitHub, perlihatkan badge status "passing" hijau dan tab Actions.
   - **Narasi:** "Seluruh perubahan kode telah diuji secara otomatis melalui GitHub Actions pipeline untuk menjaga integrasi kode bebas bug."

8. **Pembuktian Log Kontainer (Structured Logs):**
   - **Aksi:** Buka terminal, jalankan `docker compose ps` lalu tunjukkan log backend `docker compose logs backend --tail=15`.
   - **Narasi:** "Terakhir, ini adalah pembuktian runtime container TraceLT dengan log terstruktur yang siap melacak correlation ID request."