import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { prodiAPI, Prodi, CreateProdiDto, UpdateProdiDto } from '../services/api.service';

interface ProdiFormProps {
    isEdit?: boolean;
}

const ProdiForm: React.FC<ProdiFormProps> = ({ isEdit = false }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreateProdiDto>({
        namaProdi: '',
    });

    useEffect(() => {
        if (isEdit && id) {
            fetchProdi(parseInt(id));
        }
    }, [isEdit, id]);

    const fetchProdi = async (prodiId: number) => {
        try {
            setFetchLoading(true);
            const prodi = await prodiAPI.findAll();
            const foundProdi = prodi.find(p => p.id === prodiId);
            if (foundProdi) {
                setFormData({
                    namaProdi: foundProdi.namaProdi,
                });
            } else {
                setError('Prodi not found');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch prodi');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.namaProdi.trim()) {
            setError('Nama Prodi is required');
            return;
        }

        try {
            setLoading(true);
            if (isEdit && id) {
                const updateData: UpdateProdiDto = {
                    namaProdi: formData.namaProdi,
                };
                await prodiAPI.update(parseInt(id), updateData);
            } else {
                const createData: CreateProdiDto = {
                    namaProdi: formData.namaProdi,
                };
                await prodiAPI.create(createData);
            }
            navigate('/prodi');
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} prodi`);
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
                        {isEdit ? 'Edit Prodi' : 'Create New Prodi'}
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
                            <label htmlFor="namaProdi" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Nama Prodi *
                            </label>
                            <input
                                type="text"
                                name="namaProdi"
                                id="namaProdi"
                                required
                                value={formData.namaProdi}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                                placeholder="e.g., Teknik Informatika"
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-[#BFFF00] text-[#222222] font-semibold px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                {loading ? 'Saving...' : (isEdit ? 'Update Prodi' : 'Create Prodi')}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/prodi')}
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

export default ProdiForm;