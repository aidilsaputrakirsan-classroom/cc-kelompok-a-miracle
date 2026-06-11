"""Pydantic schemas for TraceIt Auth Service."""
from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


# Skema untuk registrasi via endpoint /pengguna/register
class PenggunaCreate(BaseModel):
    email: EmailStr
    password: str
    nama_pengguna: str


# Skema untuk registrasi via endpoint /admin/register
class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    nama_admin: str


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