# Stage 1: Builder
# Python 3.12 di Alpine Linux, namai stage ini "builder".
FROM python:3.12-alpine AS builder

#Masuk ke folder /app di dalam container
WORKDIR /app

# Install dependencies build (khusus alpine)
RUN apk add --no-cache build-base

# Copy file requirements.txt ke /app
COPY requirements.txt .

# Bikin virtual environment Python di /opt/venv.
# Supaya Python & pip dari venv yang dipakai.
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

#Install semua library Python yang dibutuhkan.
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Production

#Mulai lagi dari Python 3.12 Alpine
FROM python:3.12-alpine

#Masuk ke folder /app
WORKDIR /app

# Install curl untuk healthcheck dan postgresql-client untuk pg_isready
RUN apk add --no-cache curl postgresql-client

# Copy venv
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy code
COPY . .

# Fix Windows line endings (CRLF -> LF) dan pastikan executable
RUN sed -i 's/\r$//' /app/scripts/wait-for-db.sh && chmod +x /app/scripts/wait-for-db.sh

# Non-root user
RUN adduser -D appuser && chown -R appuser /app
USER appuser

#Buka port 8000 (biar backend bisa diakses dari luar).
EXPOSE 8000

#Cek otomatis: backend sehat/tidak dengan akses /health.
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

#Tunggu DB siap dan alankan backend pakai uvicorn di port 8000
CMD ["sh", "-c", "/app/scripts/wait-for-db.sh && exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]