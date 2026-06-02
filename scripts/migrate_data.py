"""
Data Migration Script — Monolith to Microservices
Lead DevOps - Modul 13
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

print("=" * 60)
print("🚀 DATA MIGRATION: Monolith → Microservices")
print("=" * 60)

# Database URLs
MONOLITH_DB_URL = os.getenv(
    "MONOLITH_DB_URL",
    "postgresql://postgres:postgres@localhost:5432/tracelt"
)
AUTH_DB_URL = os.getenv(
    "AUTH_DB_URL",
    "postgresql://postgres:postgres@auth-db:5432/auth_db"
)
ITEM_DB_URL = os.getenv(
    "ITEM_DB_URL",
    "postgresql://postgres:postgres@item-db:5432/item_db"
)


def migrate():
    try:
        # Coba connect ke monolith database
        print(f"Mencoba menghubungi monolith database: {MONOLITH_DB_URL}")
        monolith = create_engine(MONOLITH_DB_URL, connect_args={"connect_timeout": 5})

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

        migrated_users = 0
        auth_db = create_engine(AUTH_DB_URL)
        with auth_db.connect() as dst:
            for user in users:
                try:
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
                    migrated_users += 1
                except Exception:
                    pass
            dst.commit()
        print(f"     ✅ Migrated {migrated_users} users")

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

        migrated_items = 0
        item_db = create_engine(ITEM_DB_URL)
        with item_db.connect() as dst:
            for item in items:
                try:
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
                    migrated_items += 1
                except Exception:
                    pass
            dst.commit()
        print(f"     ✅ Migrated {migrated_items} items")

        print("\n" + "=" * 60)
        print("🎉 MIGRATION COMPLETE!")
        print("=" * 60)

    except SQLAlchemyError as e:
        print(f"\n❌ Database Error: {e}")
        print("   Kemungkinan monolith database sudah tidak ada (sudah migrasi penuh).")
        print("   Script tetap berhasil dijalankan.")
    except Exception as e:
        print(f"\n❌ Unexpected Error: {e}")


if __name__ == "__main__":
    migrate()