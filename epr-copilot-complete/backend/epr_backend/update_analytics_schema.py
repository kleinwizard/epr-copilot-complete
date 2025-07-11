#!/usr/bin/env python3
"""
Update database schema for analytics calculations
"""

from app.database import get_db
from sqlalchemy import text

def main():
    db = next(get_db())
    
    try:
        try:
            db.execute(text('ALTER TABLE material_categories ADD COLUMN recyclability_percentage REAL DEFAULT 0.0'))
            print('Added recyclability_percentage column')
        except Exception as e:
            print(f'Column may already exist: {e}')
        
        try:
            db.execute(text('ALTER TABLE products ADD COLUMN sales_volume REAL DEFAULT 0.0'))
            print('Added sales_volume column')
        except Exception as e:
            print(f'Column may already exist: {e}')
        
        result = db.execute(text('''
            UPDATE material_categories SET recyclability_percentage = 
                CASE 
                    WHEN name LIKE '%PET%' AND name LIKE '%clear%' THEN 95.0
                    WHEN name LIKE '%PET%' THEN 90.0
                    WHEN name LIKE '%HDPE%' THEN 85.0
                    WHEN name LIKE '%PP%' THEN 80.0
                    WHEN name LIKE '%LDPE%' THEN 60.0
                    WHEN name LIKE '%PVC%' THEN 30.0
                    WHEN name LIKE '%PS%' THEN 20.0
                    WHEN name LIKE '%cardboard%' THEN 95.0
                    WHEN name LIKE '%paper%' THEN 90.0
                    WHEN name LIKE '%glass%' THEN 100.0
                    WHEN name LIKE '%aluminum%' THEN 95.0
                    WHEN name LIKE '%steel%' THEN 90.0
                    WHEN recyclable = 1 THEN 75.0
                    ELSE 0.0
                END
            WHERE recyclability_percentage = 0 OR recyclability_percentage IS NULL
        '''))
        
        db.commit()
        print(f'Updated recyclability percentages for {result.rowcount} materials')
        print('Analytics schema update completed successfully!')
        
    except Exception as e:
        print(f'Error updating database: {e}')
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
