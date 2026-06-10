"""Pydantic schemas for TraceIt Auth Service."""
# Mendefinisikan struktur data (skema) untuk request dan response yang digunakan dalam proses autentikasi dan manajemen pengguna
from pydantic import BaseModel, EmailStr

# Skema untuk data pendaftaran pengguna baru (Registrasi)
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

# Skema untuk data profil pengguna yang dikembalikan ke klien.
class UserResponse(BaseModel):
    id: int
    email: str
    name: str

# Konfigurasi Pydantic
    class Config:
        from_attributes = True

# Skema untuk data kredensial saat pengguna melakukan login.
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Skema untuk response setelah berhasil login, berisi JWT Access Token
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Skema untuk data yang dikembalikan setelah token JWT berhasil diverifikas
class TokenVerifyResponse(BaseModel):
    user_id: int
    email: str
    name: str