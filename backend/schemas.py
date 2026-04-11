from datetime import date, datetime
from enum import Enum
from typing import Optional
import re
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


class AdminCreate(BaseModel):
    nama_admin: str = Field(..., min_length=2, max_length=100, examples=["Admin ITK"])
    email: EmailStr = Field(..., examples=["admin@itk.ac.id"])
    password: str = Field(..., min_length=8, examples=["AdminPass123!"])

    @field_validator("password")
    def validate_password_strength(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password harus mengandung minimal 1 huruf besar")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password harus mengandung minimal 1 huruf kecil")
        if not re.search(r"[0-9]", value):
            raise ValueError("Password harus mengandung minimal 1 angka")
        return value


class AdminResponse(BaseModel):
    id_admin: int
    nama_admin: str
    email: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str = Field(..., examples=["admin@itk.ac.id"])
    password: str = Field(..., examples=["AdminPass123!"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: str = "admin"


class PendonorCreate(BaseModel):
    nama_lengkap: str = Field(..., min_length=2, max_length=100)
    jenis_kelamin: JenisKelaminEnum
    berat_badan: float = Field(..., gt=0, le=300)
    tinggi_badan: float = Field(..., gt=0, le=300)
    golongan_darah: GolonganDarahEnum
    umur: int = Field(..., ge=17, le=120)
    tanggal_lahir: date
    tanggal_terakhir_donor: Optional[date] = None
    total_donor: int = Field(default=0, ge=0)
    alamat: str = Field(..., min_length=5)
    no_telepon: int
    riwayat_kesehatan: Optional[str] = None


class PendonorUpdate(BaseModel):
    nama_lengkap: Optional[str] = Field(None, min_length=2, max_length=100)
    jenis_kelamin: Optional[JenisKelaminEnum] = None
    berat_badan: Optional[float] = Field(None, gt=0, le=300)
    tinggi_badan: Optional[float] = Field(None, gt=0, le=300)
    golongan_darah: Optional[GolonganDarahEnum] = None
    umur: Optional[int] = Field(None, ge=17, le=120)
    tanggal_lahir: Optional[date] = None
    tanggal_terakhir_donor: Optional[date] = None
    total_donor: Optional[int] = Field(None, ge=0)
    alamat: Optional[str] = Field(None, min_length=5)
    no_telepon: Optional[int] = None
    riwayat_kesehatan: Optional[str] = None


class PendonorResponse(BaseModel):
    id_pendonor: int
    nama_lengkap: str
    jenis_kelamin: str
    berat_badan: float
    tinggi_badan: float
    golongan_darah: str
    umur: int
    tanggal_lahir: date
    tanggal_terakhir_donor: Optional[date] = None
    total_donor: int
    alamat: str
    no_telepon: int
    riwayat_kesehatan: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RiwayatDonorCreate(BaseModel):
    id_pendonor: int
    golongan_darah: Optional[GolonganDarahEnum] = None


class RiwayatDonorVerifikasi(BaseModel):
    status_verifikasi: bool


class RiwayatDonorResponse(BaseModel):
    id_riwayat: int
    id_pendonor: int
    golongan_darah: str
    status_verifikasi: bool

    class Config:
        from_attributes = True


class PendonorListResponse(BaseModel):
    total: int
    pendonor: list[PendonorResponse]


class RiwayatDonorListResponse(BaseModel):
    total: int
    riwayat_donor: list[RiwayatDonorResponse]