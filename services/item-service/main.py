"""
TraceIt Donor Service — Mengelola data pendonor dan riwayat donor.
Berkomunikasi dengan Auth Service untuk verifikasi token pengguna.
"""
import logging
import os
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func as sql_func, text
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import GolonganDarahEnum, Pendonor, RiwayatDonor
from schemas import (
    PendonorCreate, PendonorListResponse, PendonorResponse,
    PendonorStatsResponse, PendonorUpdate,
    PenggunaMeResponse,
    PublicBloodStockResponse,
    RiwayatDonorCreate, RiwayatDonorListResponse, RiwayatDonorResponse,
    RiwayatDonorUpdate, RiwayatDonorVerifikasi,
)
from auth_client import auth_circuit, verify_token_with_auth_service
from logging_config import setup_logging
from logging_middleware import RequestLoggingMiddleware

setup_logging()
logger = logging.getLogger(__name__)

# Buat semua tabel
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TraceIt Donor Service",
    description="Microservice pengelolaan pendonor dan riwayat donor — TraceLT",
    version="2.0.0",
)

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost,http://localhost:5173,http://localhost:80,http://127.0.0.1",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestLoggingMiddleware)

# ==================== HEALTH CHECK ====================

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    cb_status = auth_circuit.get_status()

    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    overall = "healthy"
    if cb_status["state"] != "CLOSED":
        overall = "degraded"
    if db_status != "connected":
        overall = "unhealthy"

    return JSONResponse(
        content={
            "status": overall,
            "service": "donor-service",
            "version": "2.0.0",
            "dependencies": {
                "auth-service": {
                    "status": "available" if cb_status["state"] == "CLOSED" else "unavailable",
                    "circuit_breaker": cb_status,
                },
                "database": {"status": db_status},
            },
        },
        status_code=200 if overall != "unhealthy" else 503,
    )


# ==================== PUBLIC ENDPOINTS ====================

@app.get("/api/public/blood-stock", response_model=PublicBloodStockResponse)
def get_public_blood_stock(db: Session = Depends(get_db)):
    """Stok darah per golongan — publik, tanpa autentikasi."""
    results = (
        db.query(
            RiwayatDonor.golongan_darah,
            sql_func.count(RiwayatDonor.id_riwayat).label("jumlah_stok"),
        )
        .filter(RiwayatDonor.status_verifikasi == True)  # noqa: E712
        .group_by(RiwayatDonor.golongan_darah)
        .all()
    )
    stock = [
        {"golongan_darah": str(r.golongan_darah), "jumlah_stok": r.jumlah_stok}
        for r in results
    ]
    return {"blood_stock": stock}


@app.get("/pendonor/stats", response_model=PendonorStatsResponse)
def get_pendonor_stats(db: Session = Depends(get_db)):
    """Statistik pendonor — publik, tetap tersedia saat auth down (degraded mode)."""
    cb_state = auth_circuit.get_status()["state"]

    total = db.query(sql_func.count(Pendonor.id_pendonor)).scalar() or 0

    rows = (
        db.query(Pendonor.golongan_darah, sql_func.count(Pendonor.id_pendonor))
        .group_by(Pendonor.golongan_darah)
        .all()
    )
    per_golongan = {str(gd): cnt for gd, cnt in rows}

    return PendonorStatsResponse(
        total_pendonor=total,
        per_golongan_darah=per_golongan,
        mode="degraded" if cb_state != "CLOSED" else "full",
    )


# ==================== PENDONOR ENDPOINTS ====================

@app.post("/pendonor", response_model=PendonorResponse, status_code=201)
def create_pendonor(pendonor_data: PendonorCreate, db: Session = Depends(get_db)):
    """Daftarkan pendonor baru — publik."""
    pendonor = Pendonor(**pendonor_data.model_dump())
    db.add(pendonor)
    db.commit()
    db.refresh(pendonor)
    return pendonor


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
    """Daftar pendonor dengan filter — publik."""
    query = db.query(Pendonor)
    if nama:
        query = query.filter(Pendonor.nama_lengkap.ilike(f"%{nama}%"))
    if jenis_kelamin:
        query = query.filter(Pendonor.jenis_kelamin == jenis_kelamin)
    if golongan_darah:
        query = query.filter(Pendonor.golongan_darah == golongan_darah)
    if umur_min is not None:
        query = query.filter(Pendonor.umur >= umur_min)
    if umur_max is not None:
        query = query.filter(Pendonor.umur <= umur_max)

    total = query.count()
    pendonor = query.offset(skip).limit(limit).all()
    return PendonorListResponse(total=total, pendonor=pendonor)


@app.get("/pendonor/{pendonor_id}", response_model=PendonorResponse)
def get_pendonor(pendonor_id: int, db: Session = Depends(get_db)):
    pendonor = db.query(Pendonor).filter(Pendonor.id_pendonor == pendonor_id).first()
    if not pendonor:
        raise HTTPException(status_code=404, detail=f"Pendonor {pendonor_id} tidak ditemukan")
    return pendonor


@app.put("/pendonor/{pendonor_id}", response_model=PendonorResponse)
def update_pendonor(
    pendonor_id: int,
    pendonor_data: PendonorUpdate,
    db: Session = Depends(get_db),
):
    pendonor = db.query(Pendonor).filter(Pendonor.id_pendonor == pendonor_id).first()
    if not pendonor:
        raise HTTPException(status_code=404, detail=f"Pendonor {pendonor_id} tidak ditemukan")

    for field, value in pendonor_data.model_dump(exclude_unset=True).items():
        setattr(pendonor, field, value)
    db.commit()
    db.refresh(pendonor)
    return pendonor


@app.delete("/pendonor/{pendonor_id}", status_code=204)
async def delete_pendonor(
    pendonor_id: int,
    db: Session = Depends(get_db),
    _user: dict = Depends(verify_token_with_auth_service),
):
    """Hapus pendonor — membutuhkan autentikasi."""
    pendonor = db.query(Pendonor).filter(Pendonor.id_pendonor == pendonor_id).first()
    if not pendonor:
        raise HTTPException(status_code=404, detail=f"Pendonor {pendonor_id} tidak ditemukan")
    db.delete(pendonor)
    db.commit()
    return None


# ==================== RIWAYAT DONOR ENDPOINTS ====================

@app.post("/riwayat-donor", response_model=RiwayatDonorResponse, status_code=201)
def create_riwayat_donor(
    riwayat_data: RiwayatDonorCreate,
    db: Session = Depends(get_db),
):
    """Catat riwayat donor baru — publik."""
    pendonor = db.query(Pendonor).filter(
        Pendonor.id_pendonor == riwayat_data.id_pendonor
    ).first()
    if not pendonor:
        raise HTTPException(
            status_code=404,
            detail=f"Pendonor {riwayat_data.id_pendonor} tidak ditemukan",
        )

    golongan = riwayat_data.golongan_darah or pendonor.golongan_darah

    riwayat = RiwayatDonor(
        id_pendonor=riwayat_data.id_pendonor,
        golongan_darah=golongan,
        status_verifikasi=False,
    )
    db.add(riwayat)

    pendonor.total_donor += 1
    db.commit()
    db.refresh(riwayat)
    return riwayat


@app.get("/riwayat-donor", response_model=RiwayatDonorListResponse)
def get_riwayat_donor_all(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    status_verifikasi: bool | None = Query(None),
    db: Session = Depends(get_db),
):
    """Semua riwayat donor — publik."""
    query = db.query(RiwayatDonor)
    if status_verifikasi is not None:
        query = query.filter(RiwayatDonor.status_verifikasi == status_verifikasi)
    total = query.count()
    riwayat = query.offset(skip).limit(limit).all()
    return RiwayatDonorListResponse(total=total, riwayat_donor=riwayat)


@app.get("/riwayat-donor/pendonor/{pendonor_id}", response_model=RiwayatDonorListResponse)
def get_riwayat_donor_by_pendonor(
    pendonor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    query = db.query(RiwayatDonor).filter(RiwayatDonor.id_pendonor == pendonor_id)
    total = query.count()
    riwayat = query.offset(skip).limit(limit).all()
    return RiwayatDonorListResponse(total=total, riwayat_donor=riwayat)


@app.get("/riwayat-donor/{riwayat_id}", response_model=RiwayatDonorResponse)
def get_riwayat_donor(riwayat_id: int, db: Session = Depends(get_db)):
    riwayat = db.query(RiwayatDonor).filter(RiwayatDonor.id_riwayat == riwayat_id).first()
    if not riwayat:
        raise HTTPException(status_code=404, detail=f"Riwayat donor {riwayat_id} tidak ditemukan")
    return riwayat


@app.post("/riwayat-donor/{riwayat_id}/verifikasi", response_model=RiwayatDonorResponse)
async def verifikasi_riwayat_donor(
    riwayat_id: int,
    verifikasi_data: RiwayatDonorVerifikasi,
    db: Session = Depends(get_db),
    _user: dict = Depends(verify_token_with_auth_service),
):
    """Verifikasi riwayat donor — membutuhkan autentikasi."""
    riwayat = db.query(RiwayatDonor).filter(RiwayatDonor.id_riwayat == riwayat_id).first()
    if not riwayat:
        raise HTTPException(status_code=404, detail=f"Riwayat donor {riwayat_id} tidak ditemukan")

    riwayat.status_verifikasi = verifikasi_data.status_verifikasi
    db.commit()
    db.refresh(riwayat)
    return riwayat


# ==================== PENGGUNA ENDPOINTS ====================

@app.get("/pengguna/me", response_model=PenggunaMeResponse)
async def get_current_pengguna_me(
    user: dict = Depends(verify_token_with_auth_service),
):
    """
    Profil pengguna yang sedang login.
    Data dikembalikan dari payload token yang diverifikasi oleh Auth Service.
    Endpoint ini balance dengan GET /pengguna/me di backend/main.py.
    """
    return PenggunaMeResponse(
        user_id=user.get("user_id"),
        email=user.get("email", ""),
        nama_pengguna=user.get("nama_pengguna") or user.get("sub", ""),
        user_type=user.get("user_type", "pengguna"),
    )


# ==================== PENGGUNA: RIWAYAT DONOR MILIK SENDIRI ====================

@app.post("/pengguna/riwayat-donor", response_model=RiwayatDonorResponse, status_code=201)
async def create_riwayat_donor_pengguna(
    riwayat_data: RiwayatDonorCreate,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Pengguna catat riwayat donor miliknya sendiri."""
    pendonor = db.query(Pendonor).filter(
        Pendonor.id_pendonor == riwayat_data.id_pendonor
    ).first()
    if not pendonor:
        raise HTTPException(
            status_code=404,
            detail=f"Pendonor {riwayat_data.id_pendonor} tidak ditemukan",
        )

    golongan = riwayat_data.golongan_darah or pendonor.golongan_darah

    riwayat = RiwayatDonor(
        id_pendonor=riwayat_data.id_pendonor,
        id_pengguna=user["user_id"],
        golongan_darah=golongan,
        status_verifikasi=False,
    )
    db.add(riwayat)
    pendonor.total_donor += 1
    db.commit()
    db.refresh(riwayat)
    return riwayat


@app.get("/pengguna/riwayat-donor", response_model=RiwayatDonorListResponse)
async def get_riwayat_donor_pengguna(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Daftar riwayat donor milik pengguna yang login."""
    query = db.query(RiwayatDonor).filter(RiwayatDonor.id_pengguna == user["user_id"])
    total = query.count()
    riwayat = query.offset(skip).limit(limit).all()
    return RiwayatDonorListResponse(total=total, riwayat_donor=riwayat)


@app.get("/pengguna/riwayat-donor/{riwayat_id}", response_model=RiwayatDonorResponse)
async def get_riwayat_donor_detail_pengguna(
    riwayat_id: int,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    riwayat = db.query(RiwayatDonor).filter(
        RiwayatDonor.id_riwayat == riwayat_id,
        RiwayatDonor.id_pengguna == user["user_id"],
    ).first()
    if not riwayat:
        raise HTTPException(status_code=404, detail=f"Riwayat donor {riwayat_id} tidak ditemukan")
    return riwayat


@app.put("/pengguna/riwayat-donor/{riwayat_id}", response_model=RiwayatDonorResponse)
async def update_riwayat_donor_pengguna(
    riwayat_id: int,
    riwayat_data: RiwayatDonorUpdate,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    riwayat = db.query(RiwayatDonor).filter(
        RiwayatDonor.id_riwayat == riwayat_id,
        RiwayatDonor.id_pengguna == user["user_id"],
    ).first()
    if not riwayat:
        raise HTTPException(status_code=404, detail=f"Riwayat donor {riwayat_id} tidak ditemukan")

    if riwayat.status_verifikasi:
        raise HTTPException(
            status_code=400,
            detail="Riwayat donor yang sudah diverifikasi tidak dapat diubah",
        )

    for field, value in riwayat_data.model_dump(exclude_unset=True).items():
        setattr(riwayat, field, value)
    db.commit()
    db.refresh(riwayat)
    return riwayat


@app.delete("/pengguna/riwayat-donor/{riwayat_id}", status_code=204)
async def delete_riwayat_donor_pengguna(
    riwayat_id: int,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    riwayat = db.query(RiwayatDonor).filter(
        RiwayatDonor.id_riwayat == riwayat_id,
        RiwayatDonor.id_pengguna == user["user_id"],
    ).first()
    if not riwayat:
        raise HTTPException(status_code=404, detail=f"Riwayat donor {riwayat_id} tidak ditemukan")

    if riwayat.status_verifikasi:
        raise HTTPException(
            status_code=400,
            detail="Riwayat donor yang sudah diverifikasi tidak dapat dihapus",
        )

    db.delete(riwayat)
    db.commit()
    return None
