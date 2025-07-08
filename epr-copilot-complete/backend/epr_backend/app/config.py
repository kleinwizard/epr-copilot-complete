"""Configuration management for the EPR Backend."""

import os
from typing import Optional


class Settings:
    """Application settings."""
    
    def __init__(self, _env_file: Optional[str] = None):
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./epr_copilot.db")
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        
        secret_key = os.getenv("SECRET_KEY")
        if not secret_key:
            try:
                from dotenv import load_dotenv
                load_dotenv()
                secret_key = os.getenv("SECRET_KEY")
            except ImportError:
                pass
        
        if not secret_key or secret_key == "your-secret-key-here":
            raise ValueError(
                "SECRET_KEY environment variable must be set to a secure value. "
                "Do not use the default placeholder 'your-secret-key-here' in production."
            )
        self.secret_key = secret_key
        
        self.environment = os.getenv("ENVIRONMENT", "development").lower()
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        
        if self.environment not in ["development", "production", "testing"]:
            raise ValueError(
                f"Invalid ENVIRONMENT value: '{self.environment}'. "
                "Must be one of: development, production, testing"
            )
        
        if self.environment == "production":
            cors_origins_str = os.getenv("CORS_ORIGINS", "")
            if not cors_origins_str.strip():
                raise ValueError(
                    "CORS_ORIGINS environment variable must be set in production. "
                    "Provide a comma-separated list of allowed origins."
                )
            self.cors_origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]
            self.cors_allow_credentials = False
        else:
            self.cors_origins = [
                "http://localhost:8080",
                "http://127.0.0.1:8080",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://bug-fix-verification-app-tg521v5w.devinapps.com"
            ]
            self.cors_allow_credentials = True
        
        if self.environment == "production":
            if self.debug:
                raise ValueError("DEBUG must be false in production environment")
            if "sqlite" in self.database_url.lower():
                raise ValueError(
                    "SQLite database is not recommended for production. "
                    "Use PostgreSQL or another production database."
                )


def get_settings(_env_file: Optional[str] = None) -> Settings:
    """Get application settings."""
    return Settings(_env_file=_env_file)
