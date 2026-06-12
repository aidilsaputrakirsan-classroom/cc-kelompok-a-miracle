"""Pydantic schemas TraceLT Donor Service — sesuai backend/schemas.py."""
import re
from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class GolonganDarahEnum(str, Enum):
    O_POSITIF = "O+"
    O_NEGATIF = "O-"
    A_POSITIF = "A+"
    A_NEGATIF = "A-"
    B_POSITIF = "B+"
    B_NEGATIF = "B-"
    AB_POSITIF = "AB+"
    AB_NEGATIF = "AB-"


class JenisKelaminEnum(str, Enum):
    LAKI_LAKI = "Laki-laki"
    PEREMPUAN = "Perempuan"


# ==================== PENDONOR ====================

class PendonorCreate(BaseModel):
    nama_lengkap: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    jenis_kelamin: JenisKelaminEnum
    berat_badan: float = Field(..., gt=0, le=300)
    tinggi_badan: float = Field(..., gt=0, le=300)
    golongan_darah: GolonganDarahEnum
    umur: int = Field(..., ge=17, le=120)
    tanggal_lahir: date
    tanggal_terakhir_donor: Optional[date] = None
    total_donor: int = Field(default=0, ge=0, le=200)
    alamat: str = Field(..., min_length=5, max_length=500)
    no_telepon: str = Field(..., min_length=8, max_length=30)
    riwayat_kesehatan: Optional[str] = Field(None, max_length=2000)

    @field_validator("no_telepon")
    @classmethod
    def validate_no_telepon(cls, v: str) -> str:
        if not re.match(r"^[0-9+\-\s]+$", v):
            raise ValueError("Nomor telepon hanya boleh berisi angka, +, -, spasi")
        return v


class PendonorUpdate(BaseModel):
    nama_lengkap: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    jenis_kelamin: Optional[JenisKelaminEnum] = None
    berat_badan: Optional[float] = Field(None, gt=0, le=300)
    tinggi_badan: Optional[float] = Field(None, gt=0, le=300)
    golongan_darah: Optional[GolonganDarahEnum] = None
    umur: Optional[int] = Field(None, ge=17, le=120)
    tanggal_lahir: Optional[date] = None
    tanggal_terakhir_donor: Optional[date] = None
    total_donor: Optional[int] = Field(None, ge=0, le=200)
    alamat: Optional[str] = Field(None, min_length=5, max_length=500)
    no_telepon: Optional[str] = Field(None, min_length=8, max_length=30)
    riwayat_kesehatan: Optional[str] = Field(None, max_length=2000)


class PendonorResponse(BaseModel):
    id_pendonor: int
    nama_lengkap: str
    email: str
    jenis_kelamin: JenisKelaminEnum
    berat_badan: float
    tinggi_badan: float
    golongan_darah: GolonganDarahEnum
    umur: int
    tanggal_lahir: date
    tanggal_terakhir_donor: Optional[date] = None
    total_donor: int
    alamat: str
    no_telepon: str
    riwayat_kesehatan: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PendonorListResponse(BaseModel):
    total: int
    pendonor: list[PendonorResponse]


# ==================== RIWAYAT DONOR ====================

class RiwayatDonorCreate(BaseModel):
    id_pendonor: int
    golongan_darah: Optional[GolonganDarahEnum] = None


class RiwayatDonorUpdate(BaseModel):
    id_pendonor: Optional[int] = None
    golongan_darah: Optional[GolonganDarahEnum] = None


class RiwayatDonorVerifikasi(BaseModel):
    status_verifikasi: bool


class RiwayatDonorResponse(BaseModel):
    id_riwayat: int
    id_pendonor: int
    id_pengguna: Optional[int] = None
    golongan_darah: GolonganDarahEnum
    status_verifikasi: bool

    class Config:
        from_attributes = True


class RiwayatDonorListResponse(BaseModel):
    total: int
    riwayat_donor: list[RiwayatDonorResponse]


# ==================== PUBLIC ====================

class BloodStockItem(BaseModel):
    golongan_darah: str
    jumlah_stok: int


class PublicBloodStockResponse(BaseModel):
    blood_stock: list[BloodStockItem]


# ==================== STATS (degraded mode) ====================

class PendonorStatsResponse(BaseModel):
    total_pendonor: int
    per_golongan_darah: dict[str, int]
    mode: str = "full"


# ==================== PENGGUNA ME ====================

class PenggunaMeResponse(BaseModel):
    """
    Profil pengguna yang sedang login.
    Data bersumber dari payload token yang diverifikasi Auth Service,
    bukan dari database lokal item-service (yang tidak menyimpan tabel pengguna).
    Ini adalah representasi minimal, balance dengan PenggunaResponse di backend.
    """
    user_id: Optional[int] = None
    email: str
    nama_pengguna: str
    user_type: str = "pengguna"
