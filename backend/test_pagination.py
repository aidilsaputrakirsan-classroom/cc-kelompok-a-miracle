#!/usr/bin/env python
"""Test pagination endpoint GET /items"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

print("=" * 70)
print("Testing Pagination - GET /items?skip=0&limit=2")
print("=" * 70)

try:
    # Test 1: Get 2 items (skip 0, limit 2)
    print("\n▶ TEST 1: skip=0, limit=2")
    response = requests.get(f"{BASE_URL}/items", params={"skip": 0, "limit": 2})
    data = response.json()
    print(f"Status Code: {response.status_code}")
    print(f"Total items: {data.get('total')}")
    print(f"Items returned: {len(data.get('items', []))}")
    if data.get('items'):
        for idx, item in enumerate(data['items'], 1):
            print(f"  {idx}. {item['name']} - Rp {item['price']:,}")
    
    # Test 2: Get next 2 items (skip 2, limit 2)
    print("\n▶ TEST 2: skip=2, limit=2")
    response = requests.get(f"{BASE_URL}/items", params={"skip": 2, "limit": 2})
    data = response.json()
    print(f"Status Code: {response.status_code}")
    print(f"Total items: {data.get('total')}")
    print(f"Items returned: {len(data.get('items', []))}")
    if data.get('items'):
        for idx, item in enumerate(data['items'], 1):
            print(f"  {idx}. {item['name']} - Rp {item['price']:,}")
    
    # Test 3: Get all items (no limit)
    print("\n▶ TEST 3: skip=0, limit=100")
    response = requests.get(f"{BASE_URL}/items", params={"skip": 0, "limit": 100})
    data = response.json()
    print(f"Status Code: {response.status_code}")
    print(f"Total items: {data.get('total')}")
    print(f"Items returned: {len(data.get('items', []))}")
    
    print("\n" + "=" * 70)
    print("✓ Pagination Test Complete!")
    print("=" * 70)
    
except Exception as e:
    print(f"\n✗ Error during test:")
    print(f"  {type(e).__name__}: {str(e)}")
    print("\nMake sure backend is running at http://127.0.0.1:8000")
