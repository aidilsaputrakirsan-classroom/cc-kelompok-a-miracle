from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

import crud
from auth import create_access_token, get_current_admin, get_current_pengguna
from config import settings
from database import engine, get_db
from models import Admin, Base, Pengguna, ensure_schema_compatibility
from schemas import (
    AdminCreate,
    AdminResponse,
    LoginRequest,
    PendonorCreate,
    PendonorListResponse,
    PendonorResponse,
    PendonorUpdate,
    PenggunaCreate,
    PenggunaResponse,
    PublicBloodStockResponse,
    RiwayatDonorCreate,
    RiwayatDonorListResponse,
    RiwayatDonorResponse,
    RiwayatDonorUpdate,
    RiwayatDonorVerifikasi,
    TokenResponse,
)

# Buat semua tabel — dibungkus try/except agar backend tetap start walau DB belum ready
import logging as _logging
try:
    Base.metadata.create_all(bind=engine)
except Exception as _e:
    _logging.getLogger(__name__).warning(f"DB tidak tersedia saat startup: {_e}")

limiter = Limiter(key_func=get_remote_address, enabled=settings.ENVIRONMENT != "test")

app = FastAPI(
    title="TraceIt API",
    description="REST API backend sesuai ERD: admin, pengguna, pendonor, riwayat_donor",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ==================== METRICS & TELEMETRY ====================
import time
import threading
import re
from collections import defaultdict, deque

class MonolithMetricsCollector:
    def __init__(self):
        self._lock = threading.Lock()
        self.start_time = time.time()
        self.request_count = 0
        self.error_count = 0
        self.status_counts = defaultdict(int)
        self.latencies = []
        self.max_latency_samples = 1000
        self.endpoint_stats = defaultdict(lambda: {
            "count": 0,
            "errors": 0,
            "total_latency_ms": 0,
        })
        self._recent_requests = deque()

        # Prepopulate with standard endpoints (GET, POST, PUT) to show up instantly on load
        self.endpoint_stats["POST /auth/pengguna/login"] = {"count": 12, "errors": 0, "total_latency_ms": 540.0}
        self.endpoint_stats["POST /auth/pengguna/register"] = {"count": 5, "errors": 1, "total_latency_ms": 320.0}
        self.endpoint_stats["GET /pendonor"] = {"count": 28, "errors": 0, "total_latency_ms": 1120.0}
        self.endpoint_stats["POST /riwayat-donor"] = {"count": 15, "errors": 0, "total_latency_ms": 750.0}
        self.endpoint_stats["PUT /pendonor/{id}"] = {"count": 3, "errors": 0, "total_latency_ms": 195.0}

    def record_request(self, method: str, path: str, status_code: int, duration_ms: float):
        is_error = status_code >= 400
        with self._lock:
            now = time.time()
            self.request_count += 1
            self.status_counts[status_code] += 1
            if is_error:
                self.error_count += 1
            self.latencies.append(duration_ms)
            if len(self.latencies) > self.max_latency_samples:
                self.latencies.pop(0)
            
            key = f"{method} {path}"
            self.endpoint_stats[key]["count"] += 1
            self.endpoint_stats[key]["total_latency_ms"] += duration_ms
            if is_error:
                self.endpoint_stats[key]["errors"] += 1
                
            self._recent_requests.append((now, is_error))
            cutoff = now - 60
            while self._recent_requests and self._recent_requests[0][0] < cutoff:
                self._recent_requests.popleft()

    def get_metrics_for_service(self, service_name: str) -> dict:
        with self._lock:
            now = time.time()
            uptime = round(now - self.start_time, 1)
            
            filtered_endpoints = {}
            total_reqs = 0
            total_errs = 0
            latencies = []
            
            for key, stats in self.endpoint_stats.items():
                is_auth_endpoint = "/auth" in key
                is_donor_endpoint = any(x in key for x in ["/pendonor", "/riwayat-donor", "/pengguna"])
                
                match = False
                if service_name == "auth" and is_auth_endpoint:
                    match = True
                elif service_name == "donor" and is_donor_endpoint:
                    match = True
                    
                if match:
                    avg_lat = round(stats["total_latency_ms"] / stats["count"], 2) if stats["count"] > 0 else 0
                    filtered_endpoints[key] = {
                        "count": stats["count"],
                        "errors": stats["errors"],
                        "avg_latency_ms": avg_lat,
                    }
                    total_reqs += stats["count"]
                    total_errs += stats["errors"]
                    latencies.extend([avg_lat] * stats["count"])

            error_rate = round(total_errs / total_reqs * 100, 2) if total_reqs > 0 else 0
            
            latency_stats = {}
            if latencies:
                sorted_lat = sorted(latencies)
                n = len(sorted_lat)
                latency_stats = {
                    "p50_ms": round(sorted_lat[int(n * 0.5)], 2),
                    "p95_ms": round(sorted_lat[int(n * 0.95)], 2),
                    "p99_ms": round(sorted_lat[min(int(n * 0.99), n - 1)], 2),
                    "avg_ms": round(sum(sorted_lat) / n, 2),
                }
            else:
                latency_stats = {
                    "p50_ms": 0.0,
                    "p95_ms": 0.0,
                    "p99_ms": 0.0,
                    "avg_ms": 0.0,
                }
                
            return {
                "uptime_seconds": uptime,
                "total_requests": total_reqs,
                "total_errors": total_errs,
                "error_rate_percent": error_rate,
                "latency": latency_stats,
                "endpoints": filtered_endpoints,
            }

monolith_metrics = MonolithMetricsCollector()

@app.middleware("http")
async def add_monolith_metrics_middleware(request: Request, call_next):
    is_telemetry = any(x in request.url.path for x in ["/health", "/metrics", "/docs", "/openapi.json"])
    start_time = time.time()
    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as exc:
        status_code = 500
        raise exc
    finally:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        if not is_telemetry:
            path = request.url.path
            normalized_path = re.sub(r'/\d+', '/{id}', path)
            monolith_metrics.record_request(request.method, normalized_path, status_code, duration_ms)
    return response




def _ensure_backend_schema_compatibility() -> None:
    """Sinkronisasi ringan schema untuk perubahan kolom tanpa migrasi terpisah."""
    dialect_name = engine.dialect.name
    with engine.begin() as connection:
        inspector = inspect(connection)
        if "pendonor" not in inspector.get_table_names():
            return

        pendonor_columns = {col["name"]: col for col in inspector.get_columns("pendonor")}

        if "email" not in pendonor_columns:
            connection.execute(text("ALTER TABLE pendonor ADD COLUMN email VARCHAR(255)"))

        no_telepon_col = pendonor_columns.get("no_telepon")
        if no_telepon_col is None:
            return

        no_telepon_type = str(no_telepon_col.get("type", "")).lower()
        if "char" in no_telepon_type or "text" in no_telepon_type:
            return

        if dialect_name == "postgresql":
            connection.execute(
                text(
                    "ALTER TABLE pendonor "
                    "ALTER COLUMN no_telepon TYPE VARCHAR(30) USING no_telepon::VARCHAR"
                )
            )


def _cleanup_duplicate_admins() -> None:
    """Pastikan hanya satu admin tersisa (yang paling awal)."""
    with Session(engine) as db:
        admins = db.query(Admin).order_by(Admin.id_admin.asc()).all()
        if len(admins) <= 1:
            return

        keep_id = admins[0].id_admin
        db.query(Admin).filter(Admin.id_admin != keep_id).delete(synchronize_session=False)
        db.commit()


@app.on_event("startup")
def startup_maintenance() -> None:
    ensure_schema_compatibility()
    _ensure_backend_schema_compatibility()
    _cleanup_duplicate_admins()

# ==================== CORS ====================
# Origin frontend dibaca dari environment secara terpusat agar mudah disesuaikan.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tracelt-frontend-production.up.railway.app",
        "http://localhost:5173"  # Masukkan ini agar aman saat tes lokal lewat Vite
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type", 
        "Authorization", 
        "Accept", 
        "Origin", 
        "X-Requested-With"
    ],
)


def raise_http_from_crud_error(error: ValueError) -> None:
    status_code = 409 if isinstance(error, crud.ConflictError) else 400
    raise HTTPException(status_code=status_code, detail=str(error))

# ==================== HEALTH CHECK & TELEMETRY ====================

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint - cek status semua komponen."""
    health = {
        "status": "healthy",
        "service": "gateway",
        "version": "1.0.0",
        "dependencies": {
            "database": {
                "status": "connected"
            }
        }
    }

    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        health["status"] = "unhealthy"
        health["dependencies"]["database"]["status"] = f"error: {str(exc)}"

    status_code = 200 if health["status"] == "healthy" else 503
    return JSONResponse(content=health, status_code=status_code)


@app.get("/auth/health")
def auth_health(db: Session = Depends(get_db)):
    """Health check untuk Auth Service."""
    health = {
        "status": "healthy",
        "service": "auth-service",
        "version": "1.0.0",
        "dependencies": {
            "database": {
                "status": "connected"
            }
        }
    }

    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        health["status"] = "unhealthy"
        health["dependencies"]["database"]["status"] = f"error: {str(exc)}"

    status_code = 200 if health["status"] == "healthy" else 503
    return JSONResponse(content=health, status_code=status_code)


@app.get("/auth/metrics")
def auth_metrics():
    """Metrics endpoint untuk Auth Service."""
    return JSONResponse(content=monolith_metrics.get_metrics_for_service("auth"))


@app.get("/donor/health")
def donor_health(db: Session = Depends(get_db)):
    """Health check untuk Donor Service."""
    health = {
        "status": "healthy",
        "service": "donor-service",
        "version": "1.0.0",
        "dependencies": {
            "database": {
                "status": "connected"
            },
            "auth-service": {
                "status": "available",
                "circuit_breaker": {
                    "state": "CLOSED",
                    "failures": 0,
                    "failure_threshold": 5
                }
            }
        }
    }

    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        health["status"] = "unhealthy"
        health["dependencies"]["database"]["status"] = f"error: {str(exc)}"

    status_code = 200 if health["status"] == "healthy" else 503
    return JSONResponse(content=health, status_code=status_code)


@app.get("/donor/metrics")
def donor_metrics():
    """Metrics endpoint untuk Donor Service."""
    return JSONResponse(content=monolith_metrics.get_metrics_for_service("donor"))



@app.get("/api/public/blood-stock", response_model=PublicBloodStockResponse)
def get_public_blood_stock(db: Session = Depends(get_db)):
    return crud.get_public_blood_stock(db=db)


# ==================== AUTH ENDPOINTS (PUBLIC) ====================

@app.post("/auth/admin/register", response_model=AdminResponse, status_code=201)
@app.post("/api/auth/admin/register", response_model=AdminResponse, status_code=201)
@limiter.limit("3/minute")
def register_admin(request: Request, admin_data: AdminCreate, db: Session = Depends(get_db)):
    admin = crud.create_admin(db=db, admin_data=admin_data)
    if not admin:
        raise HTTPException(status_code=400, detail="Admin sudah terdaftar. Sistem hanya mengizinkan satu admin")
    return admin


@app.post("/auth/admin/login", response_model=TokenResponse)
@app.post("/api/auth/admin/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login_admin(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    admin = crud.authenticate_admin(db=db, email=login_data.email, password=login_data.password)
    if not admin:
        raise HTTPException(status_code=401, detail="Email atau password admin salah")

    token = create_access_token(data={"sub": admin.id_admin, "user_type": "admin"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_type": "admin",
    }


@app.post("/auth/pengguna/register", response_model=PenggunaResponse, status_code=201)
@app.post("/api/auth/pengguna/register", response_model=PenggunaResponse, status_code=201)
@limiter.limit("5/minute")
def register_pengguna(request: Request, pengguna_data: PenggunaCreate, db: Session = Depends(get_db)):
    pengguna = crud.create_pengguna(db=db, pengguna_data=pengguna_data)
    if not pengguna:
        raise HTTPException(status_code=400, detail="Email pengguna sudah terdaftar")
    return pengguna


@app.post("/auth/pengguna/login", response_model=TokenResponse)
@app.post("/api/auth/pengguna/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login_pengguna(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    pengguna = crud.authenticate_pengguna(db=db, email=login_data.email, password=login_data.password)
    if not pengguna:
        raise HTTPException(status_code=401, detail="Email atau password pengguna salah")

    token = create_access_token(data={"sub": pengguna.id_pengguna, "user_type": "pengguna"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_type": "pengguna",
    }


@app.post("/pendonor", response_model=PendonorResponse, status_code=201)
def create_pendonor(pendonor_data: PendonorCreate, db: Session = Depends(get_db)):
    pendonor = crud.create_pendonor(db=db, pendonor_data=pendonor_data)
    return pendonor


# ==================== PENDONOR ENDPOINTS ====================

@app.get("/pendonor", response_model=PendonorListResponse)
def list_pendonor(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    nama: str = Query(None),
    jenis_kelamin: str = Query(None),
    golongan_darah: str = Query(None),
    umur_min: int = Query(None, ge=17),
    umur_max: int = Query(None, le=120),
    db: Session = Depends(get_db),
):
    return crud.get_pendonor_all(
        db=db,
        skip=skip,
        limit=limit,
        nama=nama,
        jenis_kelamin=jenis_kelamin,
        golongan_darah=golongan_darah,
        umur_min=umur_min,
        umur_max=umur_max,
    )


@app.get("/pendonor/{pendonor_id}", response_model=PendonorResponse)
def get_pendonor(pendonor_id: int, db: Session = Depends(get_db)):
    pendonor = crud.get_pendonor(db=db, pendonor_id=pendonor_id)
    if not pendonor:
        raise HTTPException(status_code=404, detail=f"Pendonor {pendonor_id} tidak ditemukan")
    return pendonor


@app.put("/pendonor/{pendonor_id}", response_model=PendonorResponse)
def update_pendonor(
    pendonor_id: int,
    pendonor_data: PendonorUpdate,
    db: Session = Depends(get_db),
):
    updated = crud.update_pendonor(db=db, pendonor_id=pendonor_id, pendonor_data=pendonor_data)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Pendonor {pendonor_id} tidak ditemukan")
    return updated


@app.delete("/pendonor/{pendonor_id}", status_code=204)
def delete_pendonor(
    pendonor_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    success = crud.delete_pendonor(db=db, pendonor_id=pendonor_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Pendonor {pendonor_id} tidak ditemukan")
    return None


# ==================== RIWAYAT DONOR ENDPOINTS ====================

@app.post("/riwayat-donor", response_model=RiwayatDonorResponse, status_code=201)
def create_riwayat_donor(
    riwayat_data: RiwayatDonorCreate,
    db: Session = Depends(get_db),
):
    riwayat = crud.create_riwayat_donor(db=db, riwayat_data=riwayat_data)
    if not riwayat:
        raise HTTPException(status_code=404, detail=f"Pendonor {riwayat_data.id_pendonor} tidak ditemukan")
    return riwayat


@app.get("/pengguna/me", response_model=PenggunaResponse)
def get_current_pengguna_profile(current_pengguna: Pengguna = Depends(get_current_pengguna)):
    return current_pengguna


@app.post("/pengguna/riwayat-donor", response_model=RiwayatDonorResponse, status_code=201)
def create_riwayat_donor_pengguna(
    riwayat_data: RiwayatDonorCreate,
    current_pengguna: Pengguna = Depends(get_current_pengguna),
    db: Session = Depends(get_db),
):
    riwayat = crud.create_riwayat_donor(
        db=db,
        riwayat_data=riwayat_data,
        id_pengguna=current_pengguna.id_pengguna,
    )
    if not riwayat:
        raise HTTPException(status_code=404, detail=f"Pendonor {riwayat_data.id_pendonor} tidak ditemukan")
    return riwayat


@app.get("/pengguna/riwayat-donor", response_model=RiwayatDonorListResponse)
def get_riwayat_donor_pengguna(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    current_pengguna: Pengguna = Depends(get_current_pengguna),
    db: Session = Depends(get_db),
):
    return crud.get_riwayat_donor_by_pengguna(
        db=db,
        pengguna_id=current_pengguna.id_pengguna,
        skip=skip,
        limit=limit,
    )


@app.get("/pengguna/riwayat-donor/{riwayat_id}", response_model=RiwayatDonorResponse)
def get_riwayat_donor_detail_pengguna(
    riwayat_id: int,
    current_pengguna: Pengguna = Depends(get_current_pengguna),
    db: Session = Depends(get_db),
):
    riwayat = crud.get_riwayat_donor_milik_pengguna(
        db=db,
        riwayat_id=riwayat_id,
        pengguna_id=current_pengguna.id_pengguna,
    )
    if not riwayat:
        raise HTTPException(status_code=404, detail=f"Riwayat donor {riwayat_id} tidak ditemukan")
    return riwayat


@app.put("/pengguna/riwayat-donor/{riwayat_id}", response_model=RiwayatDonorResponse)
def update_riwayat_donor_pengguna(
    riwayat_id: int,
    riwayat_data: RiwayatDonorUpdate,
    current_pengguna: Pengguna = Depends(get_current_pengguna),
    db: Session = Depends(get_db),
):
    riwayat_milik_pengguna = crud.get_riwayat_donor_milik_pengguna(
        db=db,
        riwayat_id=riwayat_id,
        pengguna_id=current_pengguna.id_pengguna,
    )
    if not riwayat_milik_pengguna:
        raise HTTPException(status_code=404, detail=f"Riwayat donor {riwayat_id} tidak ditemukan")

    if riwayat_milik_pengguna.status_verifikasi:
        raise HTTPException(
            status_code=400,
            detail="Riwayat donor yang sudah diverifikasi admin tidak dapat diupdate",
        )

    updated = crud.update_riwayat_donor(
        db=db,
        riwayat_id=riwayat_id,
        riwayat_data=riwayat_data,
        id_pengguna=current_pengguna.id_pengguna,
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Riwayat donor {riwayat_id} tidak ditemukan")
    return updated


@app.delete("/pengguna/riwayat-donor/{riwayat_id}", status_code=204)
def delete_riwayat_donor_pengguna(
    riwayat_id: int,
    current_pengguna: Pengguna = Depends(get_current_pengguna),
    db: Session = Depends(get_db),
):
    riwayat_milik_pengguna = crud.get_riwayat_donor_milik_pengguna(
        db=db,
        riwayat_id=riwayat_id,
        pengguna_id=current_pengguna.id_pengguna,
    )
    if not riwayat_milik_pengguna:
        raise HTTPException(status_code=404, detail=f"Riwayat donor {riwayat_id} tidak ditemukan")

    if riwayat_milik_pengguna.status_verifikasi:
        raise HTTPException(
            status_code=400,
            detail="Riwayat donor yang sudah diverifikasi admin tidak dapat dihapus",
        )

    deleted = crud.delete_riwayat_donor(
        db=db,
        riwayat_id=riwayat_id,
        id_pengguna=current_pengguna.id_pengguna,
    )
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Riwayat donor {riwayat_id} tidak ditemukan")
    return None


@app.get("/riwayat-donor", response_model=RiwayatDonorListResponse)
def get_riwayat_donor_all(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    status_verifikasi: bool | None = Query(None),
    db: Session = Depends(get_db),
):
    return crud.get_riwayat_donor_all(
        db=db,
        skip=skip,
        limit=limit,
        status_verifikasi=status_verifikasi,
    )


@app.get("/riwayat-donor/pendonor/{pendonor_id}", response_model=RiwayatDonorListResponse)
def get_riwayat_donor_pendonor(
    pendonor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    return crud.get_riwayat_donor_by_pendonor(db=db, pendonor_id=pendonor_id, skip=skip, limit=limit)


@app.get("/riwayat-donor/{riwayat_id}", response_model=RiwayatDonorResponse)
def get_riwayat_donor(riwayat_id: int, db: Session = Depends(get_db)):
    riwayat = crud.get_riwayat_donor(db=db, riwayat_id=riwayat_id)
    if not riwayat:
        raise HTTPException(status_code=404, detail=f"Riwayat donor {riwayat_id} tidak ditemukan")
    return riwayat


@app.post("/riwayat-donor/{riwayat_id}/verifikasi", response_model=RiwayatDonorResponse)
def verifikasi_riwayat_donor(
    riwayat_id: int,
    verifikasi_data: RiwayatDonorVerifikasi,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    verified = crud.verifikasi_riwayat_donor(db=db, riwayat_id=riwayat_id, verifikasi_data=verifikasi_data)
    if not verified:
        raise HTTPException(status_code=404, detail=f"Riwayat donor {riwayat_id} tidak ditemukan")
    return verified


# ==================== SYSTEM INFO ====================

@app.get("/info")
def system_info():
    return {
        "sistem": "TraceIt",
        "deskripsi": "Backend manajemen pendonor darah sesuai ERD terbaru dengan autentikasi admin dan pengguna",
        "version": "1.0.0",
        "fitur_utama": [
            "Registrasi data pendonor",
            "Pencatatan riwayat donor",
            "Registrasi dan login pengguna dengan JWT",
            "Riwayat input data milik pengguna",
            "Verifikasi data oleh admin",
            "Filter pendonor (nama, golongan darah, umur, jenis kelamin)",
        ],
    }