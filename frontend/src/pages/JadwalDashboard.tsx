import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Jadwal,
    User,
    MataKuliah,
    Kelas,
    Ruangan,
    jadwalAPI,
    usersAPI,
    mataKuliahAPI,
    kelasAPI,
    ruanganAPI
} from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';
import CalendarView from '../components/calendar/CalendarView';
import StatisticsPanel from '../components/calendar/StatisticsPanel';
import JadwalFilters from '../components/calendar/JadwalFilters';
import JadwalForm from '../components/calendar/JadwalForm';

const JadwalDashboard: React.FC = () => {
    const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
    const [filteredJadwal, setFilteredJadwal] = useState<Jadwal[]>([]);
    const [dosenList, setDosenList] = useState<User[]>([]);
    const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);
    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [ruanganList, setRuanganList] = useState<Ruangan[]>([]);

    // Filter states
    const [selectedDosen, setSelectedDosen] = useState<User>();
    const [selectedMataKuliah, setSelectedMataKuliah] = useState<MataKuliah>();
    const [selectedKelas, setSelectedKelas] = useState<Kelas>();
    const [selectedRuangan, setSelectedRuangan] = useState<Ruangan>();
    const [selectedHari, setSelectedHari] = useState<string>();

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<Jadwal>();
  const [selectedJadwalForStats, setSelectedJadwalForStats] = useState<Jadwal>();
  const [dragData, setDragData] = useState<{ hari: string; jamMulai: string; jamSelesai: string } | undefined>();    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [jadwalList, selectedDosen, selectedMataKuliah, selectedKelas, selectedRuangan, selectedHari]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [
                jadwalData,
                dosenData,
                mataKuliahData,
                kelasData,
                ruanganData
            ] = await Promise.all([
                jadwalAPI.findAll(),
                usersAPI.findAll(),
                mataKuliahAPI.findAll(),
                kelasAPI.findAll(),
                ruanganAPI.findAll()
            ]);

            // Filter dosen only
            const filteredDosen = dosenData.filter(user => user.role === 'DOSEN');

            setJadwalList(jadwalData);
            setDosenList(filteredDosen);
            setMataKuliahList(mataKuliahData);
            setKelasList(kelasData);
            setRuanganList(ruanganData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = jadwalList;

        if (selectedDosen) {
            filtered = filtered.filter(j => j.dosenId === selectedDosen.id);
        }

        if (selectedMataKuliah) {
            filtered = filtered.filter(j => j.mataKuliahId === selectedMataKuliah.id);
        }

        if (selectedKelas) {
            filtered = filtered.filter(j => j.kelasId === selectedKelas.id);
        }

        if (selectedRuangan) {
            filtered = filtered.filter(j => j.ruanganId === selectedRuangan.id);
        }

        if (selectedHari) {
            filtered = filtered.filter(j => j.hari === selectedHari);
        }

        setFilteredJadwal(filtered);
    };

    const clearFilters = () => {
        setSelectedDosen(undefined);
        setSelectedMataKuliah(undefined);
        setSelectedKelas(undefined);
        setSelectedRuangan(undefined);
        setSelectedHari(undefined);
    };

    const handleJadwalClick = (jadwal: Jadwal) => {
        setSelectedJadwalForStats(jadwal);
    };

  const handleCreateJadwal = (date?: Date, timeSlot?: string) => {
    setEditingJadwal(undefined);
    setShowForm(true);
  };

  const handleDragCreateJadwal = (dragDataParam: { hari: string; jamMulai: string; jamSelesai: string }) => {
    setDragData(dragDataParam);
    setEditingJadwal(undefined);
    setShowForm(true);
  };    const handleEditJadwal = (jadwal: Jadwal) => {
        setEditingJadwal(jadwal);
        setShowForm(true);
    };

    const handleDeleteJadwal = async (jadwal: Jadwal) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
            return;
        }

        try {
            await jadwalAPI.delete(jadwal.id);
            setJadwalList(jadwalList.filter(j => j.id !== jadwal.id));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete jadwal');
        }
    };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingJadwal(undefined);
    setDragData(undefined);
    fetchAllData(); // Refresh data
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingJadwal(undefined);
    setDragData(undefined);
  };    const handleLogout = () => {
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
                        <h1 className="text-3xl font-bold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            📅 Manajemen Jadwal
                        </h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-[#BFFF00] text-[#222222] font-semibold px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                ➕ Buat Jadwal
                            </button>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-blue-600 text-white font-semibold px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/prodi')}
                                    className="bg-green-600 text-white font-semibold px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    Prodi
                                </button>
                                <button
                                    onClick={() => navigate('/mata-kuliah')}
                                    className="bg-purple-600 text-white font-semibold px-3 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    Mata Kuliah
                                </button>
                                <button
                                    onClick={() => navigate('/kelas')}
                                    className="bg-orange-600 text-white font-semibold px-3 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    Kelas
                                </button>
                                <button
                                    onClick={() => navigate('/ruangan')}
                                    className="bg-red-600 text-white font-semibold px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    Ruangan
                                </button>
                                <button
                                    onClick={() => navigate('/jadwal')}
                                    className="bg-indigo-600 text-white font-semibold px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    Jadwal
                                </button>
                            </div>
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

                {/* Filters */}
                <JadwalFilters
                    dosenList={dosenList}
                    mataKuliahList={mataKuliahList}
                    kelasList={kelasList}
                    ruanganList={ruanganList}
                    selectedDosen={selectedDosen}
                    selectedMataKuliah={selectedMataKuliah}
                    selectedKelas={selectedKelas}
                    selectedRuangan={selectedRuangan}
                    selectedHari={selectedHari}
                    onDosenChange={setSelectedDosen}
                    onMataKuliahChange={setSelectedMataKuliah}
                    onKelasChange={setSelectedKelas}
                    onRuanganChange={setSelectedRuangan}
                    onHariChange={setSelectedHari}
                    onClearFilters={clearFilters}
                />

                <div className="space-y-6">
          {/* Calendar View - Full Width */}
          <div>
            <CalendarView
              jadwalList={filteredJadwal}
              onJadwalClick={handleJadwalClick}
              onCreateJadwal={handleCreateJadwal}
              onDragCreateJadwal={handleDragCreateJadwal}
            />
          </div>

          {/* Statistics Panel - Below Calendar */}
          <div>
            <StatisticsPanel
              jadwalList={jadwalList}
              selectedDosen={selectedJadwalForStats?.dosen}
              selectedKelas={selectedJadwalForStats?.kelas}
            />
          </div>
        </div>

                {/* Jadwal List */}
                <div className="mt-8 bg-[#494949] shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-4 sm:px-6 border-b border-[#656565]">
                        <h2 className="text-xl font-semibold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Daftar Jadwal ({filteredJadwal.length})
                        </h2>
                    </div>
                    <ul className="divide-y divide-[#656565]">
                        {filteredJadwal.map((jadwal) => (
                            <li key={jadwal.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                                    {jadwal.mataKuliah.namaMk}
                                                </div>
                                                <div className="text-sm text-[#656565]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {jadwal.hari}
                                                </div>
                                                <div className="text-sm text-[#656565]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {new Date(jadwal.jamMulai).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })} - {new Date(jadwal.jamSelesai).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-sm text-[#656565]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                <span>Dosen: {jadwal.dosen.name}</span>
                                                <span className="mx-2">•</span>
                                                <span>Kelas: {jadwal.kelas.namaKelas}</span>
                                                <span className="mx-2">•</span>
                                                <span>Ruangan: {jadwal.ruangan.nama}</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditJadwal(jadwal)}
                                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                                                style={{ fontFamily: "'Inter', sans-serif" }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteJadwal(jadwal)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                                style={{ fontFamily: "'Inter', sans-serif" }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {filteredJadwal.length === 0 && (
                        <div className="text-center py-8 text-[#656565]" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Tidak ada jadwal ditemukan.
                        </div>
                    )}
                </div>
            </div>

            {/* Jadwal Form Modal */}
            {showForm && (
                <JadwalForm
                    jadwal={editingJadwal}
                    dosenList={dosenList}
                    mataKuliahList={mataKuliahList}
                    kelasList={kelasList}
                    ruanganList={ruanganList}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                    dragData={dragData}
                    prefilledFilters={{
                        dosen: selectedDosen,
                        mataKuliah: selectedMataKuliah,
                        kelas: selectedKelas,
                        ruangan: selectedRuangan
                    }}
                />
            )}
        </div>
    );
};

export default JadwalDashboard;