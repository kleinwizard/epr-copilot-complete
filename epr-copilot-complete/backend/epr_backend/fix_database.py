#!/usr/bin/env python3
"""Fix missing database columns"""

import sqlite3
from pathlib import Path

def fix_database():
    db_path = Path("epr_copilot.db")
    if not db_path.exists():
        print("❌ Database not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("PRAGMA table_info(products)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'category' not in columns:
            print("✅ Adding category column to products table...")
            cursor.execute("ALTER TABLE products ADD COLUMN category VARCHAR(255)")
            cursor.execute("UPDATE products SET category = 'General' WHERE category IS NULL")
            conn.commit()
            print("✅ Category column added successfully!")
        else:
            print("ℹ️ Category column already exists")
        
        cursor.execute("PRAGMA table_info(products)")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"📋 Products table columns: {columns}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_database()
