#!/usr/bin/env python
"""Test apakah backend bisa connect ke PostgreSQL database."""

from database import SessionLocal
from models import Item

print("=" * 60)
print("Testing Backend Database Connection")
print("=" * 60)

try:
    # Test 1: Connect
    db = SessionLocal()
    print("\n✓ Successfully connected to PostgreSQL!")
    
    # Test 2: Query items
    items = db.query(Item).all()
    print(f"✓ Found {len(items)} items in database")
    
    if items:
        print("\nItems in database:")
        for item in items:
            print(f"  - {item.id}: {item.name} (Rp {item.price:,})")
    else:
        print("⚠ WARNING: Database is EMPTY!")
    
    db.close()
    
except Exception as e:
    print(f"\n✗ Connection FAILED!")
    print(f"Error Type: {type(e).__name__}")
    print(f"Error Message: {str(e)}")
    print("\nPossible causes:")
    print("  - PostgreSQL is not running")
    print("  - Wrong username/password in .env")
    print("  - Database 'miracle' doesn't exist")
    print("  - psycopg2 driver not installed")
