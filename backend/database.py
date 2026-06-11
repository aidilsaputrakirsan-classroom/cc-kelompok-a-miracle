from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from config import settings

# Ambil DATABASE_URL dari settings (memakai fallback default jika env var missing)
DATABASE_URL = settings.DATABASE_URL

# SQLite butuh check_same_thread=False; PostgreSQL butuh pool_pre_ping=True
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
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
