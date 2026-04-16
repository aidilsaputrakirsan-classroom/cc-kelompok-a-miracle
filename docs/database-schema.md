# Schema Database (Aktual Backend)

```mermaid
erDiagram
    ADMIN {
        Integer id_admin PK
        String nama_admin
        String email UK
        String password
    }

    PENGGUNA {
        Integer id_pengguna PK
        String nama_pengguna
        String email UK
        String password
        DateTime created_at
    }

    PENDONOR {
        Integer id_pendonor PK
        String nama_lengkap
        String email
        Enum jenis_kelamin
        Float berat_badan
        Float tinggi_badan
        Enum golongan_darah
        Integer umur
        Date tanggal_lahir
        Date tanggal_terakhir_donor
        Integer total_donor
        Text alamat
        String no_telepon
        Text riwayat_kesehatan
        DateTime created_at
    }

    RIWAYAT_DONOR {
        Integer id_riwayat PK
        Integer id_pendonor FK
        Integer id_pengguna FK
        Enum golongan_darah
        Boolean status_verifikasi
    }

    PENDONOR ||--o{ RIWAYAT_DONOR : memiliki
    PENGGUNA ||--o{ RIWAYAT_DONOR : memiliki
```

## Catatan Perubahan

- `pendonor.email` ditambahkan untuk menghubungkan input pendonor publik dengan akun pengguna ber-email sama.
- `pendonor.no_telepon` sudah bertipe `String`, bukan integer.
- Entitas non-implementasi (`riwayat_kesehatan`, `gamifikasi`) dihapus dari ERD dokumen karena tidak ada pada model backend aktif.