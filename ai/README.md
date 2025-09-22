# MCP Database Operations Server

Server Model Context Protocol (MCP) untuk melakukan operasi database pada aplikasi ploting-jadwal-dosen.

## Deskripsi

Server ini menyediakan tools untuk melakukan operasi CRUD (Create, Read, Update, Delete) pada semua entitas database backend:

- **User**: Pengguna sistem (Admin, Dosen, Mahasiswa, Kaprodi)
- **Prodi**: Program Studi
- **MataKuliah**: Mata Kuliah
- **Kelas**: Kelas mahasiswa
- **Ruangan**: Ruangan kampus
- **Jadwal**: Jadwal perkuliahan
- **PermintaanJadwal**: Permintaan perubahan jadwal

## Instalasi

```bash
cd ai
pip install -r requirements.txt
```

## Menjalankan Server

### Development Mode (dengan MCP Inspector)

```bash
python -m mcp dev server.py
```

### Direct Execution

```bash
python server.py
```

### Dengan Claude Desktop

1. Install server ke Claude Desktop:
```bash
python -m mcp install server.py
```

## Tools yang Tersedia

### User Operations
- `get_users()` - Mendapatkan semua user
- `get_user_by_id(user_id)` - Mendapatkan user berdasarkan ID
- `create_user(name, email, password, role, ...)` - Membuat user baru
- `update_user(user_id, ...)` - Update user
- `delete_user(user_id)` - Hapus user

### Prodi Operations
- `get_prodis()` - Mendapatkan semua prodi
- `get_prodi_by_id(prodi_id)` - Mendapatkan prodi berdasarkan ID
- `create_prodi(nama_prodi)` - Membuat prodi baru
- `update_prodi(prodi_id, nama_prodi)` - Update prodi
- `delete_prodi(prodi_id)` - Hapus prodi

### MataKuliah Operations
- `get_mata_kuliahs()` - Mendapatkan semua mata kuliah
- `get_mata_kuliah_by_id(mk_id)` - Mendapatkan mata kuliah berdasarkan ID
- `create_mata_kuliah(kode_mk, nama_mk, sks, prodi_id)` - Membuat mata kuliah baru
- `update_mata_kuliah(mk_id, ...)` - Update mata kuliah
- `delete_mata_kuliah(mk_id)` - Hapus mata kuliah

### Kelas Operations
- `get_kelas()` - Mendapatkan semua kelas
- `get_kelas_by_id(kelas_id)` - Mendapatkan kelas berdasarkan ID
- `create_kelas(nama_kelas, angkatan, prodi_id)` - Membuat kelas baru
- `update_kelas(kelas_id, ...)` - Update kelas
- `delete_kelas(kelas_id)` - Hapus kelas

### Ruangan Operations
- `get_ruangans()` - Mendapatkan semua ruangan
- `get_ruangan_by_id(ruangan_id)` - Mendapatkan ruangan berdasarkan ID
- `create_ruangan(nama, kapasitas, lokasi)` - Membuat ruangan baru
- `update_ruangan(ruangan_id, ...)` - Update ruangan
- `delete_ruangan(ruangan_id)` - Hapus ruangan

### Jadwal Operations
- `get_jadwals()` - Mendapatkan semua jadwal
- `get_jadwal_by_id(jadwal_id)` - Mendapatkan jadwal berdasarkan ID
- `create_jadwal(hari, jam_mulai, jam_selesai, ...)` - Membuat jadwal baru
- `update_jadwal(jadwal_id, ...)` - Update jadwal
- `delete_jadwal(jadwal_id)` - Hapus jadwal

### PermintaanJadwal Operations
- `get_permintaan_jadwals()` - Mendapatkan semua permintaan jadwal
- `get_permintaan_jadwal_by_id(pj_id)` - Mendapatkan permintaan jadwal berdasarkan ID
- `create_permintaan_jadwal(alasan, jadwal_id, dosen_id, ...)` - Membuat permintaan jadwal baru
- `update_permintaan_jadwal(pj_id, ...)` - Update permintaan jadwal
- `delete_permintaan_jadwal(pj_id)` - Hapus permintaan jadwal

## Database

Server ini terhubung langsung ke database SQLite yang sama dengan backend NestJS:
- Path: `../backend/prisma/dev.db`
- Schema: Berdasarkan `schema.prisma` di backend

## Keamanan

⚠️ **Peringatan**: Server ini memberikan akses penuh ke database. Gunakan dengan hati-hati dan pastikan hanya dijalankan di environment yang aman.

## Troubleshooting

1. **Database tidak ditemukan**: Pastikan backend sudah dijalankan dan database `dev.db` ada
2. **Import error**: Install dependencies dengan `pip install -r requirements.txt`
3. **Connection error**: Periksa path database di `DB_PATH` pada `server.py`