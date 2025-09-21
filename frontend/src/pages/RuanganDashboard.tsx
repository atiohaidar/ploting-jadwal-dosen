import React, { useState, useEffect } from 'react';
import { ruanganAPI, Ruangan } from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';

const RuanganDashboard: React.FC = () => {
    const [ruangan, setRuangan] = useState<Ruangan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { logout } = useAuth();

    useEffect(() => {
        fetchRuangan();
    }, []);

    const fetchRuangan = async () => {
        try {
            setLoading(true);
            const ruanganData = await ruanganAPI.findAll();
            setRuangan(ruanganData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch ruangan');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this ruangan?')) {
            return;
        }

        try {
            await ruanganAPI.delete(id);
            setRuangan(ruangan.filter(r => r.id !== id));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete ruangan');
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
                        <h1 className="text-3xl font-bold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>Ruangan Management</h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => window.location.href = '/ruangan/create'}
                                className="bg-[#BFFF00] text-[#222222] font-semibold px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                Add Ruangan
                            </button>
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="bg-[#656565] text-[#AAAAAA] font-semibold px-4 py-2 rounded-md hover:bg-[#525252] transition-colors"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                Back to Dashboard
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

                {/* Ruangan List */}
                <div className="bg-[#494949] shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-[#656565]">
                        {ruangan.map((r) => (
                            <li key={r.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-[#525252] flex items-center justify-center border border-[#656565]">
                                                    <span className="text-sm font-medium text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                                        {r.nama.charAt(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                                    {r.nama}
                                                </div>
                                                <div className="text-sm text-[#656565]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    Kapasitas: {r.kapasitas} • {r.Jadwal.length} jadwal
                                                    {r.lokasi && ` • ${r.lokasi}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => window.location.href = `/ruangan/edit/${r.id}`}
                                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                                                style={{ fontFamily: "'Inter', sans-serif" }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(r.id)}
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
                    {ruangan.length === 0 && (
                        <div className="text-center py-8 text-[#656565]" style={{ fontFamily: "'Inter', sans-serif" }}>
                            No ruangan found. <a href="/ruangan/create" className="text-[#BFFF00] hover:underline">Create your first ruangan</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RuanganDashboard;