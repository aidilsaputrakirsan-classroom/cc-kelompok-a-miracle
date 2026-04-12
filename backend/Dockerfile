# ============================================================
# Stage 1: Builder
# ============================================================
FROM python:3.12-alpine AS builder

WORKDIR /app

# Install dependencies build (khusus alpine)
RUN apk add --no-cache build-base

COPY requirements.txt .

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir -r requirements.txt


# ============================================================
# Stage 2: Production
# ============================================================
FROM python:3.12-alpine

WORKDIR /app

# Install curl untuk healthcheck dan postgresql-client untuk pg_isready
RUN apk add --no-cache curl postgresql-client

# Copy venv
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy code
COPY . .

# Pastikan startup script executable
RUN chmod +x /app/scripts/wait-for-db.sh

# Non-root user
RUN adduser -D appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["sh", "-c", "/app/scripts/wait-for-db.sh && exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]