from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from datetime import date
from models import Admin, Pendonor, RiwayatDonor, Gamifikasi, RiwayatKesehatan
from schemas import (
    AdminCreate, PendonorCreate, PendonorUpdate, RiwayatDonorCreate, RiwayatDonorVerifikasi,
    RiwayatKesehatanCreate
)
from auth import hash_password, verify_password


# ==================== ADMIN CRUD ====================

def create_admin(db: Session, admin_data: AdminCreate) -> Admin | None:
    """Buat admin baru. Cek apakah email sudah terdaftar."""
    existing = db.query(Admin).filter(Admin.email == admin_data.email).first()
    if existing:
        return None  # Email sudah terdaftar

    db_admin = Admin(
        email=admin_data.email,
        name=admin_data.name,
        hashed_password=hash_password(admin_data.password),
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin


def authenticate_admin(db: Session, email: str, password: str) -> Admin | None:
    """Autentikasi admin berdasarkan email & password."""
    admin = db.query(Admin).filter(Admin.email == email).first()
    if not admin:
        return None
    if not verify_password(password, admin.hashed_password):
        return None
    return admin


def get_admin(db: Session, admin_id: int) -> Admin | None:
    """Ambil admin berdasarkan ID."""
    return db.query(Admin).filter(Admin.id_admin == admin_id).first()


# ==================== PENDONOR CRUD ====================

def create_pendonor(db: Session, pendonor_data: PendonorCreate) -> Pendonor:
    """Buat pendonor baru."""
    db_pendonor = Pendonor(**pendonor_data.model_dump())
    db.add(db_pendonor)
    db.commit()
    db.refresh(db_pendonor)
    
    # Buat gamifikasi untuk pendonor baru
    db_gamifikasi = Gamifikasi(id_pendonor=db_pendonor.id_pendonor, point=0)
    db.add(db_gamifikasi)
    db.commit()
    
    return db_pendonor


def get_pendonor(db: Session, pendonor_id: int) -> Pendonor | None:
    """Ambil pendonor berdasarkan ID."""
    return db.query(Pendonor).filter(Pendonor.id_pendonor == pendonor_id).first()


def get_pendonor_all(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    nama: str = None,
    jenis_kelamin: str = None,
    golongan_darah: str = None,
    usia_min: int = None,
    usia_max: int = None,
):
    """Ambil daftar pendonor dengan filter dan pagination."""
    query = db.query(Pendonor)
    
    # Apply filters
    if nama:
        query = query.filter(Pendonor.nama_lengkap.ilike(f"%{nama}%"))
    if jenis_kelamin:
        query = query.filter(Pendonor.jenis_kelamin == jenis_kelamin)
    if golongan_darah:
        query = query.filter(Pendonor.golongan_darah == golongan_darah)
    if usia_min:
        query = query.filter(Pendonor.usia >= usia_min)
    if usia_max:
        query = query.filter(Pendonor.usia <= usia_max)
    
    total = query.count()
    pendonor = query.order_by(Pendonor.created_at.desc()).offset(skip).limit(limit).all()
    
    return {"total": total, "pendonor": pendonor}


def update_pendonor(db: Session, pendonor_id: int, pendonor_data: PendonorUpdate) -> Pendonor | None:
    """Update data pendonor."""
    db_pendonor = db.query(Pendonor).filter(Pendonor.id_pendonor == pendonor_id).first()
    
    if not db_pendonor:
        return None
    
    update_data = pendonor_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_pendonor, field, value)
    
    db.commit()
    db.refresh(db_pendonor)
    return db_pendonor


def delete_pendonor(db: Session, pendonor_id: int) -> bool:
    """Hapus pendonor berdasarkan ID."""
    db_pendonor = db.query(Pendonor).filter(Pendonor.id_pendonor == pendonor_id).first()
    
    if not db_pendonor:
        return False
    
    db.delete(db_pendonor)
    db.commit()
    return True


# ==================== GAMIFIKASI CRUD ====================

def get_gamifikasi(db: Session, gamifikasi_id: int) -> Gamifikasi | None:
    """Ambil gamifikasi berdasarkan ID."""
    return db.query(Gamifikasi).filter(Gamifikasi.id_gamifikasi == gamifikasi_id).first()


def get_gamifikasi_by_pendonor(db: Session, pendonor_id: int) -> Gamifikasi | None:
    """Ambil gamifikasi berdasarkan ID pendonor."""
    return db.query(Gamifikasi).filter(Gamifikasi.id_pendonor == pendonor_id).first()


def update_gamifikasi_point(
    db: Session, pendonor_id: int, tambah_point: int = 10
) -> Gamifikasi | None:
    """Update point gamifikasi (tambah point setiap donor)."""
    gamifikasi = db.query(Gamifikasi).filter(Gamifikasi.id_pendonor == pendonor_id).first()
    
    if not gamifikasi:
        return None
    
    gamifikasi.point += tambah_point
    db.commit()
    db.refresh(gamifikasi)
    return gamifikasi


# ==================== RIWAYAT DONOR CRUD ====================

def create_riwayat_donor(db: Session, riwayat_data: RiwayatDonorCreate) -> RiwayatDonor | None:
    """Buat riwayat donor baru."""
    # Cek apakah pendonor ada
    pendonor = db.query(Pendonor).filter(Pendonor.id_pendonor == riwayat_data.id_pendonor).first()
    if not pendonor:
        return None
    
    # Buat riwayat donor
    db_riwayat = RiwayatDonor(**riwayat_data.model_dump())
    db.add(db_riwayat)
    db.commit()
    db.refresh(db_riwayat)
    return db_riwayat


def get_riwayat_donor(db: Session, riwayat_id: int) -> RiwayatDonor | None:
    """Ambil riwayat donor berdasarkan ID."""
    return db.query(RiwayatDonor).filter(RiwayatDonor.id_riwayat == riwayat_id).first()


def get_riwayat_donor_by_pendonor(
    db: Session,
    pendonor_id: int,
    skip: int = 0,
    limit: int = 20,
):
    """Ambil riwayat donor berdasarkan pendonor dengan pagination."""
    query = db.query(RiwayatDonor).filter(RiwayatDonor.id_pendonor == pendonor_id)
    
    total = query.count()
    riwayat = query.order_by(RiwayatDonor.tanggal_donor.desc()).offset(skip).limit(limit).all()
    
    return {"total": total, "riwayat_donor": riwayat}


def get_riwayat_donor_pending(db: Session, skip: int = 0, limit: int = 20):
    """Ambil riwayat donor yang masih pending verifikasi."""
    query = db.query(RiwayatDonor).filter(RiwayatDonor.status_verifikasi == "pending")
    
    total = query.count()
    riwayat = query.order_by(RiwayatDonor.created_at.desc()).offset(skip).limit(limit).all()
    
    return {"total": total, "riwayat_donor": riwayat}


def verifikasi_riwayat_donor(
    db: Session,
    riwayat_id: int,
    verifikasi_data: RiwayatDonorVerifikasi,
    admin_id: int,
) -> RiwayatDonor | None:
    """Verifikasi riwayat donor oleh admin."""
    db_riwayat = db.query(RiwayatDonor).filter(RiwayatDonor.id_riwayat == riwayat_id).first()
    
    if not db_riwayat:
        return None
    
    db_riwayat.status_verifikasi = verifikasi_data.status_verifikasi
    db_riwayat.catatan = verifikasi_data.catatan
    db_riwayat.id_admin = admin_id
    
    # Jika disetujui, update last donation date dan count
    if verifikasi_data.status_verifikasi == "approved":
        pendonor = db.query(Pendonor).filter(Pendonor.id_pendonor == db_riwayat.id_pendonor).first()
        if pendonor:
            pendonor.tanggal_terakhir_donor = db_riwayat.tanggal_donor
            pendonor.riwayat_donor_count += 1
            
            # Update point gamifikasi
            update_gamifikasi_point(db, db_riwayat.id_pendonor, tambah_point=10)
    
    db.commit()
    db.refresh(db_riwayat)
    return db_riwayat


# ==================== RIWAYAT KESEHATAN CRUD ====================

def create_riwayat_kesehatan(
    db: Session, kesehatan_data: RiwayatKesehatanCreate
) -> RiwayatKesehatan | None:
    """Buat riwayat kesehatan baru."""
    pendonor = db.query(Pendonor).filter(Pendonor.id_pendonor == kesehatan_data.id_pendonor).first()
    if not pendonor:
        return None
    
    db_kesehatan = RiwayatKesehatan(**kesehatan_data.model_dump())
    db.add(db_kesehatan)
    db.commit()
    db.refresh(db_kesehatan)
    return db_kesehatan


def get_riwayat_kesehatan(db: Session, kesehatan_id: int) -> RiwayatKesehatan | None:
    """Ambil riwayat kesehatan berdasarkan ID."""
    return db.query(RiwayatKesehatan).filter(RiwayatKesehatan.id_kesehatan == kesehatan_id).first()


def get_riwayat_kesehatan_by_pendonor(db: Session, pendonor_id: int):
    """Ambil riwayat kesehatan berdasarkan pendonor."""
    return (
        db.query(RiwayatKesehatan)
        .filter(RiwayatKesehatan.id_pendonor == pendonor_id)
        .order_by(RiwayatKesehatan.created_at.desc())
        .all()
    )


def update_riwayat_kesehatan(
    db: Session, kesehatan_id: int, keterangan: str
) -> RiwayatKesehatan | None:
    """Update riwayat kesehatan."""
    db_kesehatan = db.query(RiwayatKesehatan).filter(RiwayatKesehatan.id_kesehatan == kesehatan_id).first()
    
    if not db_kesehatan:
        return None
    
    db_kesehatan.keterangan = keterangan
    db.commit()
    db.refresh(db_kesehatan)
    return db_kesehatan


def delete_riwayat_kesehatan(db: Session, kesehatan_id: int) -> bool:
    """Hapus riwayat kesehatan."""
    db_kesehatan = db.query(RiwayatKesehatan).filter(RiwayatKesehatan.id_kesehatan == kesehatan_id).first()
    
    if not db_kesehatan:
        return False
    
    db.delete(db_kesehatan)
    db.commit()
    return True


# ==================== STATISTICS ====================

def get_pendonor_stats(db: Session) -> dict:
    """Ambil statistik pendonor."""
    total_pendonor = db.query(func.count(Pendonor.id_pendonor)).scalar() or 0
    
    # Kelompok by golongan darah
    darah_stats = (
        db.query(Pendonor.golongan_darah, func.count(Pendonor.id_pendonor))
        .group_by(Pendonor.golongan_darah)
        .all()
    )
    pendonor_by_golongan_darah = {darah: count for darah, count in darah_stats}
    
    # Kelompok by jenis kelamin
    kelamin_stats = (
        db.query(Pendonor.jenis_kelamin, func.count(Pendonor.id_pendonor))
        .group_by(Pendonor.jenis_kelamin)
        .all()
    )
    pendonor_by_jenis_kelamin = {kelamin: count for kelamin, count in kelamin_stats}
    
    return {
        "total_pendonor": total_pendonor,
        "pendonor_by_golongan_darah": pendonor_by_golongan_darah,
        "pendonor_by_jenis_kelamin": pendonor_by_jenis_kelamin,
    }

