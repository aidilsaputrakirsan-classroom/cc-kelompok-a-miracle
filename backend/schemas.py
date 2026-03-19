from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime, date
from enum import Enum
import re


# ==================== ENUM SCHEMAS ====================

class GolonganDarahEnum(str, Enum):
    """Enum untuk golongan darah."""
    O_POSITIF = "O+"
    O_NEGATIF = "O-"
    A_POSITIF = "A+"
    A_NEGATIF = "A-"
    B_POSITIF = "B+"
    B_NEGATIF = "B-"
    AB_POSITIF = "AB+"
    AB_NEGATIF = "AB-"


class JenisKelaminEnum(str, Enum):
    """Enum untuk jenis kelamin."""
    LAKI_LAKI = "Laki-laki"
    PEREMPUAN = "Perempuan"


class StatusVerifikasiEnum(str, Enum):
    """Enum untuk status verifikasi."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# ==================== ADMIN SCHEMAS ====================

class AdminCreate(BaseModel):
    """Schema untuk membuat admin baru."""
    email: EmailStr = Field(..., examples=["admin@itk.ac.id"])
    name: str = Field(..., min_length=2, max_length=100, examples=["Admin ITK"])
    password: str = Field(..., min_length=8, examples=["AdminPass123!"])

    @field_validator("password")
    def validate_password_strength(cls, v):
        """Validasi kekuatan password."""
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password harus mengandung minimal 1 huruf besar")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password harus mengandung minimal 1 huruf kecil")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password harus mengandung minimal 1 angka")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password harus mengandung minimal 1 karakter spesial (!@#$%^&*)")
        return v


class AdminResponse(BaseModel):
    """Schema untuk response admin (tanpa password)."""
    id_admin: int
    email: str
    name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== PENDONOR SCHEMAS ====================

class PendonorCreate(BaseModel):
    """Schema untuk registrasi pendonor baru."""
    nama_lengkap: str = Field(..., min_length=2, max_length=100, examples=["Budi Santoso"])
    jenis_kelamin: JenisKelaminEnum = Field(..., examples=["Laki-laki"])
    berat_badan: float = Field(..., gt=0, le=200, examples=[70.5])  # kg
    tinggi_badan: float = Field(..., gt=0, le=250, examples=[175.0])  # cm
    golongan_darah: GolonganDarahEnum = Field(..., examples=["O+"])
    usia: int = Field(..., ge=18, le=100, examples=[25])
    tanggal_lahir: date = Field(..., examples=["1999-05-15"])
    alamat: str = Field(..., min_length=5, max_length=255, examples=["Jl. Diponegoro No 1"])
    no_telepon: str = Field(..., min_length=10, max_length=20, examples=["081234567890"])


class PendonorUpdate(BaseModel):
    """Schema untuk update data pendonor."""
    nama_lengkap: Optional[str] = Field(None, min_length=2, max_length=100)
    jenis_kelamin: Optional[JenisKelaminEnum] = None
    berat_badan: Optional[float] = Field(None, gt=0, le=200)
    tinggi_badan: Optional[float] = Field(None, gt=0, le=250)
    usia: Optional[int] = Field(None, ge=18, le=100)
    alamat: Optional[str] = Field(None, min_length=5, max_length=255)
    no_telepon: Optional[str] = Field(None, min_length=10, max_length=20)
    tanggal_terakhir_donor: Optional[date] = None


class PendonorResponse(BaseModel):
    """Schema untuk response pendonor."""
    id_pendonor: int
    nama_lengkap: str
    jenis_kelamin: str
    berat_badan: float
    tinggi_badan: float
    golongan_darah: str
    usia: int
    tanggal_lahir: date
    tanggal_terakhir_donor: Optional[date] = None
    riwayat_donor_count: int
    alamat: str
    no_telepon: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== GAMIFIKASI SCHEMAS ====================

class GamifikasiResponse(BaseModel):
    """Schema untuk response gamifikasi."""
    id_gamifikasi: int
    id_pendonor: int
    point: int
    voucher: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== RIWAYAT DONOR SCHEMAS ====================

class RiwayatDonorCreate(BaseModel):
    """Schema untuk membuat riwayat donor baru."""
    id_pendonor: int = Field(..., examples=[1])
    tanggal_donor: date = Field(..., examples=["2026-03-19"])
    catatan: Optional[str] = Field(None, examples=["Donor berhasil"])


class RiwayatDonorVerifikasi(BaseModel):
    """Schema untuk verifikasi riwayat donor oleh admin."""
    status_verifikasi: StatusVerifikasiEnum = Field(..., examples=["approved"])
    catatan: Optional[str] = Field(None, examples=["Data sudah diverifikasi"])


class RiwayatDonorResponse(BaseModel):
    """Schema untuk response riwayat donor."""
    id_riwayat: int
    id_pendonor: int
    id_gamifikasi: Optional[int] = None
    tanggal_donor: date
    status_verifikasi: str
    catatan: Optional[str] = None
    id_admin: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== RIWAYAT KESEHATAN SCHEMAS ====================

class RiwayatKesehatanCreate(BaseModel):
    """Schema untuk membuat riwayat kesehatan."""
    id_pendonor: int = Field(..., examples=[1])
    keterangan: str = Field(..., min_length=5, max_length=500, examples=["Punya riwayat darah tinggi"])


class RiwayatKesehatanResponse(BaseModel):
    """Schema untuk response riwayat kesehatan."""
    id_kesehatan: int
    id_pendonor: int
    keterangan: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== AUTH SCHEMAS ====================

class LoginRequest(BaseModel):
    """Schema untuk login request."""
    email: str = Field(..., examples=["user@itk.ac.id"])
    password: str = Field(..., examples=["password123"])


class TokenResponse(BaseModel):
    """Schema untuk response setelah login berhasil."""
    access_token: str
    token_type: str = "bearer"
    user_type: str = Field(..., examples=["admin"])  # "admin" atau "pendonor"


# ==================== FILTER & LIST SCHEMAS ====================

class PendonorFilterRequest(BaseModel):
    """Schema untuk filter daftar pendonor."""
    nama: Optional[str] = Field(None, examples=["Budi"])
    jenis_kelamin: Optional[JenisKelaminEnum] = None
    golongan_darah: Optional[GolonganDarahEnum] = None
    usia_min: Optional[int] = Field(None, ge=18)
    usia_max: Optional[int] = Field(None, le=100)
    skip: int = Field(0, ge=0)
    limit: int = Field(20, ge=1, le=100)


class PendonorListResponse(BaseModel):
    """Schema untuk list pendonor dengan metadata."""
    total: int
    pendonor: list[PendonorResponse]


class RiwayatDonorListResponse(BaseModel):
    """Schema untuk list riwayat donor."""
    total: int
    riwayat_donor: list[RiwayatDonorResponse]


# ==================== STATS SCHEMAS ====================

class PendonorStatsResponse(BaseModel):
    """Schema untuk statistik pendonor."""
    total_pendonor: int
    pendonor_by_golongan_darah: dict
    pendonor_by_jenis_kelamin: dict
    pendonor_siap_donor: int
