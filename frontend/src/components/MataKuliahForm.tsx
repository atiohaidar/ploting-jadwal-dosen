import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mataKuliahAPI, prodiAPI, MataKuliah, Prodi, CreateMataKuliahDto, UpdateMataKuliahDto } from '../services/api.service';

interface MataKuliahFormProps {
    isEdit?: boolean;
}

const MataKuliahForm: React.FC<MataKuliahFormProps> = ({ isEdit = false }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError] = useState('');
    const [prodi, setProdi] = useState<Prodi[]>([]);
    const [formData, setFormData] = useState<CreateMataKuliahDto>({
        kodeMk: '',
        namaMk: '',
        sks: 1,
        prodiId: 0,
    });

    useEffect(() => {
        fetchProdi();
        if (isEdit && id) {
            fetchMataKuliah(parseInt(id));
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

    const fetchMataKuliah = async (mataKuliahId: number) => {
        try {
            setFetchLoading(true);
            const mataKuliah = await mataKuliahAPI.findAll();
            const foundMataKuliah = mataKuliah.find(mk => mk.id === mataKuliahId);
            if (foundMataKuliah) {
                setFormData({
                    kodeMk: foundMataKuliah.kodeMk,
                    namaMk: foundMataKuliah.namaMk,
                    sks: foundMataKuliah.sks,
                    prodiId: foundMataKuliah.prodiId,
                });
            } else {
                setError('Mata Kuliah not found');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch mata kuliah');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'sks' || name === 'prodiId' ? parseInt(value) : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.kodeMk.trim() || !formData.namaMk.trim()) {
            setError('Kode MK and Nama MK are required');
            return;
        }

        if (!formData.prodiId) {
            setError('Prodi must be selected');
            return;
        }

        try {
            setLoading(true);
            if (isEdit && id) {
                const updateData: UpdateMataKuliahDto = {
                    kodeMk: formData.kodeMk,
                    namaMk: formData.namaMk,
                    sks: formData.sks,
                    prodiId: formData.prodiId,
                };
                await mataKuliahAPI.update(parseInt(id), updateData);
            } else {
                const createData: CreateMataKuliahDto = {
                    kodeMk: formData.kodeMk,
                    namaMk: formData.namaMk,
                    sks: formData.sks,
                    prodiId: formData.prodiId,
                };
                await mataKuliahAPI.create(createData);
            }
            navigate('/mata-kuliah');
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} mata kuliah`);
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
                        {isEdit ? 'Edit Mata Kuliah' : 'Create New Mata Kuliah'}
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
                            <label htmlFor="kodeMk" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Kode MK *
                            </label>
                            <input
                                type="text"
                                name="kodeMk"
                                id="kodeMk"
                                required
                                value={formData.kodeMk}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                                placeholder="e.g., TI101"
                            />
                        </div>

                        <div>
                            <label htmlFor="namaMk" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Nama MK *
                            </label>
                            <input
                                type="text"
                                name="namaMk"
                                id="namaMk"
                                required
                                value={formData.namaMk}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                                placeholder="e.g., Pemrograman Dasar"
                            />
                        </div>

                        <div>
                            <label htmlFor="sks" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                SKS *
                            </label>
                            <input
                                type="number"
                                name="sks"
                                id="sks"
                                required
                                min="1"
                                max="6"
                                value={formData.sks}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                                style={{ fontFamily: "'Inter', sans-serif" }}
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
                                {loading ? 'Saving...' : (isEdit ? 'Update Mata Kuliah' : 'Create Mata Kuliah')}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/mata-kuliah')}
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

export default MataKuliahForm;