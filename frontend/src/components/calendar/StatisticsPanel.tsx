import React from 'react';
import { Jadwal, User } from '../../services/api.service';

interface StatisticsPanelProps {
    jadwalList: Jadwal[];
    selectedDosen?: User;
    selectedKelas?: any;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
    jadwalList,
    selectedDosen,
    selectedKelas
}) => {
    // Calculate teaching hours for dosen
    const calculateDosenStats = (dosenId: number) => {
        const dosenJadwal = jadwalList.filter(j => j.dosenId === dosenId);

        // Group by day
        const dailyStats = dosenJadwal.reduce((acc, jadwal) => {
            if (!acc[jadwal.hari]) {
                acc[jadwal.hari] = [];
            }
            acc[jadwal.hari].push(jadwal);
            return acc;
        }, {} as { [key: string]: Jadwal[] });

        // Calculate hours per day and week
        const dayStats = Object.entries(dailyStats).map(([hari, jadwals]) => {
            const totalHours = jadwals.reduce((sum, jadwal) => {
                const [startHour, startMin] = jadwal.jamMulai.split(':').map(Number);
                const [endHour, endMin] = jadwal.jamSelesai.split(':').map(Number);
                const startDecimal = startHour + startMin / 60;
                const endDecimal = endHour + endMin / 60;
                const hours = endDecimal - startDecimal;
                return sum + hours;
            }, 0);

            return { hari, hours: Math.round(totalHours * 100) / 100 };
        });

        const weeklyHours = dayStats.reduce((sum, day) => sum + day.hours, 0);

        return { dayStats, weeklyHours };
    };

    // Calculate class attendance stats
    const calculateKelasStats = (kelasId: number) => {
        const kelasJadwal = jadwalList.filter(j => j.kelasId === kelasId);

        // Group by day
        const dailyStats = kelasJadwal.reduce((acc, jadwal) => {
            if (!acc[jadwal.hari]) {
                acc[jadwal.hari] = [];
            }
            acc[jadwal.hari].push(jadwal);
            return acc;
        }, {} as { [key: string]: Jadwal[] });

        // Calculate sessions per day and week
        const dayStats = Object.entries(dailyStats).map(([hari, jadwals]) => {
            return { hari, sessions: jadwals.length };
        });

        const weeklySessions = dayStats.reduce((sum, day) => sum + day.sessions, 0);

        return { dayStats, weeklySessions };
    };

    const dosenStats = selectedDosen ? calculateDosenStats(selectedDosen.id) : null;
    const kelasStats = selectedKelas ? calculateKelasStats(selectedKelas.id) : null;

    return (
        <div className="bg-[#494949] rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-[#BFFF00] mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Statistik
            </h3>

            <div className="space-y-6">
                {/* Dosen Statistics */}
                {selectedDosen && dosenStats && (
                    <div className="bg-[#222222] rounded-lg p-4">
                        <h4 className="text-md font-medium text-[#AAAAAA] mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            📚 Statistik Mengajar - {selectedDosen.name}
                        </h4>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-[#656565] rounded-lg p-3">
                                <div className="text-2xl font-bold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                    {dosenStats.weeklyHours}
                                </div>
                                <div className="text-sm text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    Jam per Minggu
                                </div>
                            </div>

                            <div className="bg-[#656565] rounded-lg p-3">
                                <div className="text-2xl font-bold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                    {dosenStats.dayStats.length}
                                </div>
                                <div className="text-sm text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    Hari Mengajar
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h5 className="text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                Jam per Hari:
                            </h5>
                            {dosenStats.dayStats.map((day) => (
                                <div key={day.hari} className="flex justify-between items-center bg-[#525252] rounded px-3 py-2">
                                    <span className="text-sm text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {day.hari}
                                    </span>
                                    <span className="text-sm font-medium text-[#BFFF00]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {day.hours} jam
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Kelas Statistics */}
                {selectedKelas && kelasStats && (
                    <div className="bg-[#222222] rounded-lg p-4">
                        <h4 className="text-md font-medium text-[#AAAAAA] mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            👥 Statistik Kelas - {selectedKelas.namaKelas}
                        </h4>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-[#656565] rounded-lg p-3">
                                <div className="text-2xl font-bold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                    {kelasStats.weeklySessions}
                                </div>
                                <div className="text-sm text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    Sesi per Minggu
                                </div>
                            </div>

                            <div className="bg-[#656565] rounded-lg p-3">
                                <div className="text-2xl font-bold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                    {kelasStats.dayStats.length}
                                </div>
                                <div className="text-sm text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    Hari Kuliah
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h5 className="text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                Sesi per Hari:
                            </h5>
                            {kelasStats.dayStats.map((day) => (
                                <div key={day.hari} className="flex justify-between items-center bg-[#525252] rounded px-3 py-2">
                                    <span className="text-sm text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {day.hari}
                                    </span>
                                    <span className="text-sm font-medium text-[#BFFF00]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {day.sessions} sesi
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No selection message */}
                {!selectedDosen && !selectedKelas && (
                    <div className="text-center py-8 text-[#656565]" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <div className="text-4xl mb-2">📊</div>
                        <div>Pilih dosen atau kelas untuk melihat statistik</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatisticsPanel;