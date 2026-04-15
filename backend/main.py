import os
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
from models import Base, Admin, Pengguna, Pendonor
from schemas import (
    AdminCreate, AdminResponse, PenggunaCreate, PenggunaResponse,
    PendonorCreate, PendonorUpdate, PendonorResponse, PendonorListResponse,
    RiwayatDonorCreate, RiwayatDonorVerifikasi, RiwayatDonorResponse, RiwayatDonorListResponse,
    RiwayatDonorUpdate,
    LoginRequest, TokenResponse, PublicBloodStockResponse,
)
from auth import create_access_token, get_current_admin, get_current_pengguna
import crud

# Buat semua tabel
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TraceIt API",
    description="REST API backend sesuai ERD: admin, pengguna, pendonor, riwayat_donor",
    version="1.0.0",
)

# ==================== CORS ====================
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
origins_list = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== HEALTH CHECK ====================

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "TraceIt API", "version": "1.0.0"}


@app.get("/api/public/blood-stock", response_model=PublicBloodStockResponse)
def get_public_blood_stock(db: Session = Depends(get_db)):
    return crud.get_public_blood_stock(db=db)


# ==================== AUTH ENDPOINTS (PUBLIC) ====================

@app.post("/auth/admin/register", response_model=AdminResponse, status_code=201)
def register_admin(admin_data: AdminCreate, db: Session = Depends(get_db)):
    admin = crud.create_admin(db=db, admin_data=admin_data)
    if not admin:
        raise HTTPException(status_code=400, detail="Email admin sudah terdaftar")
    return admin


@app.post("/auth/admin/login", response_model=TokenResponse)
def login_admin(login_data: LoginRequest, db: Session = Depends(get_db)):
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
def register_pengguna(pengguna_data: PenggunaCreate, db: Session = Depends(get_db)):
    pengguna = crud.create_pengguna(db=db, pengguna_data=pengguna_data)
    if not pengguna:
        raise HTTPException(status_code=400, detail="Email pengguna sudah terdaftar")
    return pengguna


@app.post("/auth/pengguna/login", response_model=TokenResponse)
def login_pengguna(login_data: LoginRequest, db: Session = Depends(get_db)):
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
    limit: int = Query(20, ge=1, le=100),
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
    limit: int = Query(20, ge=1, le=100),
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


@app.get("/riwayat-donor", response_model=RiwayatDonorListResponse)
def get_riwayat_donor_all(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
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
    limit: int = Query(20, ge=1, le=100),
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