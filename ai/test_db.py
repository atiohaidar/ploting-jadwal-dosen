#!/usr/bin/env python3
"""
Test script untuk MCP Database Server
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from ai.mcp_ploting_jadwal_dosen import get_users

def test_database_connection():
    """Test koneksi database dan ambil data users"""
    try:
        users = get_users()
        print(f"✅ Koneksi database berhasil! Ditemukan {len(users)} users.")
        if users:
            print("Sample user:")
            print(f"  ID: {users[0].get('id')}")
            print(f"  Name: {users[0].get('name')}")
            print(f"  Email: {users[0].get('email')}")
            print(f"  Role: {users[0].get('role')}")
        return True
    except Exception as e:
        print(f"❌ Error koneksi database: {e}")
        return False

if __name__ == "__main__":
    test_database_connection()