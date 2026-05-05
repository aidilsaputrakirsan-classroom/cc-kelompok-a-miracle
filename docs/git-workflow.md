# Git Workflow Guide — Tim Miracle (TraceIt)

Panduan ini mengatur alur kerja Git untuk seluruh anggota tim agar kolaborasi berjalan konsisten, terstruktur, dan mudah di-review.

---

## Daftar Isi

1. [Branch Naming Convention](#branch-naming-convention)
2. [Commit Convention](#commit-convention)
3. [Pull Request (PR) Process](#pull-request-pr-process)
4. [Code Review Guidelines](#code-review-guidelines)
5. [Branch Protection Rules](#branch-protection-rules)
6. [Referensi CODEOWNERS](#referensi-codeowners)

---

## Branch Naming Convention

Gunakan format berikut saat membuat branch baru:

```
<type>/<deskripsi-singkat>
```

### Tipe Branch

| Tipe       | Kegunaan                                | Contoh                              |
|------------|-----------------------------------------|-------------------------------------|
| `feat`     | Fitur baru                              | `feat/donor-registration-form`      |
| `fix`      | Perbaikan bug                           | `fix/login-token-expired`           |
| `docs`     | Dokumentasi                             | `docs/git-workflow-guide`           |
| `chore`    | Maintenance, config, tooling            | `chore/update-docker-compose`       |
| `refactor` | Refactoring tanpa mengubah fungsionalitas | `refactor/auth-middleware`        |
| `test`     | Penambahan atau perbaikan test          | `test/api-health-check`            |
| `ci`       | Perubahan CI/CD pipeline                | `ci/add-lint-workflow`             |
| `style`    | Perubahan formatting/styling (bukan CSS)| `style/fix-flake8-warnings`        |

### Aturan

- Gunakan **huruf kecil** dan **kebab-case** (pisahkan kata dengan `-`)
- Deskripsi singkat, maksimal 3-4 kata
- Jangan gunakan nama orang sebagai nama branch
- Branch `main` adalah branch **production** — tidak boleh push langsung

---

## Commit Convention

Kami menggunakan [Conventional Commits](https://www.conventionalcommits.org/) untuk semua commit message.

### Format

```
<type>(<scope>): <deskripsi singkat>

[body opsional]

[footer opsional]
```

### Type

| Type       | Deskripsi                                         |
|------------|---------------------------------------------------|
| `feat`     | Menambahkan fitur baru                            |
| `fix`      | Memperbaiki bug                                   |
| `docs`     | Perubahan dokumentasi saja                        |
| `style`    | Formatting, semicolons, dll (bukan perubahan kode)|
| `refactor` | Refactoring kode tanpa mengubah behavior          |
| `test`     | Menambah atau memperbaiki test                    |
| `chore`    | Update build tasks, config, dependencies          |
| `ci`       | Perubahan pada file CI/CD                         |
| `perf`     | Peningkatan performa                              |

### Scope (Opsional)

Scope menunjukkan area yang terdampak:

| Scope      | Area                    |
|------------|-------------------------|
| `backend`  | Kode backend/API        |
| `frontend` | Kode frontend/UI        |
| `devops`   | Docker, infra, deploy   |
| `ci`       | GitHub Actions, pipeline|
| `docs`     | Dokumentasi             |

### Contoh Commit Message

```bash
# Fitur baru
feat(frontend): add donor registration form with validation

# Bug fix
fix(backend): handle expired JWT token gracefully

# Dokumentasi
docs: add git workflow guide for team

# Chore
chore(devops): update docker-compose postgres version

# Dengan body
feat(backend): add blood type filter to donor list

Menambahkan query parameter `blood_type` pada endpoint
GET /api/donors untuk memfilter donor berdasarkan golongan darah.

Closes #12
```

### Aturan Commit

- Gunakan **bahasa Inggris** untuk commit message
- Deskripsi diawali huruf kecil, tanpa titik di akhir
- Maksimal 72 karakter untuk baris pertama
- Gunakan imperative mood: "add", "fix", "update" (bukan "added", "fixes")
- Satu commit = satu perubahan logis (jangan campur fitur dan fix dalam satu commit)

---

## Pull Request (PR) Process

### Langkah Membuat PR

1. **Pastikan branch up-to-date dengan `main`**
   ```bash
   git checkout main
   git pull origin main
   git checkout <branch-kamu>
   git merge main
   ```

2. **Jalankan pre-PR check**
   ```bash
   make pr-check
   ```

3. **Push branch ke remote**
   ```bash
   git push origin <branch-kamu>
   ```

4. **Buat Pull Request di GitHub**
   - Buka repository di GitHub
   - Klik "Compare & pull request"
   - Isi template PR

### Template PR

Gunakan format berikut saat membuat PR:

```markdown
## Deskripsi
<!-- Jelaskan perubahan yang dilakukan dan alasannya -->

## Tipe Perubahan
- [ ] Fitur baru (feat)
- [ ] Bug fix (fix)
- [ ] Dokumentasi (docs)
- [ ] Refactoring (refactor)
- [ ] Chore/maintenance (chore)

## Checklist
- [ ] Kode sudah di-test secara lokal
- [ ] `make pr-check` berhasil tanpa error
- [ ] Commit message mengikuti conventional commits
- [ ] Dokumentasi sudah diperbarui (jika diperlukan)
- [ ] Tidak ada conflict dengan branch `main`

## Screenshot (jika ada perubahan UI)
<!-- Tambahkan screenshot sebelum dan sesudah -->

## Catatan untuk Reviewer
<!-- Hal-hal yang perlu diperhatikan saat review -->
```

### Aturan PR

- **Judul PR** mengikuti format conventional commits: `feat(scope): deskripsi`
- **Satu PR = satu concern** — jangan gabung fitur berbeda dalam satu PR
- **Assign reviewer** sesuai CODEOWNERS (otomatis oleh GitHub)
- **Minimum 1 approval** sebelum merge
- **Resolve semua review comments** sebelum merge
- Gunakan **Squash and Merge** untuk menjaga history tetap bersih

---

## Code Review Guidelines

### Untuk Reviewer

1. **Review dalam 24 jam** setelah di-assign
2. **Fokus pada:**
   - Kebenaran logika dan fungsionalitas
   - Potensi bug atau edge case
   - Konsistensi dengan arsitektur yang ada
   - Readability dan maintainability
   - Security concerns (hardcoded secrets, SQL injection, dll)
3. **Berikan feedback yang konstruktif:**
   - Jelaskan *mengapa* sesuatu perlu diubah, bukan hanya *apa*
   - Bedakan antara **blocking** (harus diperbaiki) dan **nit** (saran opsional)
   - Gunakan prefix:
     - `[BLOCKING]` — Harus diperbaiki sebelum merge
     - `[NIT]` — Saran perbaikan, opsional
     - `[QUESTION]` — Butuh klarifikasi
4. **Approve** jika sudah sesuai, atau **Request Changes** jika ada blocking issue

### Untuk Author

1. **Self-review** sebelum request review — baca diff sendiri terlebih dahulu
2. **Respond** ke semua komentar reviewer
3. **Jangan force-push** setelah review dimulai (agar history review tidak hilang)
4. **Resolve conversation** setelah memperbaiki feedback
5. **Re-request review** setelah semua perubahan selesai

### Checklist Review

| Area          | Yang Dicek                                              |
|---------------|---------------------------------------------------------|
| Fungsionalitas| Apakah kode melakukan apa yang dimaksud?                |
| Error handling| Apakah error ditangani dengan baik?                     |
| Naming        | Apakah nama variabel/fungsi deskriptif?                 |
| DRY           | Apakah ada duplikasi yang bisa di-refactor?             |
| Security      | Apakah ada data sensitif yang ter-expose?               |
| Performance   | Apakah ada query/loop yang tidak efisien?               |
| Tests         | Apakah ada test untuk perubahan ini?                    |

---

## Branch Protection Rules

Branch `main` dilindungi dengan aturan berikut:

- **Tidak boleh push langsung** ke `main`
- **Wajib melalui Pull Request**
- **Minimum 1 approval** dari reviewer
- **CI checks harus pass** sebelum merge
- **Branch harus up-to-date** dengan `main` sebelum merge

---

## Referensi CODEOWNERS

File `.github/CODEOWNERS` mengatur **automatic reviewer assignment** berdasarkan file yang diubah:

| Path                    | Owner (Reviewer)                    | Role              |
|-------------------------|-------------------------------------|-------------------|
| `/backend/`             | @intniaa20-lead-backend             | Lead Backend      |
| `/frontend/`            | @yosanpratiwi-lead-frontend        | Lead Frontend     |
| `docker-compose.yml`    | @Avhilla-lead-devops                | Lead DevOps       |
| `/backend/Dockerfile`   | @Avhilla-lead-devops                | Lead DevOps       |
| `/frontend/Dockerfile`  | @Avhilla-lead-devops                | Lead DevOps       |
| `Makefile`              | @Avhilla-lead-devops                | Lead DevOps       |
| `README.md`             | @Betran23-lead-qa                   | Lead QA & Docs    |
| `/docs/`                | @Betran23-lead-qa                   | Lead QA & Docs    |
| `/.github/workflows/`   | @10231025-colab-lead-cicd           | Lead CI/CD        |

### Cara Kerja

- Saat PR dibuat, GitHub otomatis assign reviewer berdasarkan file yang diubah
- Jika mengubah file di `/backend/`, maka @intniaa20-lead-backend otomatis jadi reviewer
- Jika PR menyentuh beberapa area, semua owner terkait akan di-assign

---

## Quick Reference

```bash
# 1. Mulai kerja fitur baru
git checkout main
git pull origin main
git checkout -b feat/nama-fitur

# 2. Commit perubahan
git add .
git commit -m "feat(scope): deskripsi singkat"

# 3. Push dan buat PR
git push origin feat/nama-fitur
# Lalu buat PR di GitHub

# 4. Setelah PR di-merge, cleanup
git checkout main
git pull origin main
git branch -d feat/nama-fitur
```

---

## Catatan

- Panduan ini berlaku mulai **Milestone 2**
- Semua anggota tim wajib mengikuti konvensi ini
- Jika ada pertanyaan atau saran perubahan, diskusikan di group chat tim
- Dokumen ini akan di-update sesuai kebutuhan tim

---

*Terakhir diperbarui: Mei 2026*
