# 🩸 Tracelt<font color="gray"><sup><sup>by Miracle</sup><sup></font>
## Pengajuan Pendonor Darah

<div align="justify">
TraceIt merupakan aplikasi berbasis web yang dirancang untuk membantu civitas akademika Institut Teknologi Kalimantan dalam mengajukan permohonan data pendonor darah sukarela. Melalui platform ini, pengguna dapat mengunggah data pribadi, berupa nama lengkap, jenis kelamin, berat badan, tinggi badan, golongan darah, usia, tanggal lahir, tanggal terakhir donor, riwayat donor (total donor), alamat dan riwayat kesehatan. Sistem akan menampilkan daftar laporan pendonor sukarela yang dapat difilter berdasarkan nama, jenis kelamin, umur dan golongan darah untuk mempermudah proses verifikasi kesiapan pendonor dalam menjadi pendonor darah.

Aplikasi ini ditujukan bagi 2 pengguna. Pertama, adalah civitas akademika Institut Teknologi Kalimantan yang berperan sebagai pendonor sukarela. Kedua, adalah admin yang berperan dalam memantau dan memverifikasi data pendonor yang telah diajukan. 

Sistem TraceIt ini berperan dalam mengatasi permasalahan adanya kekurangan informasi terkait penyedia sukarelawan donor darah yang dapat diakses penerima di lingkungan civitas akademika Institut Teknologi Kalimantan. TraceIt hadir sebagai solusi terpusat berbasis cloud yang memungkinkan pengelolaan data secara sistematis, aman, dan dapat diakses kapan saja serta dari berbagai perangkat. Dengan demikian, proses pendataan pendonor sukarelawan menjadi lebih cepat, transparan, dan efisien.
</div>

## 👥 Team 

| NAMA | NIM | TUGAS |
| :--- | :--- | :--- |
| Debora Intania Subekti | 10231029 | Lead Backend |
| Avhilla Catton Andalucia | 10231021 | Lead Container |
| Chelsy Olivia | 10231025 | Lead CI/CD & Deploy |
| Yosan Pratiwi | 10231091 | Lead Frontend |
| Betran | 10231023 | Lead QA & Docs | 

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| *FastAPI* | Backend REST API |
| *React* | Frontend SPA |
| *PostgreSQL* | Database |
| *Docker* | Containerization |
| *GitHub Actions* | CI/CD |
| *Railway/Render* | Cloud Deployment |

## 🏛️ Architecture

```
[React Frontend] <--HTTP--> [FastAPI Backend] <--SQL--> [PostgreSQL]
       |                            |
  Vite + JSX               REST API Endpoints
  (Port 5173)               (Port 8000)
```

> *(Diagram ini akan berkembang setiap minggu)*


---
## Getting Started Backend
### 🔎 Cek Versi Python (Opsional)

```bash
python --version
pip --version
```

### 📂 Masuk ke Folder Backend

```bash
cd backend
```

### 📦 Install Dependencies

```bash
pip install -r requirements.txt
```

### ▶️ Jalankan Server

```bash
uvicorn main:app --reload --port 8000
```

### 🌐 Akses di Browser

```bash
http://localhost:8000
```

### 📑 Swagger Documentation

```bash
http://localhost:8000/docs
```

## Getting Started Frontend
Buka terminal kemudian jalankan langkah-langkah di bawah ini:

### 📂 Masuk ke folder projek
```
npm create vite@latest frontend -- --template react
```

### 📑Kemudian masuk ke folder frontend
```
cd frontend
npm install
```
### ▶️Jalankan frontend**
``` 
npm run dev

# Buka browser: http://localhost:5173
```


## 📅 Roadmap
| Minggu | Target | Status |
|------|-----|-------|
| 1 | Setup & Hello World | ✅ |
| 2 | REST API + Database | ⬜ |
| 3 | React Frontend | ⬜ |
| 4 | Full-Stack Integration | ⬜ |
| 5-7 | Docker & Compose	 | ⬜ |
| 8 | UTS Demo | ⬜ |
| 9-11 | CI/CD Pipeline | ⬜ |
| 12-14 | Microservices | ⬜ |
| 15-16 | Final & UAS	 | ⬜ |

## 📁 Struktur Proyek

```text
cc-kelompok-a-miracle/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── docs/
│   ├── member-Avhilla.md
│   ├── member-BETRAN.md
│   ├── member-Chelsy.md
│   ├── member-Intan.md
│   └── member-YOSAN.md
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package-lock.json
└── README.md
```

## Dokumentasi Week 1
![alt text](image-1.png)
![alt text](image.png)