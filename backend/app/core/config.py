from decimal import Decimal
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Riseupzed API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # Financial & Demo Rules (Configurable per prompt requirements)
    WITHDRAWAL_MIN_AMOUNT: Decimal = Decimal("500.00")
    WITHDRAWAL_SATURDAY_ONLY: bool = False  # Set to True to enforce Saturday-only withdrawals
    WITHDRAWAL_TIMEZONE: str = "UTC"
    DEMO_DEPOSIT_USDT_ADDRESS: str = "0x71C8F7965F4d55b8e9b11cf298B30e462d142B29"
    DEMO_NETWORK: str = "USDT BEP20"

    # File Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB

    # Database
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/riseupzed_db"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_PRE_PING: bool = True

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @property
    def cors_origins(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        if isinstance(self.CORS_ORIGINS, str):
            if self.CORS_ORIGINS.startswith("[") and self.CORS_ORIGINS.endswith("]"):
                import json
                try:
                    return json.loads(self.CORS_ORIGINS)
                except Exception:
                    pass
            return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def safe_database_url(self) -> str:
        """Return database connection summary without password."""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(self.DATABASE_URL)
            return f"{parsed.scheme}://{parsed.hostname or 'localhost'}:{parsed.port or 5432}/{parsed.path.lstrip('/')}"
        except Exception:
            return "configured"


settings = Settings()
