"""
Data Migration Script
Migrasi data dari monolith (1 database) ke microservices (2 database).

Usage:
    python scripts/migrate_data.py

Prerequisite:
    - Monolith database accessible
    - auth_db dan item_db sudah running (via Docker Compose)
"""
import os
import sys
from sqlalchemy import create_engine, text

# Database URLs
MONOLITH_DB_URL = os.getenv(
    "MONOLITH_DB_URL",
    "postgresql://postgres:postgres@localhost:5432/cloudapp"
)
AUTH_DB_URL = os.getenv(
    "AUTH_DB_URL",
    "postgresql://postgres:postgres@localhost:5433/auth_db"
)
ITEM_DB_URL = os.getenv(
    "ITEM_DB_URL",
    "postgresql://postgres:postgres@localhost:5434/item_db"
)


def migrate():
    print("=" * 50)
    print("DATA MIGRATION: Monolith → Microservices")
    print("=" * 50)

    monolith = create_engine(MONOLITH_DB_URL)
    auth_db = create_engine(AUTH_DB_URL)
    item_db = create_engine(ITEM_DB_URL)

    # Step 1: Migrate pengguna -> auth_db.users
    print("\n[1/2] Migrating pengguna → auth_db.users...")
    with monolith.connect() as src:
        users = src.execute(
            text(
                """
                SELECT id_pengguna, email, nama_pengguna, password, created_at
                FROM pengguna
                """
            )
        ).fetchall()
        print(f"     Found {len(users)} pengguna in monolith")

    with auth_db.connect() as dst:
        for user in users:
            dst.execute(
                text("""
                    INSERT INTO users (id, email, name, hashed_password, created_at)
                    VALUES (:id, :email, :name, :hashed_password, :created_at)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    "id": user.id_pengguna,
                    "email": user.email,
                    "name": user.nama_pengguna,
                    "hashed_password": user.password,
                    "created_at": user.created_at,
                }
            )
        dst.commit()
    print(f"     ✅ Migrated {len(users)} users")

    # Step 2: Migrate pendonor -> item_db.items
    print("\n[2/2] Migrating pendonor → item_db.items...")
    with monolith.connect() as src:
        items = src.execute(
            text(
                """
                WITH pendonor_owner AS (
                    SELECT
                        p.id_pendonor AS id,
                        p.nama_lengkap AS name,
                        COALESCE(p.riwayat_kesehatan, '') AS description,
                        COALESCE(p.total_donor, 0) AS total_donor,
                        MIN(r.id_pengguna) AS owner_id,
                        p.created_at AS created_at
                    FROM pendonor p
                    LEFT JOIN riwayat_donor r
                        ON r.id_pendonor = p.id_pendonor
                        AND r.id_pengguna IS NOT NULL
                    GROUP BY p.id_pendonor, p.nama_lengkap, p.riwayat_kesehatan, p.total_donor, p.created_at
                )
                SELECT * FROM pendonor_owner WHERE owner_id IS NOT NULL
                """
            )
        ).fetchall()
        print(f"     Found {len(items)} pendonor linked to pengguna")

    with item_db.connect() as dst:
        for item in items:
            dst.execute(
                text("""
                    INSERT INTO items (id, name, description, total_donor,
                                       owner_id, created_at)
                    VALUES (:id, :name, :description, :total_donor,
                            :owner_id, :created_at)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    "id": item.id,
                    "name": item.name,
                    "description": item.description,
                    "total_donor": item.total_donor,
                    "owner_id": item.owner_id,
                    "created_at": item.created_at,
                }
            )
        dst.commit()
    print(f"     ✅ Migrated {len(items)} items")

    print("\n" + "=" * 50)
    print("MIGRATION COMPLETE!")
    print("=" * 50)


if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        print("Pastikan semua database accessible dan tabel sudah dibuat.")
        sys.exit(1)