#!/bin/sh
set -eu

# Menunggu PostgreSQL siap menerima koneksi sebelum backend dijalankan.
# Prioritas konfigurasi:
# 1) DB_HOST/DB_PORT/DB_USER/DB_NAME (jika diset)
# 2) Parse dari DATABASE_URL

WAIT_TIMEOUT_SECONDS="${WAIT_TIMEOUT_SECONDS:-60}"
WAIT_INTERVAL_SECONDS="${WAIT_INTERVAL_SECONDS:-2}"

DB_HOST="${DB_HOST:-}"
DB_PORT="${DB_PORT:-}"
DB_USER="${DB_USER:-}"
DB_NAME="${DB_NAME:-}"

if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "[wait-for-db] ERROR: DATABASE_URL tidak ditemukan dan DB_* belum lengkap." >&2
    exit 1
  fi

  PARSED_VALUES="$(python - <<'PY'
import os
from urllib.parse import urlparse

url = os.environ.get('DATABASE_URL', '')
parsed = urlparse(url)

host = parsed.hostname or ''
port = parsed.port or 5432
user = parsed.username or ''
name = (parsed.path or '/').lstrip('/')

print(host)
print(port)
print(user)
print(name)
PY
)"

  DB_HOST="$(printf '%s\n' "$PARSED_VALUES" | sed -n '1p')"
  DB_PORT="$(printf '%s\n' "$PARSED_VALUES" | sed -n '2p')"
  DB_USER="$(printf '%s\n' "$PARSED_VALUES" | sed -n '3p')"
  DB_NAME="$(printf '%s\n' "$PARSED_VALUES" | sed -n '4p')"
fi

if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
  echo "[wait-for-db] ERROR: Gagal membaca host/port/user/db dari env." >&2
  exit 1
fi

echo "[wait-for-db] Menunggu PostgreSQL di ${DB_HOST}:${DB_PORT} (db=${DB_NAME}, timeout=${WAIT_TIMEOUT_SECONDS}s)..."

elapsed=0
while ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; do
  if [ "$elapsed" -ge "$WAIT_TIMEOUT_SECONDS" ]; then
    echo "[wait-for-db] ERROR: Timeout setelah ${WAIT_TIMEOUT_SECONDS}s. PostgreSQL belum siap." >&2
    exit 1
  fi
  sleep "$WAIT_INTERVAL_SECONDS"
  elapsed=$((elapsed + WAIT_INTERVAL_SECONDS))
  echo "[wait-for-db] masih menunggu... ${elapsed}s"
done

echo "[wait-for-db] PostgreSQL ready."
