#!/usr/bin/env python3
"""
MCP Server untuk operasi database backend ploting-jadwal-dosen
"""

import sqlite3
import json
from typing import List, Dict, Any, Optional
from pathlib import Path

from mcp.server.fastmcp import FastMCP

# Database path
DB_PATH = Path(__file__).parent.parent / "backend" / "prisma" / "dev.db"

# Initialize FastMCP server
mcp = FastMCP("Database Operations Server")

def get_db_connection():
    """Get database connection"""
    return sqlite3.connect(DB_PATH)

def execute_query(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Execute SQL query and return results as list of dicts"""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.commit()
        return results
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def execute_insert(query: str, params: tuple = ()) -> int:
    """Execute INSERT query and return the last insert rowid"""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        jadwal_id = cursor.lastrowid
        conn.commit()
        return jadwal_id
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# User operations
@mcp.tool()
def get_users() -> List[Dict[str, Any]]:
    """Get all users"""
    query = """
    SELECT u.*, p.namaProdi
    FROM User u
    LEFT JOIN Prodi p ON u.prodiId = p.id
    """
    return execute_query(query)

@mcp.tool()
def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    query = """
    SELECT u.*, p.namaProdi
    FROM User u
    LEFT JOIN Prodi p ON u.prodiId = p.id
    WHERE u.id = ?
    """
    results = execute_query(query, (user_id,))
    return results[0] if results else None

@mcp.tool()
def create_user(name: str, email: str, password: str, role: str, gender: Optional[str] = None,
                nip: Optional[str] = None, nim: Optional[str] = None, prodi_id: Optional[int] = None) -> Dict[str, Any]:
    """Create a new user"""
    query = """
    INSERT INTO User (name, email, password, role, gender, nip, nim, prodiId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    execute_query(query, (name, email, password, role, gender, nip, nim, prodi_id))

    # Get the created user
    user_id = execute_query("SELECT last_insert_rowid() as id")[0]['id']
    return get_user_by_id(user_id)

@mcp.tool()
def update_user(user_id: int, name: Optional[str] = None, email: Optional[str] = None,
                password: Optional[str] = None, role: Optional[str] = None,
                gender: Optional[str] = None, nip: Optional[str] = None,
                nim: Optional[str] = None, prodi_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """Update user by ID"""
    # Build dynamic update query
    updates = []
    params = []

    if name is not None:
        updates.append("name = ?")
        params.append(name)
    if email is not None:
        updates.append("email = ?")
        params.append(email)
    if password is not None:
        updates.append("password = ?")
        params.append(password)
    if role is not None:
        updates.append("role = ?")
        params.append(role)
    if gender is not None:
        updates.append("gender = ?")
        params.append(gender)
    if nip is not None:
        updates.append("nip = ?")
        params.append(nip)
    if nim is not None:
        updates.append("nim = ?")
        params.append(nim)
    if prodi_id is not None:
        updates.append("prodiId = ?")
        params.append(prodi_id)

    if not updates:
        return get_user_by_id(user_id)

    query = f"UPDATE User SET {', '.join(updates)} WHERE id = ?"
    params.append(user_id)

    execute_query(query, tuple(params))
    return get_user_by_id(user_id)

@mcp.tool()
def delete_user(user_id: int) -> bool:
    """Delete user by ID"""
    query = "DELETE FROM User WHERE id = ?"
    result = execute_query(query, (user_id,))
    return True

# Prodi operations
@mcp.tool()
def get_prodis() -> List[Dict[str, Any]]:
    """Get all prodi"""
    query = "SELECT * FROM Prodi"
    return execute_query(query)

@mcp.tool()
def get_prodi_by_id(prodi_id: int) -> Optional[Dict[str, Any]]:
    """Get prodi by ID"""
    query = "SELECT * FROM Prodi WHERE id = ?"
    results = execute_query(query, (prodi_id,))
    return results[0] if results else None

@mcp.tool()
def create_prodi(nama_prodi: str) -> Dict[str, Any]:
    """Create a new prodi"""
    query = "INSERT INTO Prodi (namaProdi) VALUES (?)"
    execute_query(query, (nama_prodi,))

    prodi_id = execute_query("SELECT last_insert_rowid() as id")[0]['id']
    return get_prodi_by_id(prodi_id)

@mcp.tool()
def update_prodi(prodi_id: int, nama_prodi: str) -> Optional[Dict[str, Any]]:
    """Update prodi by ID"""
    query = "UPDATE Prodi SET namaProdi = ? WHERE id = ?"
    execute_query(query, (nama_prodi, prodi_id))
    return get_prodi_by_id(prodi_id)

@mcp.tool()
def delete_prodi(prodi_id: int) -> bool:
    """Delete prodi by ID"""
    query = "DELETE FROM Prodi WHERE id = ?"
    execute_query(query, (prodi_id,))
    return True

# MataKuliah operations
@mcp.tool()
def get_mata_kuliahs() -> List[Dict[str, Any]]:
    """Get all mata kuliah"""
    query = """
    SELECT mk.*, p.namaProdi
    FROM MataKuliah mk
    JOIN Prodi p ON mk.prodiId = p.id
    """
    return execute_query(query)

@mcp.tool()
def get_mata_kuliah_by_id(mk_id: int) -> Optional[Dict[str, Any]]:
    """Get mata kuliah by ID"""
    query = """
    SELECT mk.*, p.namaProdi
    FROM MataKuliah mk
    JOIN Prodi p ON mk.prodiId = p.id
    WHERE mk.id = ?
    """
    results = execute_query(query, (mk_id,))
    return results[0] if results else None

@mcp.tool()
def create_mata_kuliah(kode_mk: str, nama_mk: str, sks: int, prodi_id: int) -> Dict[str, Any]:
    """Create a new mata kuliah"""
    query = "INSERT INTO MataKuliah (kodeMk, namaMk, sks, prodiId) VALUES (?, ?, ?, ?)"
    execute_query(query, (kode_mk, nama_mk, sks, prodi_id))

    mk_id = execute_query("SELECT last_insert_rowid() as id")[0]['id']
    return get_mata_kuliah_by_id(mk_id)

@mcp.tool()
def update_mata_kuliah(mk_id: int, kode_mk: Optional[str] = None, nama_mk: Optional[str] = None,
                      sks: Optional[int] = None, prodi_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """Update mata kuliah by ID"""
    updates = []
    params = []

    if kode_mk is not None:
        updates.append("kodeMk = ?")
        params.append(kode_mk)
    if nama_mk is not None:
        updates.append("namaMk = ?")
        params.append(nama_mk)
    if sks is not None:
        updates.append("sks = ?")
        params.append(sks)
    if prodi_id is not None:
        updates.append("prodiId = ?")
        params.append(prodi_id)

    if not updates:
        return get_mata_kuliah_by_id(mk_id)

    query = f"UPDATE MataKuliah SET {', '.join(updates)} WHERE id = ?"
    params.append(mk_id)

    execute_query(query, tuple(params))
    return get_mata_kuliah_by_id(mk_id)

@mcp.tool()
def delete_mata_kuliah(mk_id: int) -> bool:
    """Delete mata kuliah by ID"""
    query = "DELETE FROM MataKuliah WHERE id = ?"
    execute_query(query, (mk_id,))
    return True

# Kelas operations
@mcp.tool()
def get_kelas() -> List[Dict[str, Any]]:
    """Get all kelas"""
    query = """
    SELECT k.*, p.namaProdi
    FROM Kelas k
    JOIN Prodi p ON k.prodiId = p.id
    """
    return execute_query(query)

@mcp.tool()
def get_kelas_by_id(kelas_id: int) -> Optional[Dict[str, Any]]:
    """Get kelas by ID"""
    query = """
    SELECT k.*, p.namaProdi
    FROM Kelas k
    JOIN Prodi p ON k.prodiId = p.id
    WHERE k.id = ?
    """
    results = execute_query(query, (kelas_id,))
    return results[0] if results else None

@mcp.tool()
def create_kelas(nama_kelas: str, angkatan: int, prodi_id: int) -> Dict[str, Any]:
    """Create a new kelas"""
    query = "INSERT INTO Kelas (namaKelas, angkatan, prodiId) VALUES (?, ?, ?)"
    execute_query(query, (nama_kelas, angkatan, prodi_id))

    kelas_id = execute_query("SELECT last_insert_rowid() as id")[0]['id']
    return get_kelas_by_id(kelas_id)

@mcp.tool()
def update_kelas(kelas_id: int, nama_kelas: Optional[str] = None, angkatan: Optional[int] = None,
                 prodi_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """Update kelas by ID"""
    updates = []
    params = []

    if nama_kelas is not None:
        updates.append("namaKelas = ?")
        params.append(nama_kelas)
    if angkatan is not None:
        updates.append("angkatan = ?")
        params.append(angkatan)
    if prodi_id is not None:
        updates.append("prodiId = ?")
        params.append(prodi_id)

    if not updates:
        return get_kelas_by_id(kelas_id)

    query = f"UPDATE Kelas SET {', '.join(updates)} WHERE id = ?"
    params.append(kelas_id)

    execute_query(query, tuple(params))
    return get_kelas_by_id(kelas_id)

@mcp.tool()
def delete_kelas(kelas_id: int) -> bool:
    """Delete kelas by ID"""
    query = "DELETE FROM Kelas WHERE id = ?"
    execute_query(query, (kelas_id,))
    return True

# Ruangan operations
@mcp.tool()
def get_ruangans() -> List[Dict[str, Any]]:
    """Get all ruangan"""
    query = "SELECT * FROM Ruangan"
    return execute_query(query)

@mcp.tool()
def get_ruangan_by_id(ruangan_id: int) -> Optional[Dict[str, Any]]:
    """Get ruangan by ID"""
    query = "SELECT * FROM Ruangan WHERE id = ?"
    results = execute_query(query, (ruangan_id,))
    return results[0] if results else None

@mcp.tool()
def create_ruangan(nama: str, kapasitas: int, lokasi: Optional[str] = None) -> Dict[str, Any]:
    """Create a new ruangan"""
    query = "INSERT INTO Ruangan (nama, kapasitas, lokasi) VALUES (?, ?, ?)"
    execute_query(query, (nama, kapasitas, lokasi))

    ruangan_id = execute_query("SELECT last_insert_rowid() as id")[0]['id']
    return get_ruangan_by_id(ruangan_id)

@mcp.tool()
def update_ruangan(ruangan_id: int, nama: Optional[str] = None, kapasitas: Optional[int] = None,
                  lokasi: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Update ruangan by ID"""
    updates = []
    params = []

    if nama is not None:
        updates.append("nama = ?")
        params.append(nama)
    if kapasitas is not None:
        updates.append("kapasitas = ?")
        params.append(kapasitas)
    if lokasi is not None:
        updates.append("lokasi = ?")
        params.append(lokasi)

    if not updates:
        return get_ruangan_by_id(ruangan_id)

    query = f"UPDATE Ruangan SET {', '.join(updates)} WHERE id = ?"
    params.append(ruangan_id)

    execute_query(query, tuple(params))
    return get_ruangan_by_id(ruangan_id)

@mcp.tool()
def delete_ruangan(ruangan_id: int) -> bool:
    """Delete ruangan by ID"""
    query = "DELETE FROM Ruangan WHERE id = ?"
    execute_query(query, (ruangan_id,))
    return True

# Jadwal operations
@mcp.tool()
def get_jadwals() -> List[Dict[str, Any]]:
    """Get all jadwal"""
    query = """
    SELECT j.*,
           mk.kodeMk, mk.namaMk, mk.sks,
           u.name as dosen_name, u.nip,
           k.namaKelas, k.angkatan,
           r.nama as ruangan_nama, r.kapasitas, r.lokasi
    FROM Jadwal j
    JOIN MataKuliah mk ON j.mataKuliahId = mk.id
    JOIN User u ON j.dosenId = u.id
    JOIN Kelas k ON j.kelasId = k.id
    JOIN Ruangan r ON j.ruanganId = r.id
    """
    return execute_query(query)

@mcp.tool()
def get_jadwal_by_id(jadwal_id: int) -> Optional[Dict[str, Any]]:
    """Get jadwal by ID"""
    query = """
    SELECT j.*,
           mk.kodeMk, mk.namaMk, mk.sks,
           u.name as dosen_name, u.nip,
           k.namaKelas, k.angkatan,
           r.nama as ruangan_nama, r.kapasitas, r.lokasi
    FROM Jadwal j
    JOIN MataKuliah mk ON j.mataKuliahId = mk.id
    JOIN User u ON j.dosenId = u.id
    JOIN Kelas k ON j.kelasId = k.id
    JOIN Ruangan r ON j.ruanganId = r.id
    WHERE j.id = ?
    """
    results = execute_query(query, (jadwal_id,))
    return results[0] if results else None

@mcp.tool()
def create_jadwal(hari: str, jam_mulai: str, jam_selesai: str, mata_kuliah_id: int,
                 dosen_id: int, kelas_id: int, ruangan_id: int, status: str = "aktif") -> Dict[str, Any]:
    """Create a new jadwal"""
    query = """
    INSERT INTO Jadwal (hari, jamMulai, jamSelesai, status, mataKuliahId, dosenId, kelasId, ruanganId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    try:
        jadwal_id = execute_insert(query, (hari, jam_mulai, jam_selesai, status, mata_kuliah_id, dosen_id, kelas_id, ruangan_id))
        result = get_jadwal_by_id(jadwal_id)
        if result is None:
            raise ValueError(f"Jadwal with id {jadwal_id} not found after creation")
        return result
    except Exception as e:
        raise ValueError(f"Failed to create jadwal: {str(e)}")

@mcp.tool()
def create_jadwals(jadwals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Create multiple jadwals in bulk"""
    if not jadwals:
        return []
    
    inserted_jadwals = []
    
    for jadwal_data in jadwals:
        try:
            # Use single create for each to ensure consistency
            result = create_jadwal(
                hari=jadwal_data.get('hari'),
                jam_mulai=jadwal_data.get('jam_mulai'),
                jam_selesai=jadwal_data.get('jam_selesai'),
                mata_kuliah_id=jadwal_data.get('mata_kuliah_id'),
                dosen_id=jadwal_data.get('dosen_id'),
                kelas_id=jadwal_data.get('kelas_id'),
                ruangan_id=jadwal_data.get('ruangan_id'),
                status=jadwal_data.get('status', 'aktif')
            )
            inserted_jadwals.append(result)
        except Exception as e:
            # Skip failed inserts
            continue
    
    return inserted_jadwals

@mcp.tool()
def update_jadwal(jadwal_id: int, hari: Optional[str] = None, jam_mulai: Optional[str] = None,
                 jam_selesai: Optional[str] = None, status: Optional[str] = None,
                 mata_kuliah_id: Optional[int] = None, dosen_id: Optional[int] = None,
                 kelas_id: Optional[int] = None, ruangan_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """Update jadwal by ID"""
    updates = []
    params = []

    if hari is not None:
        updates.append("hari = ?")
        params.append(hari)
    if jam_mulai is not None:
        updates.append("jamMulai = ?")
        params.append(jam_mulai)
    if jam_selesai is not None:
        updates.append("jamSelesai = ?")
        params.append(jam_selesai)
    if status is not None:
        updates.append("status = ?")
        params.append(status)
    if mata_kuliah_id is not None:
        updates.append("mataKuliahId = ?")
        params.append(mata_kuliah_id)
    if dosen_id is not None:
        updates.append("dosenId = ?")
        params.append(dosen_id)
    if kelas_id is not None:
        updates.append("kelasId = ?")
        params.append(kelas_id)
    if ruangan_id is not None:
        updates.append("ruanganId = ?")
        params.append(ruangan_id)

    if not updates:
        return get_jadwal_by_id(jadwal_id)

    query = f"UPDATE Jadwal SET {', '.join(updates)} WHERE id = ?"
    params.append(jadwal_id)

    execute_query(query, tuple(params))
    return get_jadwal_by_id(jadwal_id)

@mcp.tool()
def update_jadwals(jadwal_updates: List[Dict[str, Any]]) -> List[Optional[Dict[str, Any]]]:
    """Update multiple jadwals in bulk"""
    if not jadwal_updates:
        return []
    
    results = []
    for update_data in jadwal_updates:
        jadwal_id = update_data.get('id')
        if not jadwal_id:
            results.append(None)
            continue
        
        # Extract update fields
        hari = update_data.get('hari')
        jam_mulai = update_data.get('jam_mulai')
        jam_selesai = update_data.get('jam_selesai')
        status = update_data.get('status')
        mata_kuliah_id = update_data.get('mata_kuliah_id')
        dosen_id = update_data.get('dosen_id')
        kelas_id = update_data.get('kelas_id')
        ruangan_id = update_data.get('ruangan_id')
        
        result = update_jadwal(jadwal_id, hari, jam_mulai, jam_selesai, status, 
                              mata_kuliah_id, dosen_id, kelas_id, ruangan_id)
        results.append(result)
    
    return results

@mcp.tool()
def delete_jadwal(jadwal_id: int) -> bool:
    """Delete jadwal by ID"""
    query = "DELETE FROM Jadwal WHERE id = ?"
    execute_query(query, (jadwal_id,))
    return True

# PermintaanJadwal operations
@mcp.tool()
def get_permintaan_jadwals() -> List[Dict[str, Any]]:
    """Get all permintaan jadwal"""
    query = """
    SELECT pj.*,
           j.hari, j.jamMulai, j.jamSelesai,
           mk.kodeMk, mk.namaMk,
           u.name as dosen_name
    FROM PermintaanJadwal pj
    JOIN Jadwal j ON pj.jadwalId = j.id
    JOIN MataKuliah mk ON j.mataKuliahId = mk.id
    JOIN User u ON pj.dosenId = u.id
    """
    return execute_query(query)

@mcp.tool()
def get_permintaan_jadwal_by_id(pj_id: int) -> Optional[Dict[str, Any]]:
    """Get permintaan jadwal by ID"""
    query = """
    SELECT pj.*,
           j.hari, j.jamMulai, j.jamSelesai,
           mk.kodeMk, mk.namaMk,
           u.name as dosen_name
    FROM PermintaanJadwal pj
    JOIN Jadwal j ON pj.jadwalId = j.id
    JOIN MataKuliah mk ON j.mataKuliahId = mk.id
    JOIN User u ON pj.dosenId = u.id
    WHERE pj.id = ?
    """
    results = execute_query(query, (pj_id,))
    return results[0] if results else None

@mcp.tool()
def create_permintaan_jadwal(alasan: str, jadwal_id: int, dosen_id: int,
                           status: str = "PENDING") -> Dict[str, Any]:
    """Create a new permintaan jadwal"""
    query = "INSERT INTO PermintaanJadwal (alasan, status, jadwalId, dosenId) VALUES (?, ?, ?, ?)"
    execute_query(query, (alasan, status, jadwal_id, dosen_id))

    pj_id = execute_query("SELECT last_insert_rowid() as id")[0]['id']
    return get_permintaan_jadwal_by_id(pj_id)

@mcp.tool()
def update_permintaan_jadwal(pj_id: int, alasan: Optional[str] = None, status: Optional[str] = None,
                           jadwal_id: Optional[int] = None, dosen_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """Update permintaan jadwal by ID"""
    updates = []
    params = []

    if alasan is not None:
        updates.append("alasan = ?")
        params.append(alasan)
    if status is not None:
        updates.append("status = ?")
        params.append(status)
    if jadwal_id is not None:
        updates.append("jadwalId = ?")
        params.append(jadwal_id)
    if dosen_id is not None:
        updates.append("dosenId = ?")
        params.append(dosen_id)

    if not updates:
        return get_permintaan_jadwal_by_id(pj_id)

    query = f"UPDATE PermintaanJadwal SET {', '.join(updates)} WHERE id = ?"
    params.append(pj_id)

    execute_query(query, tuple(params))
    return get_permintaan_jadwal_by_id(pj_id)

@mcp.tool()
def delete_permintaan_jadwal(pj_id: int) -> bool:
    """Delete permintaan jadwal by ID"""
    query = "DELETE FROM PermintaanJadwal WHERE id = ?"
    execute_query(query, (pj_id,))
    return True

if __name__ == "__main__":
    mcp.run()
