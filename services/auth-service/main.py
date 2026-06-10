"""
TraceIt Auth Service — Handles authentication and pengguna management.
Microservice yang bertanggung jawab untuk:
- Registrasi pengguna
- Login pengguna (JWT token generation)
- Token verification (dipanggil oleh service lain)
"""
import logging
import os
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import bcrypt
import jwt

from database import engine, get_db, Base
from models import User
from schemas import (UserCreate, PenggunaCreate, AdminCreate, UserResponse,
                     LoginRequest, TokenResponse, TokenVerifyResponse)
from logging_config import setup_logging
from logging_middleware import RequestLoggingMiddleware
from metrics import metrics

# Setup structured logging
setup_logging()
logger = logging.getLogger(__name__)

# Membuat tabel database secara otomatis berdasarkan model jika belum ada
Base.metadata.create_all(bind=engine)

# Inisialisasi aplikasi FastAPI dengan metadata dokumentasi
app = FastAPI(
    title="TraceIt Auth Service",
    description="Authentication microservice for Tracelt",
    version="2.0.0",
)

# CORS - allow_origins=["*"] aman karena auth pakai JWT Bearer header (bukan cookie)
# allow_credentials harus False jika allow_origins=["*"]
_cors_raw = os.getenv("CORS_ORIGINS", "")
CORS_ORIGINS = _cors_raw.split(",") if _cors_raw else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Logging middleware (setelah CORS)
app.add_middleware(RequestLoggingMiddleware)

# JWT Config
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkeymiracle2026")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES", "30"))

# Hash password mentah menggunakan algoritma bcrypt.
def hash_password(password: str) -> str:
    """Hash password menggunakan bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# Memvalidasi apakah password mentah cocok dengan hash di database.
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Membuat token akses JWT baru dengan masa kedaluwarsa.
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Mendekode dan memvalidasi token JWT
def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def _do_login(login_data: LoginRequest, db: Session, user_type: str) -> TokenResponse:
    """Internal helper: authenticate user and return JWT with given user_type."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "name": user.name,
        "nama_pengguna": user.name,
        "user_type": user_type,
    })
    return TokenResponse(access_token=token)


# ===================== ENDPOINTS =====================
# endpoint ini memang berbeda dengan full endpoint yang ada di folder backend
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "auth-service",
        "version": "2.0.0",
    }

# Register user baru ke dalam sistem.
@app.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register user baru."""
    try:
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = User(
            email=user_data.email,
            name=user_data.name,
            hashed_password=hash_password(user_data.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Register failed: {str(e)}", extra={"error": str(e)})
        raise HTTPException(status_code=500, detail="Register failed")


@app.post("/pengguna/register", response_model=UserResponse, status_code=201)
def register_pengguna(user_data: PenggunaCreate, db: Session = Depends(get_db)):
    """Register pengguna baru via frontend (field: nama_pengguna)."""
    try:
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = User(
            email=user_data.email,
            name=user_data.nama_pengguna,
            hashed_password=hash_password(user_data.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Register pengguna failed: {str(e)}", extra={"error": str(e)})
        raise HTTPException(status_code=500, detail="Register failed")


@app.post("/admin/register", response_model=UserResponse, status_code=201)
def register_admin(user_data: AdminCreate, db: Session = Depends(get_db)):
    """Register admin baru via frontend (field: nama_admin)."""
    try:
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = User(
            email=user_data.email,
            name=user_data.nama_admin,
            hashed_password=hash_password(user_data.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Register admin failed: {str(e)}", extra={"error": str(e)})
        raise HTTPException(status_code=500, detail="Register failed")


# Login pengguna dan kembalikan access token (JWT) jika sukses.
@app.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login dan dapatkan JWT token."""
    try:
        return _do_login(login_data, db, user_type="pengguna")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {str(e)}", extra={"error": str(e)})
        raise HTTPException(status_code=500, detail="Login failed")


@app.post("/pengguna/login", response_model=TokenResponse)
def login_pengguna(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login pengguna (dipanggil via /auth/pengguna/login dari frontend)."""
    try:
        return _do_login(login_data, db, user_type="pengguna")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login pengguna failed: {str(e)}", extra={"error": str(e)})
        raise HTTPException(status_code=500, detail="Login failed")


@app.post("/admin/login", response_model=TokenResponse)
def login_admin(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login admin (dipanggil via /auth/admin/login dari frontend)."""
    try:
        return _do_login(login_data, db, user_type="admin")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login admin failed: {str(e)}", extra={"error": str(e)})
        raise HTTPException(status_code=500, detail="Login failed")


# Verifikasi token JWT yang dikirim melalui HTTP Authorization Header
@app.get("/verify", response_model=TokenVerifyResponse)
def verify_token(authorization: str = Header(None)):
    """Verifikasi JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split("Bearer ")[1]
    payload = decode_token(token)

    return TokenVerifyResponse(
        user_id=int(payload["sub"]),
        email=payload["email"],
        name=payload.get("name", ""),
        nama_pengguna=payload.get("nama_pengguna") or payload.get("name"),
        user_type=payload.get("user_type", "pengguna"),
    )

# Mengembalikan data metrik aplikasi (misal: jumlah request, latency) untuk kebutuhan monitoring sistem
@app.get("/metrics")
def get_metrics():
    """Return application metrics."""
    return {
        "service": "auth-service",
        **metrics.get_metrics(),
    }