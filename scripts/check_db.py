"""Quick database inspector for LandGuard AI."""
import sqlite3
import os

# Check both possible database locations
paths = [
    r"D:\LandGuard AI\landguard_ai.db",
    r"D:\LandGuard AI\backend\landguard_ai.db",
]

for db_path in paths:
    if not os.path.exists(db_path):
        print(f"NOT FOUND: {db_path}")
        continue

    size = os.path.getsize(db_path)
    print(f"\n{'='*60}")
    print(f"DATABASE: {db_path}")
    print(f"SIZE: {size:,} bytes ({size/1024:.1f} KB)")
    print(f"{'='*60}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # List all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"\nTABLES ({len(tables)}):")
    for t in tables:
        cursor.execute(f"SELECT COUNT(*) FROM [{t}]")
        count = cursor.fetchone()[0]
        print(f"  {t:<30} {count:>5} rows")

    # Show sample data from key tables
    print(f"\n--- USERS ---")
    try:
        cursor.execute("SELECT id, username, email, is_active FROM users")
        for row in cursor.fetchall():
            print(f"  {row}")
    except Exception as e:
        print(f"  Error: {e}")

    print(f"\n--- PARCELS ---")
    try:
        cursor.execute("SELECT id, parcel_code, district, status FROM parcels")
        for row in cursor.fetchall():
            print(f"  {row}")
    except Exception as e:
        print(f"  Error: {e}")

    print(f"\n--- TRANSACTIONS ---")
    try:
        cursor.execute("SELECT id, transaction_code, status FROM transactions")
        for row in cursor.fetchall():
            print(f"  {row}")
    except Exception as e:
        print(f"  Error: {e}")

    print(f"\n--- CASES ---")
    try:
        cursor.execute("SELECT id, case_code, status FROM case_reviews")
        for row in cursor.fetchall():
            print(f"  {row}")
    except Exception as e:
        print(f"  Error: {e}")

    conn.close()

print(f"\n{'='*60}")
print("DONE")
