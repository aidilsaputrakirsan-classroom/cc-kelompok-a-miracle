#!/usr/bin/env python
"""Test apakah backend bisa connect ke PostgreSQL database."""

from sqlalchemy import text
from database import SessionLocal
from models import Admin, Pengguna, Pendonor, RiwayatDonor

print("=" * 60)
print("Testing Backend Database Connection")
print("=" * 60)

try:
    # Test 1: Connect
    db = SessionLocal()
    print("\n✓ Successfully connected to PostgreSQL!")

    # Test 2: Basic query
    db.execute(text("SELECT 1"))
    print("✓ SQL query test passed")

    # Test 3: Count existing app tables
    total_admin = db.query(Admin).count()
    total_pengguna = db.query(Pengguna).count()
    total_pendonor = db.query(Pendonor).count()
    total_riwayat = db.query(RiwayatDonor).count()

    print("\nData summary:")
    print(f"  - Admin: {total_admin}")
    print(f"  - Pengguna: {total_pengguna}")
    print(f"  - Pendonor: {total_pendonor}")
    print(f"  - Riwayat donor: {total_riwayat}")
    
    db.close()
    
except Exception as e:
    print(f"\n✗ Connection FAILED!")
    print(f"Error Type: {type(e).__name__}")
    print(f"Error Message: {str(e)}")
    print("\nPossible causes:")
    print("  - PostgreSQL is not running")
    print("  - Wrong username/password in .env")
    print("  - Database in DATABASE_URL doesn't exist")
    print("  - psycopg2 driver not installed")
