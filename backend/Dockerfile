# Stage: Production Image

# 1. Base image — Python 3.12 slim (debian minimal, ~50MB)
FROM python:3.12-slim

# 1.5. Install curl untuk healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# 2. Set working directory di dalam container
WORKDIR /app

# 3. Copy HANYA requirements.txt dulu (cache optimization)
#    Layer ini hanya rebuild jika requirements.txt berubah
COPY requirements.txt .

# 4. Install Python dependencies
#    --no-cache-dir: jangan simpan pip cache (hemat space)
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy seluruh kode aplikasi
#    Layer ini rebuild setiap kali kode berubah
COPY . .

# 6. Buat non-root user
RUN useradd -m appuser
USER appuser

# 7. Dokumentasikan port yang digunakan
EXPOSE 8000

# 8. Healthcheck untuk monitoring container status
#    --interval: check setiap 30 detik
#    --timeout: timeout untuk perintah curl (10 detik)
#    --start-period: tunggu 5 detik sebelum mulai check (app startup time)
#    --retries: restart container jika 3 kali gagal
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 9. Command untuk menjalankan aplikasi
#    --host 0.0.0.0: agar bisa diakses dari luar container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]