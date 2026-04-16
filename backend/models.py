from sqlalchemy import Column, Date, DateTime, Enum, Float, Integer, String, Text, Boolean, ForeignKey, inspect, text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base, engine
import enum


def ensure_schema_compatibility() -> None:
    """Pastikan schema lama tetap kompatibel dengan model backend terbaru."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        table_names = inspector.get_table_names()

        if "riwayat_donor" not in table_names:
            return

        riwayat_columns = {col["name"]: col for col in inspector.get_columns("riwayat_donor")}
        if "id_pengguna" in riwayat_columns:
            return

        connection.execute(
            text(
                "ALTER TABLE riwayat_donor "
                "ADD COLUMN id_pengguna INTEGER REFERENCES pengguna(id_pengguna)"
            )
        )

class GolonganDarahEnum(str, enum.Enum):
    O_POSITIF = "O+"
    O_NEGATIF = "O-"
    A_POSITIF = "A+"
    A_NEGATIF = "A-"
    B_POSITIF = "B+"
    B_NEGATIF = "B-"
    AB_POSITIF = "AB+"
    AB_NEGATIF = "AB-"

class JenisKelaminEnum(str, enum.Enum):
    LAKI_LAKI = "Laki-laki"
    PEREMPUAN = "Perempuan"


class Admin(Base):
    __tablename__ = "admin"

    id_admin = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nama_admin = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)


class Pengguna(Base):
    __tablename__ = "pengguna"

    id_pengguna = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nama_pengguna = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    riwayat_donor = relationship("RiwayatDonor", back_populates="pengguna")


class Pendonor(Base):
    __tablename__ = "pendonor"

    id_pendonor = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nama_lengkap = Column(String(100), nullable=False, index=True)
    jenis_kelamin = Column(Enum(JenisKelaminEnum), nullable=False)
    berat_badan = Column(Float, nullable=False)
    tinggi_badan = Column(Float, nullable=False)
    golongan_darah = Column(Enum(GolonganDarahEnum), nullable=False, index=True)
    umur = Column(Integer, nullable=False)
    tanggal_lahir = Column(Date, nullable=False)
    tanggal_terakhir_donor = Column(Date, nullable=True)
    total_donor = Column(Integer, nullable=False, default=0)
    alamat = Column(Text, nullable=False)
    email = Column(String(255), nullable=False, index=True)
    no_telepon = Column(String(30), nullable=False)
    riwayat_kesehatan = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    riwayat_donor = relationship("RiwayatDonor", back_populates="pendonor", cascade="all, delete-orphan")


class RiwayatDonor(Base):
    __tablename__ = "riwayat_donor"

    id_riwayat = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_pendonor = Column(Integer, ForeignKey("pendonor.id_pendonor"), nullable=False, index=True)
    id_pengguna = Column(Integer, ForeignKey("pengguna.id_pengguna"), nullable=True, index=True)
    golongan_darah = Column(Enum(GolonganDarahEnum), nullable=False)
    status_verifikasi = Column(Boolean, nullable=False, default=False)

    pendonor = relationship("Pendonor", back_populates="riwayat_donor")
    pengguna = relationship("Pengguna", back_populates="riwayat_donor")