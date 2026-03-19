from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


# ==================== ENUM TYPES ====================

class GolonganDarahEnum(str, enum.Enum):
    """Enum untuk golongan darah."""
    O_POSITIF = "O+"
    O_NEGATIF = "O-"
    A_POSITIF = "A+"
    A_NEGATIF = "A-"
    B_POSITIF = "B+"
    B_NEGATIF = "B-"
    AB_POSITIF = "AB+"
    AB_NEGATIF = "AB-"


class JenisKelaminEnum(str, enum.Enum):
    """Enum untuk jenis kelamin."""
    LAKI_LAKI = "Laki-laki"
    PEREMPUAN = "Perempuan"


class StatusVerifikasiEnum(str, enum.Enum):
    """Enum untuk status verifikasi."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# ==================== TABEL: ADMIN ====================

class Admin(Base):
    """Model untuk tabel 'admin'. Admin memverifikasi data pendonor."""
    __tablename__ = "admin"

    id_admin = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    riwayat_donor_verified = relationship("RiwayatDonor", back_populates="admin_verifikasi")

    def __repr__(self):
        return f"<Admin(id={self.id_admin}, email='{self.email}', name='{self.name}')>"


# ==================== TABEL: PENDONOR ====================

class Pendonor(Base):
    """Model untuk tabel 'pendonor'. Civitas akademika yang mendaftar sebagai pendonor."""
    __tablename__ = "pendonor"

    id_pendonor = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nama_lengkap = Column(String(100), nullable=False, index=True)
    jenis_kelamin = Column(Enum(JenisKelaminEnum), nullable=False)
    berat_badan = Column(Float, nullable=False)  # kg
    tinggi_badan = Column(Float, nullable=False)  # cm
    golongan_darah = Column(Enum(GolonganDarahEnum), nullable=False, index=True)
    usia = Column(Integer, nullable=False)  # tahun
    tanggal_lahir = Column(Date, nullable=False)
    tanggal_terakhir_donor = Column(Date, nullable=True)
    riwayat_donor_count = Column(Integer, default=0)  # Total donor
    alamat = Column(Text, nullable=False)
    no_telepon = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    riwayat_donor = relationship("RiwayatDonor", back_populates="pendonor", cascade="all, delete-orphan")
    riwayat_kesehatan = relationship("RiwayatKesehatan", back_populates="pendonor", cascade="all, delete-orphan")
    gamifikasi = relationship("Gamifikasi", back_populates="pendonor", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Pendonor(id={self.id_pendonor}, nama='{self.nama_lengkap}', darah='{self.golongan_darah}')>"


# ==================== TABEL: GAMIFIKASI ====================

class Gamifikasi(Base):
    """Model untuk tabel 'gamifikasi'. Points dan voucher untuk pendonor."""
    __tablename__ = "gamifikasi"

    id_gamifikasi = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_pendonor = Column(Integer, ForeignKey("pendonor.id_pendonor"), nullable=False, index=True)
    point = Column(Integer, default=0)
    voucher = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    pendonor = relationship("Pendonor", back_populates="gamifikasi")
    riwayat_donor = relationship("RiwayatDonor", back_populates="gamifikasi")

    def __repr__(self):
        return f"<Gamifikasi(id={self.id_gamifikasi}, id_pendonor={self.id_pendonor}, point={self.point})>"


# ==================== TABEL: RIWAYAT_DONOR ====================

class RiwayatDonor(Base):
    """Model untuk tabel 'riwayat_donor'. Catatan setiap kali pendonor donor darah."""
    __tablename__ = "riwayat_donor"

    id_riwayat = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_pendonor = Column(Integer, ForeignKey("pendonor.id_pendonor"), nullable=False, index=True)
    id_gamifikasi = Column(Integer, ForeignKey("gamifikasi.id_gamifikasi"), nullable=True)
    tanggal_donor = Column(Date, nullable=False)
    status_verifikasi = Column(Enum(StatusVerifikasiEnum), default=StatusVerifikasiEnum.PENDING)
    catatan = Column(Text, nullable=True)
    id_admin = Column(Integer, ForeignKey("admin.id_admin"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    pendonor = relationship("Pendonor", back_populates="riwayat_donor")
    gamifikasi = relationship("Gamifikasi", back_populates="riwayat_donor")
    admin_verifikasi = relationship("Admin", back_populates="riwayat_donor_verified")

    def __repr__(self):
        return f"<RiwayatDonor(id={self.id_riwayat}, pendonor={self.id_pendonor}, tanggal='{self.tanggal_donor}')>"


# ==================== TABEL: RIWAYAT_KESEHATAN ====================

class RiwayatKesehatan(Base):
    """Model untuk tabel 'riwayat_kesehatan'. Catatan kesehatan pendonor."""
    __tablename__ = "riwayat_kesehatan"

    id_kesehatan = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_pendonor = Column(Integer, ForeignKey("pendonor.id_pendonor"), nullable=False, index=True)
    keterangan = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    pendonor = relationship("Pendonor", back_populates="riwayat_kesehatan")

    def __repr__(self):
        return f"<RiwayatKesehatan(id={self.id_kesehatan}, pendonor={self.id_pendonor})>"