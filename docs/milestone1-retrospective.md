# Retrospective — Milestone 1

**Periode:** Minggu 1-7 (Setup hingga Docker Multi-Container)  
**Kelompok:** A - Miracle  
**Tanggal:** 4 Mei 2026  
**Disusun oleh:** Betran (Lead QA & Docs)

---

## 🟢 Apa yang Berjalan Baik?

- **Setup project berhasil dengan cepat** — Backend FastAPI dan Frontend React berhasil disetup dalam minggu pertama tanpa kendala besar
- **Docker Compose orchestration berjalan lancar** — Ketiga container (frontend, backend, database) berhasil berkomunikasi melalui Docker network
- **Authentication & Authorization solid** — Implementasi JWT + bcrypt untuk admin dan pengguna berjalan sesuai spesifikasi
- **Database schema well-designed** — ERD dan relasi antar tabel (pendonor, pengguna, riwayat_donor, admin) sudah sesuai kebutuhan bisnis
- **Multi-stage Docker build berhasil** — Ukuran image berkurang drastis (backend: 1.2GB → 216MB, frontend: 1.1GB → 93.8MB)
- **Dokumentasi teknis lengkap** — Architecture diagram, API endpoints, dan Docker setup terdokumentasi dengan baik
- **CI/CD pipeline terimplementasi** — GitHub Actions untuk build, test, dan push ke Docker Hub sudah berjalan

## 🔴 Apa yang Perlu Diperbaiki?

- **Dokumentasi testing masih menggunakan contoh lama** — File `ui-test-results.md` dan `api-test-results.md` masih menggunakan endpoint `/items` dari project sebelumnya, bukan endpoint TraceIt
- **Komunikasi antar tim bisa lebih baik** — Beberapa kali terjadi pekerjaan yang overlap karena kurang koordinasi di awal sprint
- **Code review belum konsisten** — Beberapa PR di-merge tanpa review dari anggota lain, perlu enforcement yang lebih ketat
- **Testing coverage masih minim** — Belum ada unit test atau integration test yang terstruktur untuk backend dan frontend
- **Environment variables management** — Masih ada kebingungan antara `.env`, `.env.docker`, dan `.env.example` di beberapa anggota tim
- **Git workflow belum seragam** — Beberapa commit langsung ke `main` tanpa melalui PR, perlu enforcement branch protection

## 🔵 Action Items untuk Milestone 2

- **Perbaiki dokumentasi testing** — Update `ui-test-results.md` dan `api-test-results.md` dengan endpoint TraceIt yang sebenarnya
- **Implementasi branch protection** — Enforce PR review sebelum merge ke `main`, minimal 1 approval dari anggota lain
- **Setup testing framework** — Implementasi pytest untuk backend dan Jest/Vitest untuk frontend
- **Standarisasi git workflow** — Gunakan conventional commits dan feature branch untuk semua perubahan
- **Daily standup singkat** — 10 menit setiap hari untuk sync progress dan hindari pekerjaan overlap
- **Dokumentasi environment setup** — Buat guide lengkap untuk setup `.env` agar tidak ada kebingungan
- **Code review checklist** — Buat template checklist untuk reviewer agar review lebih terstruktur

## 📊 Kontribusi Tim

| Anggota                  | Kontribusi Utama                                                                      | Jumlah Commit |
| ------------------------ | ------------------------------------------------------------------------------------- | ------------- |
| Debora Intania Subekti   | Backend API (auth, CRUD pendonor, riwayat donor), Database schema, SQLAlchemy models  | 25+           |
| Avhilla Catton Andalucia | Docker setup, Dockerfile optimization, Docker Compose orchestration, Volume & Network | 18+           |
| Chelsy Olivia            | CI/CD pipeline (GitHub Actions), Docker Hub push, Image optimization, Deployment      | 15+           |
| Yosan Pratiwi            | Frontend React (routing, components, pages), UI/UX design, API integration            | 22+           |
| Betran                   | QA testing, Dokumentasi (README, architecture, kisi-kisi UTS), API testing            | 12+           |

**Total Commits:** 92+ commits (dari `git log --oneline | wc -l`)

---

## 📈 Metrics

| Metric                       | Target   | Actual  | Status      |
| ---------------------------- | -------- | ------- | ----------- |
| Docker image size (backend)  | < 500 MB | 216 MB  | ✅ Exceeded |
| Docker image size (frontend) | < 200 MB | 93.8 MB | ✅ Exceeded |
| API endpoints implemented    | 15+      | 16      | ✅ Met      |
| Frontend pages               | 8+       | 9       | ✅ Met      |
| Documentation coverage       | 80%      | 85%     | ✅ Met      |
| CI/CD pipeline               | Working  | Working | ✅ Met      |

---

## 🎯 Kesimpulan

Milestone 1 secara keseluruhan **berhasil** dengan baik. Semua target teknis tercapai, bahkan beberapa melebihi ekspektasi (ukuran Docker image). Namun, ada ruang untuk perbaikan di sisi proses tim (komunikasi, code review, testing). Action items untuk Milestone 2 sudah jelas dan akan membantu meningkatkan kualitas kerja tim di sprint berikutnya.

**Overall Rating:** 8/10 ⭐⭐⭐⭐⭐⭐⭐⭐
