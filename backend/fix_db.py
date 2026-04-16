#!/usr/bin/env python3
"""
Script to fix database schema - add missing id_pengguna column to riwayat_donor table.
Run once then can be deleted.
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, inspect

# Load environment
load_dotenv(".env")
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in .env")
    exit(1)

engine = create_engine(DATABASE_URL)

print("🔧 Checking riwayat_donor table schema...")

with engine.begin() as connection:
    # Check if column exists
    inspector = inspect(connection)
    
    if "riwayat_donor" not in inspector.get_table_names():
        print("❌ riwayat_donor table not found")
        exit(1)
    
    columns = {col["name"]: col for col in inspector.get_columns("riwayat_donor")}
    
    if "id_pengguna" in columns:
        print("✅ id_pengguna column already exists")
        exit(0)
    
    # Add the missing column
    try:
        connection.execute(text("""
            ALTER TABLE riwayat_donor 
            ADD COLUMN id_pengguna INTEGER REFERENCES pengguna(id_pengguna)
        """))
        print("✅ Successfully added id_pengguna column to riwayat_donor")
    except Exception as e:
        print(f"❌ Error: {e}")
        exit(1)
