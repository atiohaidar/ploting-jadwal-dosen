# Plotting Jadwal Dosen - Dokumentasi Lengkap

Sistem Manajemen Jadwal Dosen adalah aplikasi web untuk mengelola penjadwalan akademik, termasuk pengelolaan pengguna, program studi, mata kuliah, kelas, ruangan, dan jadwal perkuliahan dengan deteksi konflik otomatis.

## Daftar Isi

- [Arsitektur Sistem](#arsitektur-sistem)
- [Tech Stack](#tech-stack)
- [Instalasi & Setup](#instalasi--setup)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Database & Schema](#database--schema)
- [API Reference](#api-reference)
- [Autentikasi & Otorisasi](#autentikasi--otorisasi)
- [Fitur Utama](#fitur-utama)
- [Frontend Pages](#frontend-pages)
- [Deteksi Konflik Jadwal](#deteksi-konflik-jadwal)
- [Seed Data](#seed-data)

---

## Arsitektur Sistem

```
┌─────────────────────┐     HTTP/REST      ┌─────────────────────┐
│                     │ ◄───────────────── │                     │
│   Backend (NestJS)  │                    │  Frontend (React)   │
│   Port: 3001        │ ──────────────────►│  Port: 5173         │
│                     │    JSON Response   │                     │
└─────────┬───────────┘                    └─────────────────────┘
          │
          │ Prisma ORM
          ▼
┌─────────────────────┐
│   SQLite Database   │
└─────────────────────┘
```

## Tech Stack

### Backend
- **Framework**: NestJS 11
- **ORM**: Prisma 6 (SQLite)
- **Auth**: JWT + Passport
- **Validasi**: class-validator, class-transformer
- **Dokumentasi API**: Swagger/OpenAPI
- **Monitoring**: Winston (logging), Prometheus (metrics)

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router DOM 7

---

## Instalasi & Setup

### Prasyarat
- Node.js >= 18
- npm >= 9

### Langkah Instalasi

```bash
# Clone repository
git clone <repository-url>
cd ploting-jadwal-dosen

# Install backend dependencies
cd backend
npm install
npx prisma generate
npx prisma migrate deploy

# Install frontend dependencies
cd ../frontend
npm install
```

### Seed Database (Data Awal)

```bash
cd backend
npx prisma db seed
```

Data seed mencakup:
- 3 Program Studi (Teknik Informatika, Sistem Informasi, Teknik Elektro)
- 9 Mata Kuliah
- 6 Kelas
- 7 Ruangan
- 14 Pengguna (1 Admin, 2 Kaprodi, 5 Dosen, 6 Mahasiswa)
- 4 Jadwal contoh

**Akun Default:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@university.com | password123 |
| Kaprodi | kaprodi.ti@university.com | password123 |
| Dosen | budi.santoso@university.com | password123 |

---

## Menjalankan Aplikasi

### Menggunakan Script (Rekomendasi)

```bash
# Dari root directory
./run-dev.sh
```

Script ini otomatis:
1. Install dependencies (jika belum)
2. Generate Prisma client
3. Jalankan database migration
4. Start backend & frontend secara bersamaan

### Manual

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### URL Akses
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Swagger API Docs**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/monitoring/health

---

## Database & Schema

### Entity Relationship

```
User ──┬── Jadwal (sebagai Dosen)
       └── PermintaanJadwal

Prodi ──┬── User
        ├── MataKuliah
        └── Kelas

MataKuliah ── Jadwal
Kelas ─────── Jadwal
Ruangan ────── Jadwal

Jadwal ── PermintaanJadwal
```

### Model

| Model | Field Utama | Keterangan |
|-------|-------------|------------|
| **User** | id, name, email, password, role, gender, nip, nim, prodiId | Pengguna sistem |
| **Prodi** | id, namaProdi | Program Studi |
| **MataKuliah** | id, kodeMk, namaMk, sks, prodiId | Mata Kuliah |
| **Kelas** | id, namaKelas, angkatan, prodiId | Kelas |
| **Ruangan** | id, nama, kapasitas, lokasi | Ruangan |
| **Jadwal** | id, hari, jamMulai, jamSelesai, status, mataKuliahId, dosenId, kelasId, ruanganId | Jadwal Perkuliahan |
| **PermintaanJadwal** | id, alasan, tanggalPengajuan, status, jadwalId, dosenId | Permintaan Perubahan Jadwal |

### Enum

- **Role**: `ADMIN`, `DOSEN`, `MAHASISWA`, `KAPRODI`
- **Gender**: `MALE`, `FEMALE`
- **PermintaanStatus**: `PENDING`, `DISETUJUI`, `DITOLAK`

---

## API Reference

### Autentikasi

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/auth/login` | Login dan mendapat JWT token | ❌ |

### Users

| Method | Endpoint | Deskripsi | Roles |
|--------|----------|-----------|-------|
| POST | `/users` | Buat user baru | ADMIN |
| GET | `/users` | Daftar semua user | ADMIN |
| PUT | `/users/:id` | Update user | ADMIN |
| DELETE | `/users/:id` | Hapus user | ADMIN |
| POST | `/users/bulk` | Buat banyak user sekaligus | ADMIN |

### Program Studi (Prodi)

| Method | Endpoint | Deskripsi | Roles |
|--------|----------|-----------|-------|
| POST | `/prodi` | Buat prodi baru | ADMIN, KAPRODI |
| GET | `/prodi` | Daftar semua prodi | ADMIN, KAPRODI, DOSEN |
| GET | `/prodi/:id` | Detail prodi | ADMIN, KAPRODI, DOSEN |
| PUT | `/prodi/:id` | Update prodi | ADMIN, KAPRODI |
| DELETE | `/prodi/:id` | Hapus prodi | ADMIN, KAPRODI |

### Mata Kuliah

| Method | Endpoint | Deskripsi | Roles |
|--------|----------|-----------|-------|
| POST | `/mata-kuliah` | Buat mata kuliah baru | ADMIN, KAPRODI |
| GET | `/mata-kuliah` | Daftar semua mata kuliah | ADMIN, KAPRODI, DOSEN |
| GET | `/mata-kuliah/:id` | Detail mata kuliah | ADMIN, KAPRODI, DOSEN |
| PUT | `/mata-kuliah/:id` | Update mata kuliah | ADMIN, KAPRODI |
| DELETE | `/mata-kuliah/:id` | Hapus mata kuliah | ADMIN, KAPRODI |

### Kelas

| Method | Endpoint | Deskripsi | Roles |
|--------|----------|-----------|-------|
| POST | `/kelas` | Buat kelas baru | ADMIN, KAPRODI |
| GET | `/kelas` | Daftar semua kelas | ADMIN, KAPRODI, DOSEN |
| GET | `/kelas/:id` | Detail kelas | ADMIN, KAPRODI, DOSEN |
| PUT | `/kelas/:id` | Update kelas | ADMIN, KAPRODI |
| DELETE | `/kelas/:id` | Hapus kelas | ADMIN, KAPRODI |

### Ruangan

| Method | Endpoint | Deskripsi | Roles |
|--------|----------|-----------|-------|
| POST | `/ruangan` | Buat ruangan baru | ADMIN |
| GET | `/ruangan` | Daftar semua ruangan | ADMIN, KAPRODI, DOSEN |
| GET | `/ruangan/:id` | Detail ruangan | ADMIN, KAPRODI, DOSEN |
| PUT | `/ruangan/:id` | Update ruangan | ADMIN |
| DELETE | `/ruangan/:id` | Hapus ruangan | ADMIN |

### Jadwal

| Method | Endpoint | Deskripsi | Roles |
|--------|----------|-----------|-------|
| POST | `/jadwal` | Buat jadwal baru (dengan deteksi konflik) | ADMIN, KAPRODI |
| GET | `/jadwal` | Daftar semua jadwal | ADMIN, KAPRODI, DOSEN |
| GET | `/jadwal/:id` | Detail jadwal | ADMIN, KAPRODI, DOSEN |
| PATCH | `/jadwal/:id` | Update jadwal (dengan deteksi konflik) | ADMIN, KAPRODI |
| DELETE | `/jadwal/:id` | Hapus jadwal | ADMIN, KAPRODI |

### Monitoring

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/monitoring/health` | Health check (database, memory, disk) | ❌ |
| GET | `/monitoring/ping` | Ping | ❌ |
| GET | `/monitoring/info` | Informasi aplikasi | ❌ |

---

## Autentikasi & Otorisasi

### Login Flow

1. Client mengirim `POST /auth/login` dengan `{ email, password }`
2. Server memverifikasi password menggunakan bcrypt
3. Server mengembalikan JWT token: `{ access_token: "..." }`
4. Client menyimpan token di `localStorage`
5. Setiap request berikutnya menyertakan header: `Authorization: Bearer <token>`

### Role-Based Access Control (RBAC)

| Role | Akses |
|------|-------|
| **ADMIN** | Semua operasi CRUD pada semua entitas |
| **KAPRODI** | CRUD prodi, mata kuliah, kelas, jadwal; Read ruangan |
| **DOSEN** | Read semua entitas (prodi, mata kuliah, kelas, ruangan, jadwal) |
| **MAHASISWA** | - (Belum ada endpoint khusus) |

### Contoh Request

```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@university.com", "password": "password123"}'

# Mengakses endpoint yang dilindungi
curl -X GET http://localhost:3001/jadwal \
  -H "Authorization: Bearer <access_token>"
```

---

## Fitur Utama

### 1. Manajemen Pengguna
- CRUD pengguna (Admin, Dosen, Kaprodi, Mahasiswa)
- Bulk create (import banyak pengguna sekaligus)
- Password di-hash menggunakan bcrypt

### 2. Manajemen Akademik
- Program Studi (Prodi)
- Mata Kuliah (dengan kode MK unik dan SKS)
- Kelas (dengan tahun angkatan)
- Ruangan (dengan kapasitas dan lokasi)

### 3. Manajemen Jadwal
- Buat, edit, hapus jadwal perkuliahan
- Tampilan kalender (calendar view) per hari
- Filter jadwal berdasarkan dosen, mata kuliah, kelas, ruangan, dan hari
- Drag & drop untuk membuat jadwal baru
- Statistik beban mengajar dosen

### 4. Deteksi Konflik Jadwal
- Otomatis mendeteksi konflik saat membuat dan mengupdate jadwal
- Tiga jenis konflik yang dideteksi:
  - **Konflik Dosen**: Dosen yang sama dijadwalkan di waktu yang tumpang tindih
  - **Konflik Kelas**: Kelas yang sama dijadwalkan di waktu yang tumpang tindih
  - **Konflik Ruangan**: Ruangan yang sama dijadwalkan di waktu yang tumpang tindih
- Mengembalikan detail konflik jika terdeteksi

---

## Frontend Pages

| Halaman | URL | Deskripsi |
|---------|-----|-----------|
| Login | `/login` | Halaman login |
| Dashboard | `/dashboard` | Statistik umum (jumlah user, prodi, dsb) |
| User Management | `/users` | Daftar & hapus pengguna |
| Create User | `/users/create` | Form buat user baru |
| Edit User | `/users/edit/:id` | Form edit user |
| Bulk Create Users | `/users/bulk-create` | Import banyak user |
| Prodi | `/prodi` | Manajemen program studi |
| Mata Kuliah | `/mata-kuliah` | Manajemen mata kuliah |
| Kelas | `/kelas` | Manajemen kelas |
| Ruangan | `/ruangan` | Manajemen ruangan |
| Jadwal | `/jadwal` | Kalender jadwal & manajemen jadwal |

---

## Deteksi Konflik Jadwal

Sistem secara otomatis memeriksa tiga jenis konflik waktu saat **membuat** dan **mengupdate** jadwal:

### Logika Deteksi

Dua jadwal dianggap **konflik** jika memiliki hari yang sama dan waktu yang tumpang tindih. Tumpang tindih terdeteksi jika salah satu kondisi berikut terpenuhi:

1. Jadwal baru **mulai sebelum** jadwal lain selesai dan **selesai setelah** jadwal lain mulai
2. Jadwal baru **berada di dalam** rentang waktu jadwal lain
3. Jadwal baru **mencakup** seluruh rentang waktu jadwal lain

### Response Konflik

Jika konflik terdeteksi, API mengembalikan HTTP 409 dengan detail:

```json
{
  "message": "Jadwal conflict detected",
  "conflicts": [
    {
      "type": "DOSEN",
      "existingJadwal": {
        "id": 1,
        "hari": "Senin",
        "jamMulai": "08:00",
        "jamSelesai": "10:00",
        "mataKuliah": { "namaMk": "Pemrograman Web" },
        "dosen": { "name": "Dr. Budi Santoso" },
        "kelas": { "namaKelas": "TI-A" },
        "ruangan": { "nama": "Lab Komputer 1" }
      }
    }
  ]
}
```

---

## Seed Data

### Akun Pengguna Seed

| Nama | Email | Role | Password |
|------|-------|------|----------|
| Admin | admin@university.com | ADMIN | password123 |
| Kaprodi TI | kaprodi.ti@university.com | KAPRODI | password123 |
| Kaprodi SI | kaprodi.si@university.com | KAPRODI | password123 |
| Dr. Budi Santoso | budi.santoso@university.com | DOSEN | password123 |
| Dr. Siti Rahayu | siti.rahayu@university.com | DOSEN | password123 |
| Dr. Ahmad Wijaya | ahmad.wijaya@university.com | DOSEN | password123 |
| Dr. Rina Kusuma | rina.kusuma@university.com | DOSEN | password123 |
| Dr. Hendra Pratama | hendra.pratama@university.com | DOSEN | password123 |

### Mata Kuliah Seed

| Kode | Nama | SKS | Prodi |
|------|------|-----|-------|
| TI101 | Pemrograman Web | 3 | Teknik Informatika |
| TI102 | Basis Data | 3 | Teknik Informatika |
| TI103 | Algoritma dan Struktur Data | 4 | Teknik Informatika |
| SI101 | Sistem Informasi Manajemen | 3 | Sistem Informasi |
| SI102 | Analisis dan Perancangan Sistem | 3 | Sistem Informasi |
| SI103 | E-Business | 3 | Sistem Informasi |
| TE101 | Rangkaian Listrik | 3 | Teknik Elektro |
| TE102 | Elektronika Dasar | 3 | Teknik Elektro |
| TE103 | Sistem Kendali | 4 | Teknik Elektro |

---

## Struktur Proyek

```
ploting-jadwal-dosen/
├── backend/                        # NestJS Backend
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   ├── seed.ts                 # Data seeder
│   │   └── migrations/             # Database migrations
│   ├── src/
│   │   ├── auth/                   # Autentikasi (JWT, guards, strategy)
│   │   ├── user/                   # Manajemen pengguna
│   │   ├── prodi/                  # Manajemen program studi
│   │   ├── mata-kuliah/            # Manajemen mata kuliah
│   │   ├── kelas/                  # Manajemen kelas
│   │   ├── ruangan/                # Manajemen ruangan
│   │   ├── jadwal/                 # Manajemen jadwal + deteksi konflik
│   │   ├── monitoring/             # Health check, metrics, logging
│   │   ├── prisma/                 # Prisma service
│   │   ├── app.module.ts           # Root module
│   │   └── main.ts                 # Entry point
│   └── test/                       # E2E tests
├── frontend/                       # React Frontend
│   ├── src/
│   │   ├── pages/                  # Halaman (Dashboard, Login, dll)
│   │   ├── components/             # Form & Calendar components
│   │   ├── contexts/               # Auth context
│   │   ├── services/               # API service (Axios)
│   │   └── App.tsx                 # Root component & routing
│   └── index.html                  # Entry HTML
├── docs/                           # Dokumentasi
├── run-dev.sh                      # Script untuk menjalankan development
└── README-DEV.md                   # Panduan development
```
