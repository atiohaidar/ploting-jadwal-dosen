import React from 'react';
import { User, MataKuliah, Kelas, Ruangan } from '../../services/api.service';

interface JadwalFiltersProps {
  dosenList: User[];
  mataKuliahList: MataKuliah[];
  kelasList: Kelas[];
  ruanganList: Ruangan[];
  selectedDosen?: User;
  selectedMataKuliah?: MataKuliah;
  selectedKelas?: Kelas;
  selectedRuangan?: Ruangan;
  selectedHari?: string;
  onDosenChange: (dosen?: User) => void;
  onMataKuliahChange: (mataKuliah?: MataKuliah) => void;
  onKelasChange: (kelas?: Kelas) => void;
  onRuanganChange: (ruangan?: Ruangan) => void;
  onHariChange: (hari?: string) => void;
  onClearFilters: () => void;
}

const JadwalFilters: React.FC<JadwalFiltersProps> = ({
  dosenList,
  mataKuliahList,
  kelasList,
  ruanganList,
  selectedDosen,
  selectedMataKuliah,
  selectedKelas,
  selectedRuangan,
  selectedHari,
  onDosenChange,
  onMataKuliahChange,
  onKelasChange,
  onRuanganChange,
  onHariChange,
  onClearFilters
}) => {
  const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  return (
    <div className="bg-[#494949] rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
          🔍 Filter Jadwal
        </h3>
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Hapus Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Dosen Filter */}
        <div>
          <label className="block text-sm font-medium text-[#AAAAAA] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            Dosen
          </label>
          <select
            value={selectedDosen?.id || ''}
            onChange={(e) => {
              const dosenId = e.target.value;
              const dosen = dosenList.find(d => d.id === parseInt(dosenId));
              onDosenChange(dosen);
            }}
            className="w-full px-3 py-2 bg-[#222222] border border-[#656565] rounded-md text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#BFFF00] focus:border-transparent"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <option value="">Semua Dosen</option>
            {dosenList.map((dosen) => (
              <option key={dosen.id} value={dosen.id}>
                {dosen.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mata Kuliah Filter */}
        <div>
          <label className="block text-sm font-medium text-[#AAAAAA] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            Mata Kuliah
          </label>
          <select
            value={selectedMataKuliah?.id || ''}
            onChange={(e) => {
              const mkId = e.target.value;
              const mataKuliah = mataKuliahList.find(mk => mk.id === parseInt(mkId));
              onMataKuliahChange(mataKuliah);
            }}
            className="w-full px-3 py-2 bg-[#222222] border border-[#656565] rounded-md text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#BFFF00] focus:border-transparent"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <option value="">Semua Mata Kuliah</option>
            {mataKuliahList.map((mk) => (
              <option key={mk.id} value={mk.id}>
                {mk.namaMk}
              </option>
            ))}
          </select>
        </div>

        {/* Kelas Filter */}
        <div>
          <label className="block text-sm font-medium text-[#AAAAAA] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            Kelas
          </label>
          <select
            value={selectedKelas?.id || ''}
            onChange={(e) => {
              const kelasId = e.target.value;
              const kelas = kelasList.find(k => k.id === parseInt(kelasId));
              onKelasChange(kelas);
            }}
            className="w-full px-3 py-2 bg-[#222222] border border-[#656565] rounded-md text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#BFFF00] focus:border-transparent"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((kelas) => (
              <option key={kelas.id} value={kelas.id}>
                {kelas.namaKelas}
              </option>
            ))}
          </select>
        </div>

        {/* Ruangan Filter */}
        <div>
          <label className="block text-sm font-medium text-[#AAAAAA] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            Ruangan
          </label>
          <select
            value={selectedRuangan?.id || ''}
            onChange={(e) => {
              const ruanganId = e.target.value;
              const ruangan = ruanganList.find(r => r.id === parseInt(ruanganId));
              onRuanganChange(ruangan);
            }}
            className="w-full px-3 py-2 bg-[#222222] border border-[#656565] rounded-md text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#BFFF00] focus:border-transparent"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <option value="">Semua Ruangan</option>
            {ruanganList.map((ruangan) => (
              <option key={ruangan.id} value={ruangan.id}>
                {ruangan.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Hari Filter */}
        <div>
          <label className="block text-sm font-medium text-[#AAAAAA] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            Hari
          </label>
          <select
            value={selectedHari || ''}
            onChange={(e) => {
              const hari = e.target.value;
              onHariChange(hari || undefined);
            }}
            className="w-full px-3 py-2 bg-[#222222] border border-[#656565] rounded-md text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#BFFF00] focus:border-transparent"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <option value="">Semua Hari</option>
            {hariOptions.map((hari) => (
              <option key={hari} value={hari}>
                {hari}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="mt-4 flex flex-wrap gap-2">
        {selectedDosen && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900 text-blue-200">
            Dosen: {selectedDosen.name}
            <button
              onClick={() => onDosenChange(undefined)}
              className="ml-2 text-blue-300 hover:text-blue-100"
            >
              ×
            </button>
          </span>
        )}

        {selectedMataKuliah && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-900 text-green-200">
            MK: {selectedMataKuliah.namaMk}
            <button
              onClick={() => onMataKuliahChange(undefined)}
              className="ml-2 text-green-300 hover:text-green-100"
            >
              ×
            </button>
          </span>
        )}

        {selectedKelas && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-900 text-purple-200">
            Kelas: {selectedKelas.namaKelas}
            <button
              onClick={() => onKelasChange(undefined)}
              className="ml-2 text-purple-300 hover:text-purple-100"
            >
              ×
            </button>
          </span>
        )}

        {selectedRuangan && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-900 text-orange-200">
            Ruangan: {selectedRuangan.nama}
            <button
              onClick={() => onRuanganChange(undefined)}
              className="ml-2 text-orange-300 hover:text-orange-100"
            >
              ×
            </button>
          </span>
        )}

        {selectedHari && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-900 text-yellow-200">
            Hari: {selectedHari}
            <button
              onClick={() => onHariChange(undefined)}
              className="ml-2 text-yellow-300 hover:text-yellow-100"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default JadwalFilters;