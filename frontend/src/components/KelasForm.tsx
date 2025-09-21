import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { kelasAPI, prodiAPI, Kelas, Prodi, CreateKelasDto, UpdateKelasDto } from '../services/api.service';

interface KelasFormProps {
    isEdit?: boolean;
}

const KelasForm: React.FC<KelasFormProps> = ({ isEdit = false }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError] = useState('');
    const [prodi, setProdi] = useState<Prodi[]>([]);
    const [formData, setFormData] = useState<CreateKelasDto>({
        namaKelas: '',
        angkatan: new Date().getFullYear(),
        prodiId: 0,
    });

    useEffect(() => {
        fetchProdi();
        if (isEdit && id) {
            fetchKelas(parseInt(id));
        }
    }, [isEdit, id]);

    const fetchProdi = async () => {
        try {
            const prodiData = await prodiAPI.findAll();
            setProdi(prodiData);
        } catch (err: any) {
            setError('Failed to fetch prodi data');
        }
    };

    const fetchKelas = async (kelasId: number) => {
        try {
            setFetchLoading(true);
            const kelas = await kelasAPI.findAll();
            const foundKelas = kelas.find(k => k.id === kelasId);
            if (foundKelas) {
                setFormData({
                    namaKelas: foundKelas.namaKelas,
                    angkatan: foundKelas.angkatan,
                    prodiId: foundKelas.prodiId,
                });
            } else {
                setError('Kelas not found');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch kelas');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'angkatan' || name === 'prodiId' ? parseInt(value) : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.namaKelas.trim()) {
            setError('Nama Kelas is required');
            return;
        }

        if (!formData.prodiId) {
            setError('Prodi must be selected');
            return;
        }

        if (formData.angkatan < 2000 || formData.angkatan > new Date().getFullYear() + 10) {
            setError('Angkatan must be a valid year');
            return;
        }

        try {
            setLoading(true);
            if (isEdit && id) {
                const updateData: UpdateKelasDto = {
                    namaKelas: formData.namaKelas,
                    angkatan: formData.angkatan,
                    prodiId: formData.prodiId,
                };
                await kelasAPI.update(parseInt(id), updateData);
            } else {
                const createData: CreateKelasDto = {
                    namaKelas: formData.namaKelas,
                    angkatan: formData.angkatan,
                    prodiId: formData.prodiId,
                };
                await kelasAPI.create(createData);
            }
            navigate('/kelas');
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} kelas`);
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
                        {isEdit ? 'Edit Kelas' : 'Create New Kelas'}
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
                            <label htmlFor="namaKelas" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Nama Kelas *
                            </label>
                            <input
                                type="text"
                                name="namaKelas"
                                id="namaKelas"
                                required
                                value={formData.namaKelas}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                                placeholder="e.g., TI-3A"
                            />
                        </div>

                        <div>
                            <label htmlFor="angkatan" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Angkatan *
                            </label>
                            <input
                                type="number"
                                name="angkatan"
                                id="angkatan"
                                required
                                min="2000"
                                max={new Date().getFullYear() + 10}
                                value={formData.angkatan}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                                placeholder="e.g., 2023"
                            />
                        </div>

                        <div>
                            <label htmlFor="prodiId" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Prodi *
                            </label>
                            <select
                                name="prodiId"
                                id="prodiId"
                                required
                                value={formData.prodiId}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                <option value="">Select Prodi</option>
                                {prodi.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.namaProdi}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-[#BFFF00] text-[#222222] font-semibold px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                {loading ? 'Saving...' : (isEdit ? 'Update Kelas' : 'Create Kelas')}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/kelas')}
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

export default KelasForm;