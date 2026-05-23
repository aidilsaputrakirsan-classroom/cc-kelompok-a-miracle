import os
from dotenv import load_dotenv


def _resolve_env_file() -> str:
    env_file = os.getenv("ENV_FILE")
    if env_file:
        return env_file

    is_running_in_container = os.path.exists("/.dockerenv")
    if is_running_in_container and os.path.exists(".env.docker"):
        return ".env.docker"

    return ".env"


# Jangan override env yang sudah diinject dari docker/k8s/CI.
load_dotenv(dotenv_path=_resolve_env_file(), override=False)


class Settings:
    """Application settings — dibaca dari environment variables."""

    def __init__(self) -> None:
        self.ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        self.DEBUG: bool = self.ENVIRONMENT == "development"

        # Database
        self.DATABASE_URL: str = os.getenv(
            "DATABASE_URL",
            "postgresql://postgres:postgres@localhost:5432/tracelt",
        )

        # Auth
        self.SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
        self.ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

        # CORS
        cors_value = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
        self.CORS_ORIGINS: list[str] = [origin.strip() for origin in cors_value.split(",") if origin.strip()]

        # Logging
        self.LOG_LEVEL: str = os.getenv("LOG_LEVEL", "DEBUG" if self.DEBUG else "INFO")


settings = Settings()