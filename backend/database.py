import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

def _resolve_env_file() -> str:
    # Jika user set ENV_FILE, gunakan itu.
    # Kalau jalan di container Linux dan ada .env.docker, pakai file tersebut.
    env_file = os.getenv("ENV_FILE")
    if env_file:
        return env_file

    is_running_in_container = os.path.exists("/.dockerenv")
    if is_running_in_container and os.path.exists(".env.docker"):
        return ".env.docker"

    return ".env"


# Jangan override env yang sudah diinject dari docker/k8s/CI.
load_dotenv(dotenv_path=_resolve_env_file(), override=False)

# Ambil DATABASE_URL dari environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL tidak ditemukan di .env!")

# Buat engine (koneksi ke database)
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Buat session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class untuk models
Base = declarative_base()


# Dependency: dapatkan database session
def get_db():
    """
    Dependency injection untuk FastAPI.
    Membuka session saat request masuk, menutup saat selesai.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()