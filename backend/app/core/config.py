from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "AURA Restaurant OS - Enterprise Multi-Tenant Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "aura_super_secret_jwt_signing_key_2026_enterprise_grade_security"
    REFRESH_SECRET_KEY: str = "aura_super_secret_refresh_jwt_key_2026_rotation_secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Database (MongoDB)
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "restaurant_os_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    USE_IN_MEMORY_REDIS_FALLBACK: bool = True
    USE_IN_MEMORY_DB_FALLBACK: bool = True
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Storage & Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10
    
    # AI Assistant
    AI_ENABLED: bool = True
    AI_MODEL: str = "gemini-pro"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
