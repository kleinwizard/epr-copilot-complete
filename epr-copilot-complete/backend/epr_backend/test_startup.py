#!/usr/bin/env python3
"""Test startup components to identify what's causing the hang"""

import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_database_creation():
    """Test if database creation is causing the hang"""
    try:
        from app.database import create_tables
        logger.info("Testing create_tables function...")
        create_tables()
        logger.info("create_tables completed successfully")
        return True
    except Exception as e:
        logger.error(f"create_tables failed: {e}")
        return False

def test_scheduler_creation():
    """Test if scheduler creation is causing issues"""
    try:
        os.environ['ENABLE_SCHEDULER'] = 'false'
        from app.services.scheduler import task_scheduler
        logger.info(f"Scheduler enabled: {task_scheduler.enabled}")
        logger.info("Scheduler object created successfully")
        return True
    except Exception as e:
        logger.error(f"Scheduler creation failed: {e}")
        return False

def test_app_import():
    """Test if app import is causing issues"""
    try:
        from app.main import app
        logger.info("App imported successfully")
        return True
    except Exception as e:
        logger.error(f"App import failed: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting startup component tests...")
    
    logger.info("=== Testing Database Creation ===")
    db_ok = test_database_creation()
    
    logger.info("=== Testing Scheduler Creation ===")
    scheduler_ok = test_scheduler_creation()
    
    logger.info("=== Testing App Import ===")
    app_ok = test_app_import()
    
    logger.info("=== Test Results ===")
    logger.info(f"Database: {'✅ OK' if db_ok else '❌ FAIL'}")
    logger.info(f"Scheduler: {'✅ OK' if scheduler_ok else '❌ FAIL'}")
    logger.info(f"App Import: {'✅ OK' if app_ok else '❌ FAIL'}")
    
    if all([db_ok, scheduler_ok, app_ok]):
        logger.info("All components tested successfully - issue might be in uvicorn startup")
    else:
        logger.info("Found issues in startup components")
