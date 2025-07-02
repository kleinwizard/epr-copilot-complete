"""
Execute v2.0 data migration script.
"""

import logging
from app.migrate_to_v2 import run_full_v2_migration
from app.database import SessionLocal

def main():
    """Run the full v2.0 migration process."""
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    db = SessionLocal()
    try:
        logger.info("Starting v2.0 data migration...")
        run_full_v2_migration(db)
        logger.info("✅ V2.0 migration completed successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
