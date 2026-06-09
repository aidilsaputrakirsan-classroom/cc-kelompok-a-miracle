"""Pengguna model for TraceIt Auth Service."""
# Mendefinisikan model ORM (Object-Relational Mapping) menggunakan SQLAlchemy yang merepresentasikan struktur tabel `users` di dalam database
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

# Model SQLAlchemy untuk tabel 'users'. Menyimpan data informasi akun pengguna untuk keperluan autentikasi
class User(Base):
    # Nama tabel di dalam database
    __tablename__ = "users"

    # Primary key, auto-increment secara default, dan diberi indeks untuk pencarian cepat
    id = Column(Integer, primary_key=True, index=True)

    # Email wajib diisi (nullable=False), tidak boleh kembar (unique=True), dan diberi indeks
    email = Column(String, unique=True, index=True, nullable=False)

    # Nama lengkap pengguna, wajib diisi
    name = Column(String, nullable=False)

    # Password yang sudah di-hash (bukan text mentah) demi keamanan, wajib diisi
    hashed_password = Column(String, nullable=False)

    # Menyimpan waktu pembuatan akun dengan timezone
    created_at = Column(DateTime(timezone=True), server_default=func.now())