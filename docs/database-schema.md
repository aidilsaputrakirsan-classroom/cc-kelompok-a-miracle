# Schema Database

    ADMIN {
        int id_admin PK
        varchar nama_admin
        varchar email
        varchar password
    }

    PENDONOR {
        int id_pendonor PK
        varchar nama_lengkap
        varchar jenis_kelamin
        float berat_badan
        float tinggi_badan
        varchar golongan_darah
        int usia
        date tanggal_lahir
        text alamat
    }

    RIWAYAT_DONOR {
        int id_riwayat PK
        int id_pendonor FK
        date tanggal_donor
        varchar status_verifikasi
        text catatan
    }

    RIWAYAT_KESEHATAN {
        int id_kesehatan PK
        int id_pendonor FK
        text riwayat_penyakit
        text keterangan
    }

    GAMIFIKASI {
        int id_gamifikasi PK
        int id_pendonor FK
        int point
        varchar voucher
        datetime last_updated
    }

    ADMIN ||--o{ PENDONOR : Memverifikasi
    ADMIN ||--o{ RIWAYAT_DONOR : Memverifikasi
    PENDONOR ||--o{ RIWAYAT_DONOR : Memiliki
    PENDONOR ||--o{ RIWAYAT_KESEHATAN : Memiliki
    PENDONOR ||--|| GAMIFIKASI : Memiliki

# ERD Konseptual
![alt text](<ERD Konseptual.drawio.png>)
<br>

# ERD Crow's Foot
![alt text](<ERD CP.drawio.png>)