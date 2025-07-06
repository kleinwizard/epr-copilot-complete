"""Configuration management for the EPR Backend."""

import os
from typing import Optional


class Settings:
    """Application settings."""
    
    def __init__(self, _env_file: Optional[str] = None):
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./epr_copilot.db")
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        
        secret_key = os.getenv("SECRET_KEY", "your-secret-key-here")
        if secret_key == "your-secret-key-here":
            raise ValueError(
                "SECRET_KEY environment variable must be set to a secure value. "
                "Do not use the default placeholder 'your-secret-key-here' in production."
            )
        self.secret_key = secret_key
        
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        
        if self.environment == "production":
            self.cors_origins = os.getenv("CORS_ORIGINS", "").split(",")
            self.cors_allow_credentials = False
        else:
            self.cors_origins = [
                "http://localhost:8080",
                "http://127.0.0.1:8080",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
            ]
            self.cors_allow_credentials = True


def get_settings(_env_file: Optional[str] = None) -> Settings:
    """Get application settings."""
    return Settings(_env_file=_env_file)
