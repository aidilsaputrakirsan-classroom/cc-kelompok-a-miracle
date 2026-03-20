# 🚀 Setup Guide
Panduan ini menjelaskan cara menjalankan aplikasi full-stack dari awal hingga siap digunakan.

---

## 📋 1. Prerequisites
Pastikan sudah install:

- Node.js (v18+)
- Python (v3.10+)
- Git
- PostgreSQL

---

## 📥 2. Clone Repository

```bash
git clone https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-miracle.git
cd cc-kelompok-a-miracle
```


## 💡 3. Setup Backend
1. Masuk ke folder backend:
```bash
    cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Setup environment variable backend:

Buat file .env di backend, lalu isi:
```
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
```

4. Jalankan backend:
```bash
uvicorn main:app --reload
```

## 🗄️ 4. Setup Database

Database akan terhubung sesuai konfigurasi PostgreSQL pada file .env.

🌐 5. Setup Frontend

1. Masuk ke folder frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Install library tambahan (hanya sekali saat development):
```bash
npm install react-hot-toast
```

4. Setup environment variable:
```bash
copy .env.example .env
```

5. Isi file .env:

VITE_API_URL=http://localhost:8000

## ▶️ 6. Run Frontend
```bash
npm run dev
```

## 🔗 7. Akses Aplikasi

Frontend: http://localhost:5173

Backend: http://localhost:8000/docs

## 📝 Notes

- Pastikan backend berjalan sebelum frontend.
- Jika API tidak terhubung, cek file .env.
- Pastikan konfigurasi database PostgreSQL sudah benar.

## 💡 Tips

- Gunakan terminal terpisah untuk backend dan frontend
- Jika terjadi error dependency, coba jalankan ulang install:
```bash
npm install
pip install -r requirements.txt
```