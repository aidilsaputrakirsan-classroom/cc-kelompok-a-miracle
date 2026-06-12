# Observability Testing - TraceIt Microservices

Dokumen ini adalah panduan Lead QA & Docs untuk Modul 14. Fokus pengujian adalah memastikan structured logging, correlation ID, metrics, error-rate alerting, dan helper script observability dapat dipakai untuk debugging microservices TraceIt.

## Tujuan

Observability testing memastikan sistem memenuhi perilaku berikut:

- Auth Service dan Donor Service menghasilkan log request dalam format JSON.
- Setiap request memiliki `correlation_id` yang bisa dipakai untuk menelusuri alur request lintas service.
- Gateway meneruskan header `X-Correlation-ID` ke upstream service dan mengembalikannya ke response client.
- Endpoint metrics menampilkan jumlah request, error, latency, dan statistik last-minute.
- Error rate di atas threshold menghasilkan log alert level `CRITICAL`.
- Script helper log dapat dipakai untuk melihat semua log, filter error, trace correlation ID, dan mengambil metrics.

## Komponen yang Diuji

| Komponen | File | Perilaku yang Diverifikasi |
|----------|------|----------------------------|
| Logging config | `services/auth-service/logging_config.py`, `services/item-service/logging_config.py` | Format log JSON dengan field observability wajib |
| Logging middleware | `services/auth-service/logging_middleware.py`, `services/item-service/logging_middleware.py` | Pencatatan request/response, status code, durasi, dan correlation ID |
| Gateway | `services/gateway/nginx.conf` | Generate dan forward `X-Correlation-ID` |
| Metrics collector | `services/auth-service/metrics.py`, `services/item-service/metrics.py` | Request count, error count, latency, last-minute window, dan threshold alert |
| Alerting test | `services/auth-service/tests/test_metrics_alerting.py`, `services/item-service/tests/test_metrics_alerting.py` | Validasi threshold error rate dan cooldown alert |
| Helper script | `scripts/logs.ps1`, `scripts/logs.sh` | Shortcut untuk logs, errors, trace, dan metrics |

## Ringkasan Pengumpulan Lead QA & Docs

| Kebutuhan Modul 14 | Bukti di Dokumen Ini | Status |
|--------------------|----------------------|--------|
| Structured logging | OT-01 | PASS |
| Correlation ID tracing | OT-02, OT-03 | PASS |
| Metrics endpoint | OT-04 | PASS |
| Error-rate alerting | OT-05 | PASS |
| Helper script observability | OT-06 | PASS di Git Bash |
| Dokumentasi cara reproduce | Command Docker, curl, PowerShell, Bash | Lengkap |
| Hasil QA | Tabel hasil test pada setiap skenario | Sudah diisi berdasarkan eksekusi lokal |

## Ringkasan Hasil Eksekusi QA

Eksekusi dilakukan dari Git Bash pada 2026-06-12 dengan service berjalan melalui Docker Compose.

| Area Test | Command / Bukti | Hasil |
|-----------|------------------|-------|
| Docker service status | `docker compose ps` | PASS - semua service utama `healthy` |
| Gateway health | `curl -i http://localhost/health` | PASS - `200 OK` |
| Public API via gateway | `curl -i http://localhost/api/public/blood-stock` | PASS - `200 OK`, body `{"blood_stock":[]}` |
| Correlation ID manual | `curl -i -H 'X-Correlation-ID: qa-modul-14-trace-001' ...` | PASS - response mengembalikan header yang sama |
| Trace log | `docker compose logs auth-service item-service --tail 300 | grep 'qa-modul-14-trace-001'` | PASS - 1 structured JSON log ditemukan di `item-service` |
| Auth metrics | `curl -s http://localhost/auth/metrics | python -m json.tool` | PASS - JSON metrics berisi `last_minute` dan `alert_threshold_percent` |
| Donor metrics | `curl -s http://localhost/donor/metrics | python -m json.tool` | PASS - JSON metrics berisi `service: item-service` dan `last_minute` |
| Auth alerting unit test | Disposable Python container, `pytest tests/test_metrics_alerting.py -q` | PASS - `12 passed` |
| Donor alerting unit test | Disposable Python container, `pytest tests/test_metrics_alerting.py -q` | PASS - `12 passed` |
| Integration test | Disposable Python container, `pytest /tests/integration -q` | PASS - `10 passed` |
| Frontend test | `cd frontend && npm install && npm test -- --run` | PASS - `6 passed`, `26 passed` |
| Backend legacy test | Disposable Python container, `pytest /app -q` dengan tambahan package `requests` | PASS - `49 passed`, `31 warnings` |
| Helper Bash `all` | `timeout 3s bash scripts/logs.sh all` | PASS - stream log muncul, timeout sesuai ekspektasi |
| Helper Bash `errors` | `bash scripts/logs.sh errors` | PASS - log `CRITICAL` alerting tampil |
| Helper Bash `trace` | `bash scripts/logs.sh trace qa-modul-14-trace-001` | PASS - log correlation ID ditemukan |
| Helper Bash `metrics` | `bash scripts/logs.sh metrics` | PASS - Auth dan Item metrics tampil sebagai JSON |

Catatan QA: test backend legacy gagal pada percobaan pertama karena `backend/test_pagination.py` mengimpor `requests`, sementara `backend/requirements.txt` belum mencantumkan dependency tersebut. Setelah `requests` ditambahkan hanya di container disposable, suite backend lolos `49 passed`.

## Persiapan Test

Jalankan semua service dari root repository:

```bash
docker compose up --build -d
```

Cek status container:

```bash
docker compose ps
```

Pastikan gateway sehat:

```bash
curl http://localhost/health
```

Endpoint utama yang dipakai pada pengujian Modul 14:

| Endpoint | Service | Tujuan |
|----------|---------|--------|
| `http://localhost/auth/health` | Auth Service | Health check Auth Service |
| `http://localhost/donor/health` | Donor Service | Health check Donor Service lewat gateway |
| `http://localhost/auth/metrics` | Auth Service | Snapshot metrics Auth Service |
| `http://localhost/donor/metrics` | Donor Service | Snapshot metrics Donor Service lewat gateway |
| `http://localhost/api/public/blood-stock` | Donor Service | Endpoint publik untuk memicu request normal |

## OT-01 - Structured Logging

### Expected Behavior

- Request ke service menghasilkan log JSON.
- Log request berisi field observability minimal: `timestamp`, `level`, `service`, `logger`, `message`, `correlation_id`, `method`, `path`, `status_code`, dan `duration_ms`.
- Request ke `/health` dan `/metrics` tidak memenuhi log request utama jika middleware memang mengecualikan endpoint tersebut.

### Cara Reproduce

Kirim request publik:

```bash
curl -i http://localhost/api/public/blood-stock
```

Lihat log service:

```bash
docker compose logs item-service --tail=50
```

Contoh filter log JSON di PowerShell:

```powershell
docker compose logs item-service --tail=50 | Select-String '"correlation_id"'
```

### Hasil QA

| Tanggal | PIC | Status | Catatan |
|---------|-----|--------|---------|
| 2026-06-12 | Lead QA & Docs | PASS | Request `GET /api/public/blood-stock` menghasilkan structured JSON log di `item-service` dengan field `correlation_id`, `method`, `path`, `status_code`, dan `duration_ms` |

## OT-02 - Gateway Menghasilkan Correlation ID

### Expected Behavior

- Jika client tidak mengirim `X-Correlation-ID`, gateway membuat correlation ID dari `$request_id`.
- Response dari gateway tetap berisi header `X-Correlation-ID`.

### Cara Reproduce

```bash
curl -i http://localhost/api/public/blood-stock
```

Cari header berikut pada response:

```text
X-Correlation-ID: <generated-id>
```

### Hasil QA

| Tanggal | PIC | Status | Catatan |
|---------|-----|--------|---------|
| 2026-06-12 | Lead QA & Docs | PASS | Response tanpa header manual mengembalikan `X-Correlation-ID: d2fc49de885561e3c6108847341e71a8` |

## OT-03 - Trace Request Dengan Correlation ID Manual

### Expected Behavior

- Jika client mengirim `X-Correlation-ID`, gateway meneruskan nilai yang sama ke service.
- Log service dapat difilter memakai correlation ID tersebut.

### Cara Reproduce

Kirim request dengan correlation ID manual:

```bash
curl -i http://localhost/api/public/blood-stock \
  -H "X-Correlation-ID: qa-modul-14-trace-001"
```

Trace di log:

```bash
docker compose logs auth-service item-service 2>&1 | grep "qa-modul-14-trace-001"
```

PowerShell:

```powershell
docker compose logs auth-service item-service 2>&1 | Select-String "qa-modul-14-trace-001"
```

### Hasil QA

| Tanggal | PIC | Status | Catatan |
|---------|-----|--------|---------|
| 2026-06-12 | Lead QA & Docs | PASS | Header manual `qa-modul-14-trace-001` dipertahankan di response dan ditemukan 1 log structured JSON pada `item-service` |

## OT-04 - Metrics Endpoint

### Expected Behavior

- Auth Service metrics dapat diakses dari `http://localhost/auth/metrics`.
- Donor Service metrics dapat diakses dari `http://localhost/donor/metrics`.
- Response metrics menyertakan service name, total request, total error, latency, dan statistik `last_minute`.
- `last_minute` menyertakan `error_rate_percent` dan `alert_threshold_percent`.

### Cara Reproduce

```bash
curl -s http://localhost/auth/metrics | python -m json.tool
curl -s http://localhost/donor/metrics | python -m json.tool
```

PowerShell:

```powershell
Invoke-WebRequest -Uri "http://localhost/auth/metrics" -UseBasicParsing | Select-Object -ExpandProperty Content
Invoke-WebRequest -Uri "http://localhost/donor/metrics" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Hasil QA

| Tanggal | PIC | Status | Catatan |
|---------|-----|--------|---------|
| 2026-06-12 | Lead QA & Docs | PASS | `auth-service` dan `item-service` metrics return JSON dengan `total_requests`, `total_errors`, `latency`, `last_minute.error_rate_percent`, dan `last_minute.alert_threshold_percent` |

## OT-05 - Error-Rate Alerting

### Expected Behavior

- Error rate `> 10%` pada sliding window 1 menit memicu log `CRITICAL`.
- Error rate tepat `10%` tidak memicu alert karena threshold adalah lebih besar dari 10%.
- Alert tidak dipicu jika jumlah request masih kurang dari minimum request.
- Cooldown mencegah alert spam.
- Alert bisa muncul lagi setelah cooldown selesai.

### Cara Reproduce Otomatis

Auth Service:

```bash
cd services/auth-service
python -m pytest tests/test_metrics_alerting.py -q
```

Donor Service:

```bash
cd services/item-service
python -m pytest tests/test_metrics_alerting.py -q
```

### Hasil QA

| Tanggal | PIC | Status | Catatan |
|---------|-----|--------|---------|
| 2026-06-12 | Lead QA & Docs | PASS | Auth Service `12 passed`; Donor/Item Service `12 passed`; dijalankan via disposable Python container karena image runtime tidak memasang `pytest` |

## OT-06 - Helper Script Observability

### Expected Behavior

- `all` menampilkan log service terkait.
- `errors` memfilter log dengan level error.
- `trace` mencari log berdasarkan correlation ID.
- `metrics` mengambil metrics Auth Service dan Donor Service.

### Cara Reproduce di PowerShell

```powershell
.\scripts\logs.ps1 all
.\scripts\logs.ps1 errors
.\scripts\logs.ps1 trace qa-modul-14-trace-001
.\scripts\logs.ps1 metrics
```

### Cara Reproduce di Bash

```bash
./scripts/logs.sh all
./scripts/logs.sh errors
./scripts/logs.sh trace qa-modul-14-trace-001
./scripts/logs.sh metrics
```

### Hasil QA

| Tanggal | PIC | Status | Catatan |
|---------|-----|--------|---------|
| 2026-06-12 | Lead QA & Docs | PASS di Git Bash | `all` menampilkan stream log, `errors` menampilkan log `CRITICAL`, `trace` menemukan correlation ID, dan `metrics` menampilkan JSON metrics Auth serta Item Service |

## Checklist QA Modul 14

- [x] Service berhasil dijalankan dengan `docker compose up --build -d`.
- [x] `docker compose ps` menunjukkan service utama berjalan.
- [x] Gateway `/health` return `200 OK`.
- [x] Request aplikasi menghasilkan structured log JSON.
- [x] Log request memiliki `correlation_id`.
- [x] Gateway membuat `X-Correlation-ID` saat client tidak mengirim header tersebut.
- [x] Gateway meneruskan `X-Correlation-ID` manual dari client.
- [x] Log bisa difilter berdasarkan correlation ID.
- [x] `http://localhost/auth/metrics` dapat diakses.
- [x] `http://localhost/donor/metrics` dapat diakses.
- [x] Metrics menyertakan statistik `last_minute`.
- [x] Unit test alerting Auth Service berhasil dijalankan.
- [x] Unit test alerting Donor Service berhasil dijalankan.
- [ ] Helper script PowerShell dapat menjalankan mode `all`, `errors`, `trace`, dan `metrics`.
- [x] Helper script Bash dapat menjalankan mode `all`, `errors`, `trace`, dan `metrics`.

## Risiko dan Catatan QA

| Risiko | Dampak | Mitigasi QA |
|--------|--------|-------------|
| Docker belum berjalan di mesin tester | Pengujian manual gagal sebelum service start | Jalankan `docker compose ps` dan cek Docker Desktop terlebih dahulu |
| Dependency pytest belum terpasang di image runtime service | Unit test alerting tidak bisa dijalankan langsung dengan `docker compose exec ... python -m pytest` | Jalankan test di disposable Python container atau tambahkan dependency test pada image khusus testing |
| `requests` belum tercantum di `backend/requirements.txt` | Full backend test gagal collection pada `backend/test_pagination.py` jika menjalankan seluruh `/app` | Tambahkan `requests` ke requirements test/backend jika file tersebut tetap menjadi bagian suite |
| Endpoint gateway berubah | Helper script dan command dokumentasi tidak valid | Cocokkan ulang dengan `services/gateway/nginx.conf` sebelum rilis |
| Log terlalu banyak | Trace manual sulit dibaca | Gunakan correlation ID unik seperti `qa-modul-14-trace-001` |

## Kesimpulan QA

Modul 14 observability sudah lolos QA lokal berbasis Git Bash untuk structured logging, correlation ID, metrics endpoint, error-rate alerting, integration gateway, dan helper script Bash. PowerShell helper belum dieksekusi pada sesi ini karena permintaan testing difokuskan memakai Git Bash.
