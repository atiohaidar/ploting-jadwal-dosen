import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ruanganAPI, Ruangan, CreateRuanganDto, UpdateRuanganDto } from '../services/api.service';

interface RuanganFormProps {
    isEdit?: boolean;
}

const RuanganForm: React.FC<RuanganFormProps> = ({ isEdit = false }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreateRuanganDto>({
        nama: '',
        kapasitas: 1,
        lokasi: '',
    });

    useEffect(() => {
        if (isEdit && id) {
            fetchRuangan(parseInt(id));
        }
    }, [isEdit, id]);

    const fetchRuangan = async (ruanganId: number) => {
        try {
            setFetchLoading(true);
            const ruangan = await ruanganAPI.findAll();
            const foundRuangan = ruangan.find(r => r.id === ruanganId);
            if (foundRuangan) {
                setFormData({
                    nama: foundRuangan.nama,
                    kapasitas: foundRuangan.kapasitas,
                    lokasi: foundRuangan.lokasi || '',
                });
            } else {
                setError('Ruangan not found');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch ruangan');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'kapasitas' ? parseInt(value) : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.nama.trim()) {
            setError('Nama ruangan is required');
            return;
        }

        if (formData.kapasitas < 1) {
            setError('Kapasitas must be at least 1');
            return;
        }

        try {
            setLoading(true);
            if (isEdit && id) {
                const updateData: UpdateRuanganDto = {
                    nama: formData.nama,
                    kapasitas: formData.kapasitas,
                    lokasi: formData.lokasi || undefined,
                };
                await ruanganAPI.update(parseInt(id), updateData);
            } else {
                const createData: CreateRuanganDto = {
                    nama: formData.nama,
                    kapasitas: formData.kapasitas,
                    lokasi: formData.lokasi || undefined,
                };
                await ruanganAPI.create(createData);
            }
            navigate('/ruangan');
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} ruangan`);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#222222]">
                <div className="text-lg text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#222222] text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-[#494949] shadow rounded-lg p-6">
                    <h2 className="text-3xl font-bold text-[#BFFF00] mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {isEdit ? 'Edit Ruangan' : 'Create New Ruangan'}
                    </h2>

                    {error && (
                        <div className="mb-4 rounded-md bg-red-900 border border-red-700 p-4">
                            <div className="text-sm text-red-200" style={{ fontFamily: "'Inter', sans-serif" }}>
                                {error}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="nama" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Nama Ruangan *
                            </label>
                            <input
                                type="text"
                                name="nama"
                                id="nama"
                                required
                                value={formData.nama}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                                placeholder="e.g., Ruang 101"
                            />
                        </div>

                        <div>
                            <label htmlFor="kapasitas" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Kapasitas *
                            </label>
                            <input
                                type="number"
                                name="kapasitas"
                                id="kapasitas"
                                required
                                min="1"
                                max="500"
                                value={formData.kapasitas}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                                placeholder="e.g., 50"
                            />
                        </div>

                        <div>
                            <label htmlFor="lokasi" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Lokasi
                            </label>
                            <input
                                type="text"
                                name="lokasi"
                                id="lokasi"
                                value={formData.lokasi}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                                placeholder="e.g., Gedung A Lantai 1"
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-[#BFFF00] text-[#222222] font-semibold px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                {loading ? 'Saving...' : (isEdit ? 'Update Ruangan' : 'Create Ruangan')}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/ruangan')}
                                className="flex-1 bg-[#656565] text-[#AAAAAA] font-semibold px-4 py-2 rounded-md hover:bg-[#525252] transition-colors"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RuanganForm;