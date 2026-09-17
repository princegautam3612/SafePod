from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "postgresql+asyncpg://safedrive:safedrive@db:5432/safedrive"
    redis_url: str = "redis://redis:6379/0"
    jwt_secret: str = "change-me-before-production"
    jwt_issuer: str = "safedrive-api"
    cors_origins: str = "http://localhost:3000"
    telemetry_retention_days: int = 30

    def sqlalchemy_database_url(self) -> str:
        """Accept a managed Postgres URL while retaining SQLAlchemy's async driver."""
        if self.database_url.startswith("postgres://"):
            return self.database_url.replace("postgres://", "postgresql+asyncpg://", 1)
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.database_url

@lru_cache
def settings() -> Settings:
    return Settings()
