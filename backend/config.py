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

        # Database — fallback ke SQLite jika DATABASE_URL tidak di-set (Railway tanpa PostgreSQL)
        self.DATABASE_URL: str = os.getenv(
            "DATABASE_URL",
            "sqlite:///./tracelt.db",
        )

        # Auth — SECRET_KEY wajib di-set via env var; fallback hanya untuk development
        _secret = os.getenv("SECRET_KEY", "")
        if not _secret or _secret in ("CHANGE_ME_USE_RANDOM_STRING_MIN_32_CHARS", "dev-secret-key-change-in-production"):
            if self.ENVIRONMENT == "production":
                raise RuntimeError("SECRET_KEY wajib di-set di environment production. Gunakan nilai acak minimal 32 karakter.")
            _secret = "dev-secret-only-NOT-for-production"
        self.SECRET_KEY: str = _secret
        self.ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

        # CORS — allow_credentials=False sehingga "*" aman dipakai (JWT Bearer, bukan cookie)
        cors_value = os.getenv("CORS_ORIGINS") or os.getenv("ALLOWED_ORIGINS", "*")
        if cors_value == "*":
            self.CORS_ORIGINS: list[str] = ["*"]
        else:
            self.CORS_ORIGINS: list[str] = [origin.strip() for origin in cors_value.split(",") if origin.strip()]

        # Logging
        self.LOG_LEVEL: str = os.getenv("LOG_LEVEL", "DEBUG" if self.DEBUG else "INFO")


settings = Settings()