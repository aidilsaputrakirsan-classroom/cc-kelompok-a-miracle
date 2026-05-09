# Testing Guide - Lead QA & Docs

Dokumen ini berisi panduan menjalankan validasi test, membaca hasil CI/CD, dan mengecek edge case aplikasi TraceIt. Panduan ini dipakai sebelum membuat pull request agar perubahan backend, frontend, dan dokumentasi tetap stabil.

## Ringkasan Tanggung Jawab QA

Lead QA & Docs bertugas memastikan test yang tersedia dapat dijalankan, hasilnya terdokumentasi, dan risiko edge case dicatat sebelum merge. Fokus validasi pada pertemuan ini adalah:

- Menjalankan validasi backend dan frontend yang sudah tersedia.
- Mengecek status GitHub Actions pada workflow `CI/CD Pipeline`.
- Menambahkan badge CI/CD pada README.
- Mendokumentasikan langkah testing dan edge case aplikasi.
- Mencatat gap testing yang masih perlu ditindaklanjuti oleh lead terkait.

## Validasi Lokal

### 1. Jalankan service dengan Docker

Gunakan Docker Compose dari root repository:

```bash
docker compose up -d
```

Pastikan container backend, frontend, dan database berjalan:

```bash
docker compose ps
```

Backend dapat dicek melalui:

```bash
curl http://127.0.0.1:8000/health
```

Ekspektasi hasil:

- Status HTTP `200`.
- Response menampilkan `status` bernilai `healthy`.
- Database terbaca `connected`.

### 2. Validasi backend

Masuk ke folder backend:

```bash
cd backend
```

Jalankan test koneksi database:

```bash
python test_db_connection.py
```

Ekspektasi hasil:

- Backend berhasil terhubung ke PostgreSQL.
- Query dasar `SELECT 1` berhasil.
- Ringkasan jumlah data tabel aplikasi tampil tanpa error.

Jalankan test pagination jika backend aktif di `http://127.0.0.1:8000`:

```bash
python test_pagination.py
```

Catatan QA: file `test_pagination.py` masih memakai endpoint `/items`, sedangkan aplikasi TraceIt saat ini memakai endpoint seperti `/pendonor` dan `/riwayat-donor`. Jika test ini gagal karena endpoint tidak ditemukan, catat sebagai gap yang perlu diperbarui oleh tim backend/QA.

### 3. Validasi frontend

Masuk ke folder frontend:

```bash
cd frontend
npm ci
npm run build
npm run lint
```

Ekspektasi hasil:

- `npm ci` berhasil memasang dependency dari `package-lock.json`.
- `npm run build` berhasil membuat bundle Vite tanpa error.
- `npm run lint` tidak menampilkan error blocking.

Catatan QA: `frontend/package.json` belum memiliki script `npm test`, sehingga validasi frontend saat ini masih berbasis build dan lint.

## Validasi GitHub Actions

Workflow yang dipakai ada di `.github/workflows/ci.yml` dengan nama `CI/CD Pipeline`.

Cara mengecek:

1. Buka repository GitHub.
2. Masuk ke tab **Actions**.
3. Pilih workflow **CI/CD Pipeline**.
4. Buka run terbaru dari branch atau pull request yang sedang dikerjakan.
5. Pastikan job berikut selesai tanpa error:
   - `Test Backend`
   - `Build Frontend`
   - `Build & Push Docker Images`

Pada pull request, job Docker hanya melakukan build image. Push ke Docker Hub hanya berjalan saat event `push` ke branch `main` dan secret Docker Hub tersedia.

## Checklist Sebelum Pull Request

- Branch kerja sudah sesuai pembagian tugas: `docs/testing-guide`.
- README memiliki badge GitHub Actions.
- `docs/testing-guide.md` sudah menjelaskan cara menjalankan validasi lokal dan CI.
- Backend health check berhasil atau kegagalannya sudah dicatat.
- Frontend build berhasil atau error-nya sudah dicatat.
- Edge case penting sudah diuji manual atau masuk catatan follow-up.
- Tidak ada file perubahan anggota lain yang ikut diubah tanpa kebutuhan.

## Edge Cases yang Perlu Diuji

### Authentication

- Login admin dengan email benar dan password benar.
- Login admin dengan password salah.
- Login pengguna dengan akun yang belum terdaftar.
- Register pengguna dengan email duplikat.
- Register dengan format email tidak valid.
- Register dengan password lemah atau terlalu pendek.

### Data Pendonor

- Membuat pendonor dengan data valid.
- Membuat pendonor dengan field wajib kosong.
- Membuat pendonor dengan nomor telepon tidak valid.
- Membuat pendonor dengan umur, berat badan, atau tinggi badan di luar batas wajar.
- Mengambil detail pendonor dengan ID yang tidak ada.
- Mengubah data pendonor dengan nilai kosong pada field penting.
- Menghapus pendonor dan memastikan data tidak tampil lagi di daftar.

### Filter dan Pagination

- `GET /pendonor?skip=0&limit=20` mengembalikan daftar normal.
- `GET /pendonor?skip=-1` ditolak validasi.
- `GET /pendonor?limit=0` ditolak validasi.
- `GET /pendonor?limit=1001` ditolak karena melebihi batas.
- Filter nama mengembalikan data yang sesuai.
- Filter golongan darah, jenis kelamin, dan rentang umur berjalan sesuai parameter.

### Riwayat Donor dan Verifikasi

- Membuat riwayat donor dengan `id_pendonor` valid.
- Membuat riwayat donor dengan `id_pendonor` tidak ada.
- Pengguna melihat riwayat donor miliknya sendiri.
- Pengguna tidak dapat mengubah riwayat donor yang sudah diverifikasi.
- Pengguna tidak dapat menghapus riwayat donor yang sudah diverifikasi.
- Admin dapat menyetujui atau menolak riwayat donor.
- Setelah riwayat disetujui, total donor pendonor bertambah sesuai aturan aplikasi.

### UI Frontend

- Halaman login menampilkan pesan error saat kredensial salah.
- Halaman daftar pendonor tetap rapi saat data kosong.
- Halaman dashboard menampilkan loading state saat data masih dimuat.
- Form menampilkan validasi saat field wajib kosong.
- UI tetap dapat digunakan saat API mengembalikan error.

## Gap Testing Saat Ini

Beberapa hal yang masih perlu ditingkatkan:

- Backend belum memakai struktur test otomatis berbasis `pytest`.
- `backend/requirements.txt` belum mencantumkan dependency testing seperti `pytest`.
- `Makefile` masih menampilkan test sebagai placeholder.
- Frontend belum memiliki framework test dan script `npm test`.
- CI backend baru menjalankan health check, belum menjalankan seluruh skenario API.
- Dokumentasi test lama masih perlu disesuaikan dari endpoint contoh `/items` ke endpoint TraceIt seperti `/pendonor`.

## Format Catatan Hasil QA

Gunakan format berikut saat mencatat hasil pengujian:

```md
Tanggal:
Branch:
Tester:

## Ringkasan
- Backend:
- Frontend:
- CI/CD:

## Hasil Test
| Area | Skenario | Hasil | Catatan |
| --- | --- | --- | --- |
| Backend | GET /health | Pass | Database connected |

## Issue / Follow-up
- 
```
