import React, { useState, useEffect } from 'react';
import { mataKuliahAPI, MataKuliah, prodiAPI, Prodi } from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';

const MataKuliahDashboard: React.FC = () => {
    const [mataKuliah, setMataKuliah] = useState<MataKuliah[]>([]);
    const [prodi, setProdi] = useState<Prodi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { logout } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [mataKuliahData, prodiData] = await Promise.all([
                mataKuliahAPI.findAll(),
                prodiAPI.findAll()
            ]);
            setMataKuliah(mataKuliahData);
            setProdi(prodiData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this mata kuliah?')) {
            return;
        }

        try {
            await mataKuliahAPI.delete(id);
            setMataKuliah(mataKuliah.filter(mk => mk.id !== id));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete mata kuliah');
        }
    };

    const handleLogout = () => {
        logout();
    };

    const getProdiName = (prodiId: number) => {
        const foundProdi = prodi.find(p => p.id === prodiId);
        return foundProdi ? foundProdi.namaProdi : 'Unknown';
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
                        <h1 className="text-3xl font-bold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>Mata Kuliah Management</h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => window.location.href = '/mata-kuliah/create'}
                                className="bg-[#BFFF00] text-[#222222] font-semibold px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                Add Mata Kuliah
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

                {/* Mata Kuliah List */}
                <div className="bg-[#494949] shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-[#656565]">
                        {mataKuliah.map((mk) => (
                            <li key={mk.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-[#525252] flex items-center justify-center border border-[#656565]">
                                                    <span className="text-sm font-medium text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                                        {mk.kodeMk.charAt(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                                    {mk.kodeMk} - {mk.namaMk}
                                                </div>
                                                <div className="text-sm text-[#656565]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {mk.sks} SKS • {getProdiName(mk.prodiId)} • {mk.Jadwal.length} jadwal
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => window.location.href = `/mata-kuliah/edit/${mk.id}`}
                                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                                                style={{ fontFamily: "'Inter', sans-serif" }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(mk.id)}
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
                    {mataKuliah.length === 0 && (
                        <div className="text-center py-8 text-[#656565]" style={{ fontFamily: "'Inter', sans-serif" }}>
                            No mata kuliah found. <a href="/mata-kuliah/create" className="text-[#BFFF00] hover:underline">Create your first mata kuliah</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MataKuliahDashboard;