# 🐳 Docker Cheatsheet - Project Miracle

Dokumen ini adalah panduan teknis bagi tim pengembang **Miracle** untuk mengelola environment aplikasi menggunakan Docker. Panduan ini mencakup perintah dasar hingga skenario spesifik yang ditemukan selama pengembangan backend dan frontend.

---

## 🛠 1. Siklus Hidup Image (Build & Manage)
Image adalah "cetakan" dari aplikasi ini. Gunakan perintah ini saat ada perubahan pada kode sumber atau `requirements.txt`.

*   **Build Image:** Membuat image dari Dockerfile.
    ```powershell
    docker build -t miracle-backend:v1 .
    ```
*   **List Images:** Melihat daftar image yang tersimpan di lokal.
    ```powershell
    docker images
    ```
*   **Remove Image:** Menghapus image yang tidak terpakai (untuk hemat disk).
    ```powershell
    docker rmi miracle-backend:v1
    ```

---

## 🚀 2. Menjalankan Container (Run)
Container adalah instance aktif dari sebuah image.

*   **Run (Spesifik Proyek Miracle):**
    ```powershell
    docker run -d --name miracle-api -p 8000:8000 --env-file .env miracle-backend:v1
    ```
    *   `-d`: Detached mode (jalan di background).
    *   `--name`: Memberi nama container agar mudah dikelola.
    *   `-p 8000:8000`: Mapping port [Host]:[Container].
    *   `--env-file`: Menggunakan variabel dari file `.env`.

---

## 📊 3. Monitoring & Inspeksi
Digunakan untuk mengecek status aplikasi dan melihat apa yang terjadi di dalam container.

*   **Check Status (ps):**
    ```powershell
    docker ps        
    docker ps -a     
    ```
*   **View Logs:**
    ```powershell
    docker logs miracle-api
    docker logs -f miracle-api  
    ```
*   **Execute Command:**
    
    ```powershell
    docker exec -it miracle-api /bin/bash
    ```

---

## 🛑 4. Penghentian & Pembersihan
*   **Stop & Start:**
    ```powershell
    docker stop miracle-api
    docker start miracle-api
    ```
*   **Remove Container:**
    Menghapus container (container harus distop dulu, atau gunakan `-f`).
    ```powershell
    docker rm -f miracle-api
    ```
*   **Prune (Pembersihan Massal):**
    Menghapus semua container, network, dan image yang menggantung (dangling).
    ```powershell
    docker system prune
    ```

---

## ☁️ 5. Registri (Push & Pull)
Digunakan saat tim ingin berbagi image melalui Docker Hub atau Google Artifact Registry.

*   **Pull Image:** Mengambil image dari cloud.
    ```powershell
    docker pull postgres:15-alpine
    ```
*   **Tagging & Push:**
    ```powershell
    # Tagging sebelum push
    docker tag miracle-backend:v1 username/miracle-backend:v1
    
    # Push ke Docker Hub
    docker push username/miracle-backend:v1
    ```

---

## 💡 6. Koneksi ke Database Local
Jika database PostgreSQL berjalan di laptop (bukan di dalam Docker), pastikan `DATABASE_URL` di file `.env` menggunakan:
`host.docker.internal` bukan `localhost`.
> Contoh: `postgresql://user:pass@host.docker.internal:5432/miracle`

### 🔄 Alur Update Backend
Jika ada perubahan kode di backend, lakukan urutan ini:
1. `docker stop miracle-api`
2. `docker rm miracle-api`
3. `docker build -t miracle-backend:v1 .`
4. `docker run -d --name miracle-api -p 8000:8000 --env-file .env miracle-backend:v1`

---

## 🌐 7. Daftar Endpoint Akses
| Layanan | URL |
| :--- | :--- |
| **Backend API** | `http://localhost:8000` |
| **Swagger UI (Docs)** | `http://localhost:8000/docs` |
| **Health Check** | `http://localhost:8000/health` |