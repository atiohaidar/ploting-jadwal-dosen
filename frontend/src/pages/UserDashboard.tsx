import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  usersAPI,
  prodiAPI,
  mataKuliahAPI,
  kelasAPI,
  ruanganAPI,
  jadwalAPI
} from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProdi: 0,
    totalMataKuliah: 0,
    totalKelas: 0,
    totalRuangan: 0,
    totalJadwal: 0,
    usersByRole: { ADMIN: 0, DOSEN: 0, MAHASISWA: 0, KAPRODI: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [
        usersData,
        prodiData,
        mataKuliahData,
        kelasData,
        ruanganData,
        jadwalData
      ] = await Promise.all([
        usersAPI.findAll(),
        prodiAPI.findAll(),
        mataKuliahAPI.findAll(),
        kelasAPI.findAll(),
        ruanganAPI.findAll(),
        jadwalAPI.findAll()
      ]);

      // Calculate stats
      const usersByRole = usersData.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as any);

      setStats({
        totalUsers: usersData.length,
        totalProdi: prodiData.length,
        totalMataKuliah: mataKuliahData.length,
        totalKelas: kelasData.length,
        totalRuangan: ruanganData.length,
        totalJadwal: jadwalData.length,
        usersByRole
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#222222]">
        <div className="text-lg text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222222] text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="bg-[#494949] shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/jadwal')}
                className="bg-[#BFFF00] text-[#222222] font-semibold px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                📅 Jadwal
              </button>
              <button
                onClick={() => navigate('/users')}
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                👥 Users
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-900 border border-red-700 p-4">
            <div className="text-sm text-red-200" style={{ fontFamily: "'Inter', sans-serif" }}>
              {error}
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#494949] overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[#AAAAAA] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Total Users
                    </dt>
                    <dd className="text-lg font-medium text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {stats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#494949] overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">📚</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[#AAAAAA] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Total Prodi
                    </dt>
                    <dd className="text-lg font-medium text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {stats.totalProdi}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#494949] overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">📖</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[#AAAAAA] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Total Mata Kuliah
                    </dt>
                    <dd className="text-lg font-medium text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {stats.totalMataKuliah}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#494949] overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">🏫</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[#AAAAAA] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Total Kelas
                    </dt>
                    <dd className="text-lg font-medium text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {stats.totalKelas}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#494949] overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">🏢</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[#AAAAAA] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Total Ruangan
                    </dt>
                    <dd className="text-lg font-medium text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {stats.totalRuangan}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#494949] overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">📅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[#AAAAAA] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Total Jadwal
                    </dt>
                    <dd className="text-lg font-medium text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {stats.totalJadwal}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users by Role Chart */}
        <div className="bg-[#494949] shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-[#BFFF00] mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Users by Role
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.usersByRole).map(([role, count]) => (
                <div key={role} className="text-center">
                  <div className="text-2xl font-bold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {count}
                  </div>
                  <div className="text-sm text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
