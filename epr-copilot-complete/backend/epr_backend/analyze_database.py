#!/usr/bin/env python3
"""
Database schema analysis script to identify missing columns and schema issues
"""

from app.database import get_db
from sqlalchemy import text, inspect
import traceback

def main():
    try:
        db = next(get_db())
        inspector = inspect(db.bind)
        
        print('=== DATABASE SCHEMA ANALYSIS ===')
        
        if 'products' in inspector.get_table_names():
            print('✓ Products table exists')
            columns = inspector.get_columns('products')
            print('Products table columns:')
            for col in columns:
                print(f'  - {col["name"]}: {col["type"]}')
            
            expected_columns = ['category', 'sales_volume']
            existing_columns = [col['name'] for col in columns]
            missing_columns = [col for col in expected_columns if col not in existing_columns]
            
            if missing_columns:
                print(f'❌ Missing columns: {missing_columns}')
            else:
                print('✓ All expected columns present')
        else:
            print('❌ Products table does not exist')
            
        if 'material_categories' in inspector.get_table_names():
            print('✓ Material categories table exists')
            columns = inspector.get_columns('material_categories')
            existing_columns = [col['name'] for col in columns]
            if 'recyclability_percentage' not in existing_columns:
                print('❌ Missing recyclability_percentage column in material_categories')
            else:
                print('✓ Recyclability percentage column exists')
        
        db.close()
        
    except Exception as e:
        print(f'❌ Database connection error: {e}')
        traceback.print_exc()

if __name__ == "__main__":
    main()
