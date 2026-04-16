import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import Admin, Pengguna

load_dotenv()

# Konfigurasi dari environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-for-development")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme — FastAPI akan mencari header "Authorization: Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ==================== PASSWORD ====================

def hash_password(password: str) -> str:
    """Hash password menggunakan bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifikasi password terhadap hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ==================== JWT TOKEN ====================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Buat JWT access token."""
    to_encode = data.copy()
    # JWT `sub` harus string; integer membuat token gagal divalidasi saat decode.
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode dan verifikasi JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau sudah expired",
            headers={"WWW-Authenticate": "Bearer"},
        )


def _parse_subject_id(subject: object) -> int | None:
    try:
        return int(subject)
    except (TypeError, ValueError):
        return None


# ==================== DEPENDENCY ====================

def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Admin:
    """
    Dependency injection: ambil current admin dari JWT token.
    Gunakan di endpoint yang hanya bisa diakses admin.
    """
    payload = decode_token(token)
    admin_id = _parse_subject_id(payload.get("sub"))
    user_type: str = payload.get("user_type")

    if user_type != "admin" or admin_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hanya admin yang bisa akses endpoint ini",
        )

    admin = db.query(Admin).filter(Admin.id_admin == admin_id).first()

    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin tidak ditemukan",
        )
    return admin


def get_current_pengguna(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Pengguna:
    """
    Dependency injection: ambil current pengguna dari JWT token.
    Gunakan di endpoint yang hanya bisa diakses pengguna.
    """
    payload = decode_token(token)
    pengguna_id = _parse_subject_id(payload.get("sub"))
    user_type: str = payload.get("user_type")

    if user_type != "pengguna" or pengguna_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hanya pengguna yang bisa akses endpoint ini",
        )

    pengguna = db.query(Pengguna).filter(Pengguna.id_pengguna == pengguna_id).first()

    if pengguna is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Pengguna tidak ditemukan",
        )
    return pengguna