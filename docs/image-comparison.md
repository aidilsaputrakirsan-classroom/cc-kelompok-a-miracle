# Perbandingan Ukuran Docker Image Python

Tanggal uji: 2026-03-30 15:52:44
Platform: linux/amd64

| Image | Ukuran |
|---|---|
| python:3.12 | 391.58 MB |
| python:3.12-slim | 41.2 MB |
| python:3.12-alpine | 17.25 MB |

### Penjelasan
1. python:3.12 paling besar
Isinya paling lengkap: base Debian lebih full, library sistem lebih banyak, utilitas tambahan lebih banyak.

2. python:3.12-slim lebih kecil
Masih Debian, tapi paket non-esensial dipangkas. Cocok untuk production yang butuh kompatibilitas baik dengan banyak package Python.

3. python:3.12-alpine paling kecil
Pakai Alpine Linux (sangat minimal, pakai musl + busybox), jadi ukuran kecil sekali.

Kenapa bisa beda jauh sampai ratusan MB:

1. Jumlah library OS bawaan berbeda.
2. Tool bawaan berbeda (shell, package manager, utilitas).
4. Layer image Docker tiap tag memang berbeda isi.