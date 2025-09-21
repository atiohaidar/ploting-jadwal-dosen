import React, { useState, useEffect } from 'react';
import { Jadwal, User, MataKuliah, Kelas, Ruangan, CreateJadwalDto, UpdateJadwalDto, jadwalAPI } from '../../services/api.service';

interface JadwalFormProps {
  jadwal?: Jadwal;
  dosenList: User[];
  mataKuliahList: MataKuliah[];
  kelasList: Kelas[];
  ruanganList: Ruangan[];
  onSuccess: () => void;
  onCancel: () => void;
  dragData?: { hari: string; jamMulai: string; jamSelesai: string };
  prefilledFilters?: {
    dosen?: User;
    mataKuliah?: MataKuliah;
    kelas?: Kelas;
    ruangan?: Ruangan;
  };
}

const JadwalForm: React.FC<JadwalFormProps> = ({
  jadwal,
  dosenList,
  mataKuliahList,
  kelasList,
  ruanganList,
  onSuccess,
  onCancel,
  dragData,
  prefilledFilters
}) => {
  const [formData, setFormData] = useState<CreateJadwalDto | UpdateJadwalDto>({
    hari: jadwal?.hari || dragData?.hari || 'Senin',
    jamMulai: jadwal ? new Date(jadwal.jamMulai).toTimeString().slice(0, 5) : dragData?.jamMulai || '08:00',
    jamSelesai: jadwal ? new Date(jadwal.jamSelesai).toTimeString().slice(0, 5) : dragData?.jamSelesai || '10:00',
    mataKuliahId: jadwal?.mataKuliahId || prefilledFilters?.mataKuliah?.id || 0,
    dosenId: jadwal?.dosenId || prefilledFilters?.dosen?.id || 0,
    kelasId: jadwal?.kelasId || prefilledFilters?.kelas?.id || 0,
    ruanganId: jadwal?.ruanganId || prefilledFilters?.ruangan?.id || 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [onCancel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert time strings to full ISO strings
      const today = new Date().toISOString().split('T')[0];
      const jamMulai = new Date(`${today}T${formData.jamMulai}:00.000Z`);
      const jamSelesai = new Date(`${today}T${formData.jamSelesai}:00.000Z`);

      const submitData = {
        ...formData,
        jamMulai: jamMulai.toISOString(),
        jamSelesai: jamSelesai.toISOString(),
      };

      if (jadwal) {
        await jadwalAPI.update(jadwal.id, submitData as UpdateJadwalDto);
      } else {
        await jadwalAPI.create(submitData as CreateJadwalDto);
      }

      onSuccess();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(err.response.data.message || 'Konflik jadwal terdeteksi');
      } else {
        setError(err.response?.data?.message || 'Terjadi kesalahan');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#494949] rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-100 opacity-100">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#BFFF00] mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {jadwal ? 'Edit Jadwal' : 'Buat Jadwal Baru'}
          </h3>

          {error && (
            <div className="mb-4 rounded-md bg-red-900 border border-red-700 p-4">
              <div className="text-sm text-red-200" style={{ fontFamily: "'Inter', sans-serif" }}>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hari */}
            <div>
              <label className="block text-sm font-medium text-[#AAAAAA] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Hari
              </label>
              <select
                value={formData.hari}
                onChange={(e) => handleInputChange('hari', e.target.value)}
                className="w-full px-3 py-2 bg-[#222222] border border-[#656565] rounded-md text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#BFFF00] focus:border-transparent"
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              >
                {hariOptions.map((hari) => (
                  <option key={hari} value={hari}>
                    {hari}
                  </option>
                ))}
              </select>
            </div>

            {/* Jam Mulai */}
            <div>
              <label className="block text-sm font-medium text-[#AAAAAA] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Jam Mulai
              </label>
              <input
                type="time"
                value={formData.jamMulai}
                onChange={(e) => handleInputChange('jamMulai', e.target.value)}
                className="w-full px-3 py-2 bg-[#222222] border border-[#656565] rounded-md text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#BFFF00] focus:border-transparent"
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              />
            </div>

            {/* Jam Selesai */}
            <div>
              <label className="block text-sm font-medium text-[#AAAAAA] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Jam Selesai
              </label>
              <input
                type="time"
                value={formData.jamSelesai}
                onChange={(e) => handleInputChange('jamSelesai', e.target.value)}
                className="w-full px-3 py-2 bg-[#222222] border border-[#656565] rounded-md text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#BFFF00] focus:border-transparent"
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              />
            </div>

            {/* Mata Kuliah */}
            <div>
              <label className="block text-sm font-medium text-[#AAAAAA] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Mata Kuliah
              </label>
              <select
                value={formData.mataKuliahId}
                onChange={(e) => handleInputChange('mataKuliahId', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#222222] border border-[#656565] rounded-md text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#BFFF00] focus:border-transparent"
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              >
                <option value={0}>Pilih Mata Kuliah</option>
                {mataKuliahList.map((mk) => (
                  <option key={mk.id} value={mk.id}>
                    {mk.namaMk} ({mk.kodeMk})
                  </option>
                ))}
              </select>
            </div>

            {/* Dosen */}
            <div>
              <label className="block text-sm font-medium text-[#AAAAAA] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Dosen
              </label>
              <select
                value={formData.dosenId}
                onChange={(e) => handleInputChange('dosenId', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#222222] border border-[#656565] rounded-md text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#BFFF00] focus:border-transparent"
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              >
                <option value={0}>Pilih Dosen</option>
                {dosenList.map((dosen) => (
                  <option key={dosen.id} value={dosen.id}>
                    {dosen.name} {dosen.nip && `(${dosen.nip})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Kelas */}
            <div>
              <label className="block text-sm font-medium text-[#AAAAAA] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Kelas
              </label>
              <select
                value={formData.kelasId}
                onChange={(e) => handleInputChange('kelasId', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#222222] border border-[#656565] rounded-md text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#BFFF00] focus:border-transparent"
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              >
                <option value={0}>Pilih Kelas</option>
                {kelasList.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.namaKelas} (Angkatan {kelas.angkatan})
                  </option>
                ))}
              </select>
            </div>

            {/* Ruangan */}
            <div>
              <label className="block text-sm font-medium text-[#AAAAAA] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Ruangan
              </label>
              <select
                value={formData.ruanganId}
                onChange={(e) => handleInputChange('ruanganId', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#222222] border border-[#656565] rounded-md text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#BFFF00] focus:border-transparent"
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              >
                <option value={0}>Pilih Ruangan</option>
                {ruanganList.map((ruangan) => (
                  <option key={ruangan.id} value={ruangan.id}>
                    {ruangan.nama} (Kapasitas: {ruangan.kapasitas})
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-[#656565] text-[#AAAAAA] rounded-md hover:bg-[#525252] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#BFFF00] text-[#222222] rounded-md hover:bg-opacity-90 transition-colors font-medium"
                style={{ fontFamily: "'Inter', sans-serif" }}
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : (jadwal ? 'Update' : 'Buat')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JadwalForm;