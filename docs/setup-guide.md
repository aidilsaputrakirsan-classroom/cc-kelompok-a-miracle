# Setup Guide
Panduan ini menjelaskan cara menjalankan aplikasi full-stack dari awal hingga siap digunakan.

## 🧩 1. Prerequisites
Pastikan sudah install:

- Node.js (v18+)
- Python (v3.10+)
- Git

## 📥 2. Clone Repository
git clone https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-miracle.git

cd cc-kelompok-a-miracle

## 💡3. Setup Backend
1. Masuk ke folder backend:

cd .

2. Install dependencies:

pip install -r requirements.txt

3. Jalankan backend:

uvicorn main:app --reload

## 🗄️ 4. Setup Database
Database akan otomatis dibuat saat backend dijalankan.

## 🌐 5. Setup Frontend
1. Masuk ke folder frontend:

cd frontend

2. Install dependencies:

npm install

3. Setup environment variable:

copy .env.example .env

isi .env:

VITE_API_URL=http://localhost:8000

## ▶️ 6. Run Frontend
npm run dev

## 🔗 7. Akses Aplikasi
Frontend: http://localhost:5173  
Backend: http://localhost:8000/docs

## 📝Notes
- Pastikan backend berjalan sebelum frontend
- Jika API tidak terhubung, cek file .env