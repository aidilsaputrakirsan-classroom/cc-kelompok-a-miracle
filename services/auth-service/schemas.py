"""Pydantic schemas for TraceIt Auth Service."""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=2, max_length=200)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password harus mengandung minimal 1 huruf besar")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password harus mengandung minimal 1 angka")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Nama minimal 2 karakter")
        return v.strip()


# Skema untuk registrasi via endpoint /pengguna/register
class PenggunaCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    nama_pengguna: str = Field(..., min_length=2, max_length=200)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password harus mengandung minimal 1 huruf besar")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password harus mengandung minimal 1 angka")
        return v

    @field_validator("nama_pengguna")
    @classmethod
    def validate_nama(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Nama minimal 2 karakter")
        return v.strip()


# Skema untuk registrasi via endpoint /admin/register
class AdminCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    nama_admin: str = Field(..., min_length=2, max_length=200)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password harus mengandung minimal 1 huruf besar")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password harus mengandung minimal 1 angka")
        return v

    @field_validator("nama_admin")
    @classmethod
    def validate_nama(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Nama minimal 2 karakter")
        return v.strip()


class UserResponse(BaseModel):
    id: int
    email: str
    name: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenVerifyResponse(BaseModel):
    user_id: int
    email: str
    name: str
    # Alias fields expected by item-service / frontend
    nama_pengguna: Optional[str] = None
    user_type: str = "pengguna"
