# Reliability Testing - TraceIt Microservices

Dokumen ini adalah panduan QA untuk Modul 13. Fokus pengujian adalah memastikan komunikasi Item Service ke Auth Service tetap aman saat terjadi service down, timeout, dan recovery.

## Tujuan

Reliability testing memastikan sistem memenuhi perilaku berikut:

- Item Service melakukan retry saat Auth Service gagal sementara.
- Retry berhenti setelah batas maksimal agar request tidak menggantung terlalu lama.
- Circuit breaker masuk state `OPEN` setelah beberapa kegagalan beruntun.
- Saat circuit breaker `OPEN`, request gagal cepat dengan `503` tanpa terus memanggil Auth Service.
- Saat Auth Service kembali normal dan cooldown selesai, sistem bisa recovery.
- Health check Item Service menampilkan status `healthy` atau `degraded` sesuai kondisi dependency.

## Komponen yang Diuji

| Komponen | File | Perilaku yang Diverifikasi |
|----------|------|----------------------------|
| Auth client | `services/item-service/auth_client.py` | Retry, timeout, error handling, pemanggilan `/verify` |
| Circuit breaker | `services/item-service/circuit_breaker.py` | State `CLOSED`, `OPEN`, `HALF_OPEN`, failure threshold, cooldown |
| Item health check | `services/item-service/main.py` | Status dependency Auth Service di response `/health` |
| Gateway | `services/gateway/nginx.conf` | Routing `/auth/*`, `/pendonor*`, `/pengguna*`, `/riwayat-donor*`, dan `/api/public*` ke service yang benar |
| Docker Compose | `docker-compose.yml` | Service start, stop, healthcheck, dan recovery container |

## Ringkasan Pengumpulan Lead QA & Docs

| Kebutuhan Modul 13 | Bukti di Dokumen Ini | Status |
|--------------------|----------------------|--------|
| Skenario service down | RT-02, RT-03, RT-04, RT-07 | Siap diuji |
| Skenario timeout | RT-08 | Siap diuji |
| Skenario recovery | RT-05 | Siap diuji |
| Expected behavior | Tabel expected behavior pada setiap skenario | Lengkap |
| Cara reproduce | Command Docker dan curl pada setiap skenario | Lengkap |
| Hasil test | Tabel hasil test pada setiap skenario | Perlu diisi setelah test manual |
| Diagram arsitektur terbaru | `docs/architecture.md` bagian Reliability Layer Modul 13 | Sudah ditambahkan |

## Konfigurasi Reliability Saat Ini

| Setting | Nilai | Lokasi |
|---------|-------|--------|
| Auth Service URL | `http://auth-service:8001` | `AUTH_SERVICE_URL` di Item Service |
| Max retry | 3 attempt | `MAX_RETRIES` |
| Base delay | 0.5 detik | `BASE_DELAY` |
| Backoff delay | 0.5s, 1s, 2s | `BASE_DELAY * 2 ** (attempt - 1)` |
| Timeout per request | 5 detik | `TIMEOUT_SECONDS` |
| Retryable status | 500, 502, 503, 504 | `RETRYABLE_STATUS_CODES` |
| Circuit threshold | 5 failure | `failure_threshold` |
| Circuit cooldown | 30 detik | `cooldown_seconds` |

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

Buat user test jika belum ada:

```bash
curl -X POST http://localhost/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"qa13@example.com","password":"Pass123","name":"QA Modul 13"}'
```

Login dan simpan token secara manual dari response:

```bash
curl -X POST http://localhost/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"qa13@example.com","password":"Pass123"}'
```

Gunakan token tersebut pada command berikut dengan mengganti `TOKEN_DARI_LOGIN`.

## Skenario Test

### RT-01 Normal Flow: Auth Service Up

Tujuan: memastikan baseline normal berjalan sebelum failure test.

Langkah:

```bash
curl http://localhost/pengguna/me \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN"
```

Expected behavior:

| Aspek | Expected |
|-------|----------|
| HTTP status | `200 OK` |
| Item Service | Memanggil Auth Service `/verify` melalui request terautentikasi |
| Circuit breaker | Tetap `CLOSED` |
| User impact | Data item tampil normal |

Hasil test:

| Tanggal | Tester | Status | Catatan |
|---------|--------|--------|---------|
| 2026-06-10 | Lead QA & Docs | PASS | `/pengguna/me` return `200 OK`; `/donor/health` return `healthy`, circuit breaker `CLOSED` |

### RT-02 Service Down: Auth Service Dihentikan

Tujuan: memastikan Item Service tidak crash saat Auth Service down.

Langkah:

```bash
docker compose stop auth-service
```

```bash
curl -i http://localhost/pengguna/me \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN"
```

Cek log retry:

```bash
docker compose logs item-service --tail=60
```

Expected behavior:

| Aspek | Expected |
|-------|----------|
| HTTP status | `503 Service Unavailable` |
| Retry | Ada maksimal 3 attempt ke Auth Service |
| Delay | Backoff sekitar 0.5s, 1s, 2s |
| Log | Muncul pesan koneksi gagal atau timeout per attempt |
| User impact | Request gagal terkontrol, service tidak crash |

Hasil test:

| Tanggal | Tester | Status | Catatan |
|---------|--------|--------|---------|
| 2026-06-10 | Lead QA & Docs | PASS | Auth Service stopped; `/pengguna/me` return `503`; log menunjukkan 3 attempt retry dengan timeout/connection error; `time_total` sekitar 15.64s |

### RT-03 Circuit Breaker Opens Setelah Failure Threshold

Tujuan: memastikan circuit breaker membuka setelah kegagalan berulang dan request berikutnya fail fast.

Prasyarat: Auth Service masih stopped dari RT-02.

Langkah:

```bash
for i in 1 2 3 4 5 6; do
  echo "Request $i"
  curl -s -o /dev/null -w "%{http_code} %{time_total}\n" http://localhost/pengguna/me \
    -H "Authorization: Bearer TOKEN_DARI_LOGIN"
done
```

Cek health Item Service melalui gateway:

```bash
curl -s http://localhost/donor/health
```

Jika route gateway bermasalah, cek langsung dari container network:

```bash
docker compose exec item-service curl -s http://localhost:8002/health
```

Expected behavior:

| Aspek | Expected |
|-------|----------|
| Failure count | Mencapai threshold `5` |
| Circuit state | `OPEN` |
| HTTP status | `503 Service Unavailable` |
| Time total setelah open | Lebih cepat dari request yang menunggu retry penuh |
| Health status | `degraded` saat circuit tidak `CLOSED` |

Hasil test:

| Tanggal | Tester | Status | Catatan |
|---------|--------|--------|---------|
| 2026-06-10 | Lead QA & Docs | PASS | Request awal masih menunggu retry sekitar 14-15s; request ke-5 dan seterusnya fail fast sekitar 0.006-0.009s; health menunjukkan circuit `OPEN` |

### RT-04 Fast Fail Saat Circuit Breaker OPEN

Tujuan: memastikan Item Service tidak terus menunggu timeout saat dependency sudah diketahui down.

Langkah:

```bash
curl -s -o /dev/null -w "status=%{http_code} time=%{time_total}\n" http://localhost/pengguna/me \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN"
```

Expected behavior:

| Aspek | Expected |
|-------|----------|
| HTTP status | `503 Service Unavailable` |
| Response time | Jauh lebih cepat daripada timeout 5 detik |
| Auth Service call | Tidak dipanggil selama circuit masih `OPEN` |
| Error message | Menjelaskan circuit breaker `OPEN` atau Auth Service unavailable |

Hasil test:

| Tanggal | Tester | Status | Catatan |
|---------|--------|--------|---------|
| 2026-06-10 | Lead QA & Docs | PASS | Saat circuit breaker `OPEN`, request return `503` sekitar 0.007s tanpa menunggu retry penuh |

### RT-05 Recovery Setelah Auth Service Kembali Up

Tujuan: memastikan sistem bisa pulih setelah dependency kembali tersedia.

Langkah:

```bash
docker compose start auth-service
```

Tunggu cooldown circuit breaker:

```bash
timeout /t 35
```

Jika menggunakan shell non-Windows, gunakan:

```bash
sleep 35
```

Uji request lagi:

```bash
curl -i http://localhost/pengguna/me \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN"
```

Expected behavior:

| Aspek | Expected |
|-------|----------|
| Auth Service | Running kembali |
| Circuit state | `HALF_OPEN` lalu `CLOSED` setelah request berhasil |
| HTTP status | `200 OK` jika token masih valid |
| User impact | Fitur item kembali normal |

Hasil test:

| Tanggal | Tester | Status | Catatan |
|---------|--------|--------|---------|
| 2026-06-10 | Lead QA & Docs | PASS | Auth Service started kembali, menunggu cooldown 35s, login ulang, `/pengguna/me` return `200 OK`; health kembali `healthy` dan circuit `CLOSED` |

### RT-06 Invalid Token Tidak Di-retry

Tujuan: memastikan error deterministic seperti token salah tidak menyebabkan retry.

Langkah:

```bash
curl -i http://localhost/pengguna/me \
  -H "Authorization: Bearer invalid-token"
```

Cek log Item Service:

```bash
docker compose logs item-service --tail=40
```

Expected behavior:

| Aspek | Expected |
|-------|----------|
| HTTP status | `401 Unauthorized` |
| Retry | Tidak melakukan retry untuk token invalid |
| Circuit breaker | Tidak dihitung sebagai dependency failure |
| User impact | User diminta login ulang |

Hasil test:

| Tanggal | Tester | Status | Catatan |
|---------|--------|--------|---------|
| 2026-06-10 | Lead QA & Docs | PASS | Token invalid return `401 Unauthorized` sekitar 18ms; tidak muncul rangkaian retry baru di log |

### RT-07 Health Check Degraded

Tujuan: memastikan health endpoint memberi sinyal dependency bermasalah.

Langkah:

```bash
docker compose stop auth-service
```

Trigger beberapa request gagal:

```bash
for i in 1 2 3 4 5; do
  curl -s http://localhost/pengguna/me \
    -H "Authorization: Bearer TOKEN_DARI_LOGIN" > /dev/null
done
```

Cek health Item Service melalui gateway:

```bash
curl -s http://localhost/donor/health
```

Jika route gateway bermasalah, cek langsung dari container:

```bash
docker compose exec item-service curl -s http://localhost:8002/health
```

Expected behavior:

| Aspek | Expected |
|-------|----------|
| Overall status | `degraded` saat circuit breaker bukan `CLOSED` |
| Dependency object | Ada status circuit breaker Auth Service |
| Service | Item Service tetap hidup |

Hasil test:

| Tanggal | Tester | Status | Catatan |
|---------|--------|--------|---------|
| 2026-06-10 | Lead QA & Docs | PASS | Setelah Auth Service stopped dan 5 request gagal, `/donor/health` return `status: degraded`, dependency auth `unavailable`, circuit breaker `OPEN` |

### RT-08 Timeout Saat Auth Service Lambat

Tujuan: memastikan Item Service tidak menunggu terlalu lama saat Auth Service lambat merespons.

Prasyarat: semua service running dan token valid tersedia.

Cara reproduce yang disarankan untuk lingkungan lokal adalah menambahkan delay sementara pada endpoint `/verify` Auth Service, lalu rebuild container. Jika tidak ingin mengubah kode, skenario ini dapat divalidasi melalui log saat Auth Service sulit diakses atau saat network container bermasalah.

Langkah observasi timeout:

```bash
docker compose logs item-service --tail=80
```

Trigger request yang membutuhkan verifikasi Auth Service:

```bash
curl -s -o /dev/null -w "status=%{http_code} time=%{time_total}\n" http://localhost/pengguna/me \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN"
```

Expected behavior:

| Aspek | Expected |
|-------|----------|
| Timeout per attempt | Maksimal sekitar 5 detik per request ke Auth Service |
| Retry | Retry hanya untuk timeout atau error transient |
| HTTP status akhir | `503 Service Unavailable` jika Auth Service tetap tidak merespons |
| Log | Ada catatan timeout atau request error dari Auth client |
| User impact | Request gagal terkontrol, bukan menggantung tanpa batas |

Hasil test:

| Tanggal | Tester | Status | Catatan |
|---------|--------|--------|---------|
| 2026-06-10 | Lead QA & Docs | PASS | Auth Service di-pause; `/pengguna/me` return `503`; log menunjukkan `Auth Service timeout (attempt 1/3)`, `attempt 2/3`, `attempt 3/3`; `time_total` sekitar 16.66s |

## Hasil Akhir Setelah Testing

Setelah seluruh skenario selesai, environment dikembalikan ke kondisi normal:

```bash
docker compose restart auth-service item-service
curl http://localhost/donor/health
```

Hasil akhir:

| Komponen | Status Akhir |
|----------|--------------|
| `auth-db` | Healthy |
| `auth-service` | Healthy |
| `item-db` | Healthy |
| `item-service` | Healthy |
| `frontend` | Healthy |
| `gateway` | Healthy |
| `/donor/health` | `healthy`, circuit breaker `CLOSED`, `failure_count: 0` |

## Integration Test Recommendation

Modul 13 meminta minimal 5 integration test yang melibatkan lebih dari satu service. Jika tim menambahkan folder `tests/integration/`, prioritas test QA adalah:

| Test | Tujuan | Expected |
|------|--------|----------|
| Gateway health | Gateway bisa diakses | `GET /health` return `200` |
| Register-login flow | Auth Service berjalan melalui gateway | Register `201`, login `200` + token |
| Authenticated user check | Item Service memverifikasi token ke Auth Service | `GET /pengguna/me` return `200` |
| Unauthorized without token | Endpoint item menolak request tanpa auth | `401` atau `422` |
| Invalid token rejected | Token invalid ditolak | `401` |
| Auth down behavior | Item Service gagal terkontrol | `503`, tidak crash |
| Recovery behavior | Service pulih setelah Auth up | Request kembali `200` |

Command yang disarankan setelah test tersedia:

```bash
docker compose up -d --build
pip install httpx pytest
pytest tests/integration/ -v
```

## Checklist QA Modul 13

- [ ] Baseline normal flow berhasil sebelum failure test.
- [ ] Retry terjadi maksimal 3 kali saat Auth Service down.
- [ ] Backoff retry terlihat di log Item Service.
- [ ] Timeout request ke Auth Service terbatasi dan tidak menggantung tanpa batas.
- [ ] Circuit breaker berubah dari `CLOSED` ke `OPEN` setelah threshold failure.
- [ ] Request saat circuit `OPEN` fail fast dengan `503`.
- [ ] Health check Item Service menampilkan status `degraded` saat dependency bermasalah.
- [ ] Sistem recovery setelah Auth Service start kembali dan cooldown selesai.
- [ ] Invalid token menghasilkan `401` dan tidak memicu retry dependency failure.
- [ ] Hasil test dicatat di tabel skenario masing-masing sebelum PR dikumpulkan.

## Catatan Risiko

| Risiko | Dampak | Mitigasi QA |
|--------|--------|-------------|
| Token expired saat recovery test | Request tetap gagal walau service sudah pulih | Login ulang sebelum validasi recovery |
| Gateway belum route `/donor/health` | Health check via gateway gagal | Gunakan `docker compose exec item-service curl http://localhost:8002/health` |
| Port 80 bentrok di host | Gateway tidak start | Cek aplikasi lain yang memakai port 80 |
| Circuit breaker state tersimpan di proses Item Service | Test sebelumnya memengaruhi test berikutnya | Restart `item-service` sebelum baseline ulang |
| Data test bercampur | Hasil stats tidak konsisten | Gunakan user/email test unik per sesi |

## Reset Setelah Testing

Nyalakan kembali service yang sempat dihentikan:

```bash
docker compose start auth-service
```

Restart Item Service untuk reset circuit breaker state:

```bash
docker compose restart item-service
```

Jika ingin membersihkan semua container dan volume lokal:

```bash
docker compose down -v
```
