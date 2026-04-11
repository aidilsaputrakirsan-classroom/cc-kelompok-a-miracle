from sqlalchemy import func
from sqlalchemy.orm import Session
from auth import hash_password, verify_password
from models import Admin, Pendonor, RiwayatDonor, GolonganDarahEnum
from schemas import AdminCreate, PendonorCreate, PendonorUpdate, RiwayatDonorCreate, RiwayatDonorVerifikasi


def create_admin(db: Session, admin_data: AdminCreate) -> Admin | None:
    existing = db.query(Admin).filter(Admin.email == admin_data.email).first()
    if existing:
        return None

    db_admin = Admin(
        nama_admin=admin_data.nama_admin,
        email=admin_data.email,
        password=hash_password(admin_data.password),
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin


def authenticate_admin(db: Session, email: str, password: str) -> Admin | None:
    admin = db.query(Admin).filter(Admin.email == email).first()
    if not admin:
        return None
    if not verify_password(password, admin.password):
        return None
    return admin


def get_admin(db: Session, admin_id: int) -> Admin | None:
    return db.query(Admin).filter(Admin.id_admin == admin_id).first()


def create_pendonor(db: Session, pendonor_data: PendonorCreate) -> Pendonor:
    db_pendonor = Pendonor(**pendonor_data.model_dump())
    db.add(db_pendonor)
    db.commit()
    db.refresh(db_pendonor)
    return db_pendonor


def get_pendonor(db: Session, pendonor_id: int) -> Pendonor | None:
    return db.query(Pendonor).filter(Pendonor.id_pendonor == pendonor_id).first()


def get_pendonor_all(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    nama: str | None = None,
    jenis_kelamin: str | None = None,
    golongan_darah: str | None = None,
    umur_min: int | None = None,
    umur_max: int | None = None,
):
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
    pendonor = query.order_by(Pendonor.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "pendonor": pendonor}


def update_pendonor(db: Session, pendonor_id: int, pendonor_data: PendonorUpdate) -> Pendonor | None:
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
    db_pendonor = db.query(Pendonor).filter(Pendonor.id_pendonor == pendonor_id).first()
    if not db_pendonor:
        return False

    db.delete(db_pendonor)
    db.commit()
    return True


def create_riwayat_donor(db: Session, riwayat_data: RiwayatDonorCreate) -> RiwayatDonor | None:
    pendonor = db.query(Pendonor).filter(Pendonor.id_pendonor == riwayat_data.id_pendonor).first()
    if not pendonor:
        return None

    donor_golongan_darah = riwayat_data.golongan_darah or pendonor.golongan_darah

    db_riwayat = RiwayatDonor(
        id_pendonor=riwayat_data.id_pendonor,
        golongan_darah=donor_golongan_darah,
        status_verifikasi=False,
    )
    db.add(db_riwayat)
    db.commit()
    db.refresh(db_riwayat)
    return db_riwayat


def get_riwayat_donor(db: Session, riwayat_id: int) -> RiwayatDonor | None:
    return db.query(RiwayatDonor).filter(RiwayatDonor.id_riwayat == riwayat_id).first()


def get_riwayat_donor_all(db: Session, skip: int = 0, limit: int = 20, status_verifikasi: bool | None = None):
    query = db.query(RiwayatDonor)
    if status_verifikasi is not None:
        query = query.filter(RiwayatDonor.status_verifikasi == status_verifikasi)

    total = query.count()
    riwayat = query.order_by(RiwayatDonor.id_riwayat.desc()).offset(skip).limit(limit).all()
    return {"total": total, "riwayat_donor": riwayat}


def get_riwayat_donor_by_pendonor(db: Session, pendonor_id: int, skip: int = 0, limit: int = 20):
    query = db.query(RiwayatDonor).filter(RiwayatDonor.id_pendonor == pendonor_id)
    total = query.count()
    riwayat = query.order_by(RiwayatDonor.id_riwayat.desc()).offset(skip).limit(limit).all()
    return {"total": total, "riwayat_donor": riwayat}


def verifikasi_riwayat_donor(db: Session, riwayat_id: int, verifikasi_data: RiwayatDonorVerifikasi) -> RiwayatDonor | None:
    db_riwayat = db.query(RiwayatDonor).filter(RiwayatDonor.id_riwayat == riwayat_id).first()
    if not db_riwayat:
        return None

    db_riwayat.status_verifikasi = verifikasi_data.status_verifikasi

    if verifikasi_data.status_verifikasi:
        pendonor = db.query(Pendonor).filter(Pendonor.id_pendonor == db_riwayat.id_pendonor).first()
        if pendonor:
            pendonor.total_donor = (pendonor.total_donor or 0) + 1

    db.commit()
    db.refresh(db_riwayat)
    return db_riwayat


def get_pendonor_stats(db: Session) -> dict:
    total_pendonor = db.query(func.count(Pendonor.id_pendonor)).scalar() or 0
    darah_stats = (
        db.query(Pendonor.golongan_darah, func.count(Pendonor.id_pendonor))
        .group_by(Pendonor.golongan_darah)
        .all()
    )
    kelamin_stats = (
        db.query(Pendonor.jenis_kelamin, func.count(Pendonor.id_pendonor))
        .group_by(Pendonor.jenis_kelamin)
        .all()
    )

    return {
        "total_pendonor": total_pendonor,
        "pendonor_by_golongan_darah": {str(k): v for k, v in darah_stats},
        "pendonor_by_jenis_kelamin": {str(k): v for k, v in kelamin_stats},
    }


def get_public_blood_stock(db: Session) -> dict:
    darah_stats = (
        db.query(Pendonor.golongan_darah, func.count(Pendonor.id_pendonor))
        .group_by(Pendonor.golongan_darah)
        .all()
    )

    darah_count_map = {
        (golongan.value if hasattr(golongan, "value") else str(golongan)): total
        for golongan, total in darah_stats
    }

    stock_list = [
        {
            "golongan_darah": golongan.value,
            "jumlah_stok": darah_count_map.get(golongan.value, 0),
        }
        for golongan in GolonganDarahEnum
    ]

    return {"blood_stock": stock_list}