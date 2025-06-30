"""Configuration management for the EPR Backend."""

import os
from typing import Optional


class Settings:
    """Application settings."""
    
    def __init__(self, _env_file: Optional[str] = None):
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./epr_copilot.db")
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.secret_key = os.getenv("SECRET_KEY", "your-secret-key-here")
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.debug = os.getenv("DEBUG", "false").lower() == "true"


def get_settings(_env_file: Optional[str] = None) -> Settings:
    """Get application settings."""
    return Settings(_env_file=_env_file)
