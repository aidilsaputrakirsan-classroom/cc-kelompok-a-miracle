import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, Admin, Pendonor
from schemas import (
    AdminCreate, AdminResponse, PendonorCreate, PendonorUpdate, PendonorResponse, PendonorListResponse,
    PendonorFilterRequest, RiwayatDonorCreate, RiwayatDonorVerifikasi, RiwayatDonorResponse, RiwayatDonorListResponse,
    RiwayatKesehatanCreate, RiwayatKesehatanResponse, GamifikasiResponse,
    LoginRequest, TokenResponse, StatusVerifikasiEnum, PendonorStatsResponse,
)
from auth import create_access_token, get_current_user, get_current_admin
import crud

load_dotenv(override=True)

# Buat semua tabel
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TraceIt API - Sistem Manajemen Pendonor Darah",
    description="REST API untuk aplikasi TraceIt ITK - membantu civitas akademika dalam pendataan donor darah sukarela",
    version="0.5.0",
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
    """Health check endpoint."""
    return {"status": "healthy", "service": "TraceIt API", "version": "1.0.0"}


# ==================== AUTH ENDPOINTS (PUBLIC) ====================

@app.post("/auth/admin/register", response_model=AdminResponse, status_code=201)
def register_admin(admin_data: AdminCreate, db: Session = Depends(get_db)):
    """
    Registrasi admin baru. Hanya untuk setup awal sistem.
    
    **Password requirements:**
    - Minimal 8 karakter
    - Minimal 1 huruf besar
    - Minimal 1 huruf kecil
    - Minimal 1 angka
    - Minimal 1 karakter spesial (!@#$%^&*)
    """
    admin = crud.create_admin(db=db, admin_data=admin_data)
    if not admin:
        raise HTTPException(status_code=400, detail="Email admin sudah terdaftar")
    return admin


@app.post("/auth/admin/login", response_model=TokenResponse)
def login_admin(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login admin dan dapatkan JWT token. Token berlaku 60 menit."""
    admin = crud.authenticate_admin(db=db, email=login_data.email, password=login_data.password)
    if not admin:
        raise HTTPException(status_code=401, detail="Email atau password admin salah")
    
    token = create_access_token(data={"sub": admin.id_admin, "user_type": "admin"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_type": "admin",
    }


@app.post("/auth/pendonor/register", response_model=PendonorResponse, status_code=201)
def register_pendonor(pendonor_data: PendonorCreate, db: Session = Depends(get_db)):
    """
    Registrasi pendonor sukarela baru.
    
    Data yang diperlukan:
    - Nama lengkap
    - Jenis kelamin (Laki-laki / Perempuan)
    - Berat badan (kg)
    - Tinggi badan (cm)
    - Golongan darah (O+, O-, A+, A-, B+, B-, AB+, AB-)
    - Usia (18-100 tahun)
    - Tanggal lahir
    - Alamat
    - No. Telepon
    """
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
    usia_min: int = Query(None, ge=18),
    usia_max: int = Query(None, le=100),
    db: Session = Depends(get_db),
):
    """
    Ambil daftar pendonor dengan filter & pagination.
    Filter:
    - nama: Cari berdasarkan nama
    - jenis_kelamin: Laki-laki atau Perempuan
    - golongan_darah: O+, O-, A+, A-, B+, B-, AB+, AB-
    - usia_min & usia_max: Range usia
    """
    return crud.get_pendonor_all(
        db=db,
        skip=skip,
        limit=limit,
        nama=nama,
        jenis_kelamin=jenis_kelamin,
        golongan_darah=golongan_darah,
        usia_min=usia_min,
        usia_max=usia_max,
    )


@app.get("/pendonor/{pendonor_id}", response_model=PendonorResponse)
def get_pendonor(pendonor_id: int, db: Session = Depends(get_db)):
    """Ambil detail pendonor berdasarkan ID."""
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
    """Update data pendonor. Hanya field yang dikirim yang akan diupdate."""
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
    """Hapus data pendonor. Hanya admin yang bisa."""
    success = crud.delete_pendonor(db=db, pendonor_id=pendonor_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Pendonor {pendonor_id} tidak ditemukan")
    return None


# ==================== GAMIFIKASI ENDPOINTS ====================

@app.get("/pendonor/{pendonor_id}/gamifikasi", response_model=GamifikasiResponse)
def get_gamifikasi_pendonor(pendonor_id: int, db: Session = Depends(get_db)):
    """Ambil data gamifikasi (point & voucher) pendonor."""
    gamifikasi = crud.get_gamifikasi_by_pendonor(db=db, pendonor_id=pendonor_id)
    if not gamifikasi:
        raise HTTPException(status_code=404, detail=f"Gamifikasi untuk pendonor {pendonor_id} tidak ditemukan")
    return gamifikasi


# ==================== RIWAYAT DONOR ENDPOINTS ====================

@app.post("/riwayat-donor", response_model=RiwayatDonorResponse, status_code=201)
def create_riwayat_donor(
    riwayat_data: RiwayatDonorCreate,
    db: Session = Depends(get_db),
):
    """
    Buat riwayat donor baru. Pendonor melaporkan telah melakukan donor darah.
    Data akan masuk status PENDING menunggu verifikasi admin.
    """
    riwayat = crud.create_riwayat_donor(db=db, riwayat_data=riwayat_data)
    if not riwayat:
        raise HTTPException(status_code=404, detail=f"Pendonor {riwayat_data.id_pendonor} tidak ditemukan")
    return riwayat


@app.get("/riwayat-donor/pendonor/{pendonor_id}", response_model=RiwayatDonorListResponse)
def get_riwayat_donor_pendonor(
    pendonor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Ambil riwayat donor berdasarkan pendonor dengan pagination."""
    return crud.get_riwayat_donor_by_pendonor(db=db, pendonor_id=pendonor_id, skip=skip, limit=limit)


@app.get("/riwayat-donor/pending", response_model=RiwayatDonorListResponse)
def get_pending_verification(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Ambil riwayat donor yang menunggu verifikasi admin. Hanya admin yang bisa akses."""
    return crud.get_riwayat_donor_pending(db=db, skip=skip, limit=limit)


@app.get("/riwayat-donor/{riwayat_id}", response_model=RiwayatDonorResponse)
def get_riwayat_donor(riwayat_id: int, db: Session = Depends(get_db)):
    """Ambil detail riwayat donor berdasarkan ID."""
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
    """
    Verifikasi riwayat donor oleh admin. 
    Status dapat: approved, rejected, pending
    
    Jika disetujui:
    - Tanggal terakhir donor pendonor akan diupdate
    - Jumlah riwayat donor akan ditambah
    - Point gamifikasi akan ditambah 10
    """
    verified = crud.verifikasi_riwayat_donor(
        db=db,
        riwayat_id=riwayat_id,
        verifikasi_data=verifikasi_data,
        admin_id=current_admin.id_admin,
    )
    if not verified:
        raise HTTPException(status_code=404, detail=f"Riwayat donor {riwayat_id} tidak ditemukan")
    return verified


# ==================== RIWAYAT KESEHATAN ENDPOINTS ====================

@app.post("/riwayat-kesehatan", response_model=RiwayatKesehatanResponse, status_code=201)
def create_riwayat_kesehatan(
    kesehatan_data: RiwayatKesehatanCreate,
    db: Session = Depends(get_db),
):
    """
    Tambah riwayat kesehatan pendonor.
    Contoh keterangan: "Punya riwayat hipertensi", "Sedang mengonsumsi obat tertentu", dll.
    """
    kesehatan = crud.create_riwayat_kesehatan(db=db, kesehatan_data=kesehatan_data)
    if not kesehatan:
        raise HTTPException(status_code=404, detail=f"Pendonor {kesehatan_data.id_pendonor} tidak ditemukan")
    return kesehatan


@app.get("/riwayat-kesehatan/pendonor/{pendonor_id}")
def get_riwayat_kesehatan_pendonor(pendonor_id: int, db: Session = Depends(get_db)):
    """Ambil semua riwayat kesehatan pendonor."""
    kesehatan_list = crud.get_riwayat_kesehatan_by_pendonor(db=db, pendonor_id=pendonor_id)
    return {"total": len(kesehatan_list), "riwayat_kesehatan": kesehatan_list}


@app.get("/riwayat-kesehatan/{kesehatan_id}", response_model=RiwayatKesehatanResponse)
def get_riwayat_kesehatan(kesehatan_id: int, db: Session = Depends(get_db)):
    """Ambil detail riwayat kesehatan berdasarkan ID."""
    kesehatan = crud.get_riwayat_kesehatan(db=db, kesehatan_id=kesehatan_id)
    if not kesehatan:
        raise HTTPException(status_code=404, detail=f"Riwayat kesehatan {kesehatan_id} tidak ditemukan")
    return kesehatan


@app.put("/riwayat-kesehatan/{kesehatan_id}", response_model=RiwayatKesehatanResponse)
def update_riwayat_kesehatan(
    kesehatan_id: int,
    keterangan: str,
    db: Session = Depends(get_db),
):
    """Update keterangan riwayat kesehatan."""
    updated = crud.update_riwayat_kesehatan(db=db, kesehatan_id=kesehatan_id, keterangan=keterangan)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Riwayat kesehatan {kesehatan_id} tidak ditemukan")
    return updated


@app.delete("/riwayat-kesehatan/{kesehatan_id}", status_code=204)
def delete_riwayat_kesehatan(
    kesehatan_id: int,
    db: Session = Depends(get_db),
):
    """Hapus riwayat kesehatan."""
    success = crud.delete_riwayat_kesehatan(db=db, kesehatan_id=kesehatan_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Riwayat kesehatan {kesehatan_id} tidak ditemukan")
    return None


# ==================== STATISTIK ENDPOINTS ====================

@app.get("/stats/pendonor", response_model=PendonorStatsResponse)
def get_pendonor_statistics(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """
    Ambil statistik pendonor. Hanya admin yang bisa akses.
    
    Statistik mencakup:
    - Total pendonor
    - Pendonor berdasarkan golongan darah
    - Pendonor berdasarkan jenis kelamin
    """
    stats = crud.get_pendonor_stats(db=db)
    return stats


# ==================== SYSTEM INFO ====================

@app.get("/info")
def system_info():
    """Informasi sistem TraceIt."""
    return {
        "sistem": "TraceIt - Sistem Manajemen Pendonor Darah ITK",
        "deskripsi": "Aplikasi berbasis web untuk pendataan pendonor darah sukarela di lingkungan civitas akademika ITK",
        "version": "1.0.0",
        "fitur_utama": [
            "Registrasi data pendonor",
            "Pencatatan riwayat donor",
            "Pencatatan riwayat kesehatan",
            "Verifikasi data oleh admin",
            "Gamifikasi (point & voucher)",
            "Filter pendonor (nama, golongan darah, usia, jenis kelamin)",
            "Statistik pendonor",
        ],
    }
