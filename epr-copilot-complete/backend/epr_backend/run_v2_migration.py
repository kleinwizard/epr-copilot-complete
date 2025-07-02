"""
Execute v2.0 data migration script.
"""

from app.migrate_to_v2 import run_full_v2_migration
from app.database import SessionLocal

def main():
    """Run the full v2.0 migration process."""
    db = SessionLocal()
    try:
        print("Starting v2.0 data migration...")
        run_full_v2_migration(db)
        print("✅ V2.0 migration completed successfully")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
