import React, { useState, useEffect } from 'react';
import { Jadwal, jadwalAPI } from '../../services/api.service';

interface CalendarViewProps {
  jadwalList: Jadwal[];
  onJadwalClick?: (jadwal: Jadwal) => void;
  onCreateJadwal?: (date: Date, timeSlot?: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  jadwalList,
  onJadwalClick,
  onCreateJadwal
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Days of the week
  const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Indonesian day names mapping
  const dayNameMap: { [key: string]: number } = {
    'Minggu': 0,
    'Senin': 1,
    'Selasa': 2,
    'Rabu': 3,
    'Kamis': 4,
    'Jumat': 5,
    'Sabtu': 6
  };

  // Get jadwal for specific day
  const getJadwalForDay = (date: Date): Jadwal[] => {
    const dayName = daysOfWeek[date.getDay()];
    return jadwalList.filter(jadwal => jadwal.hari === dayName);
  };

  // Get week dates
  const getWeekDates = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(weekDate);
    }
    return weekDates;
  };

  // Format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Calculate position for jadwal in timeline
  const getJadwalPosition = (jadwal: Jadwal) => {
    const startTime = new Date(jadwal.jamMulai);
    const endTime = new Date(jadwal.jamSelesai);

    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    const endHour = endTime.getHours() + endTime.getMinutes() / 60;

    const top = (startHour - 7) * 60; // Start from 7 AM
    const height = (endHour - startHour) * 60;

    return { top, height };
  };

  // Navigate to previous/next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDates = getWeekDates(currentDate);

  return (
    <div className="bg-[#494949] rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[#222222] p-4 border-b border-[#656565]">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-[#656565] rounded-md transition-colors"
            >
              <svg className="w-5 h-5 text-[#AAAAAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {currentDate.toLocaleDateString('id-ID', {
                month: 'long',
                year: 'numeric'
              })}
            </h2>

            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-[#656565] rounded-md transition-colors"
            >
              <svg className="w-5 h-5 text-[#AAAAAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={goToToday}
              className="px-4 py-2 bg-[#BFFF00] text-[#222222] rounded-md hover:bg-opacity-90 transition-colors text-sm font-medium"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Hari Ini
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-[#BFFF00] text-[#222222]'
                  : 'bg-[#656565] text-[#AAAAAA] hover:bg-[#525252]'
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Minggu
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-[#BFFF00] text-[#222222]'
                  : 'bg-[#656565] text-[#AAAAAA] hover:bg-[#525252]'
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Bulan
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-8 gap-2">
          {/* Time column */}
          <div className="pr-2">
            <div className="h-12"></div> {/* Header space */}
            {Array.from({ length: 14 }, (_, i) => {
              const hour = 7 + i; // Start from 7 AM
              return (
                <div key={hour} className="h-16 text-xs text-[#656565] border-t border-[#656565] pt-1">
                  {hour}:00
                </div>
              );
            })}
          </div>

          {/* Day columns */}
          {weekDates.map((date, index) => {
            const dayJadwal = getJadwalForDay(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div key={index} className="border-l border-[#656565] pl-2">
                {/* Day header */}
                <div className={`h-12 text-center p-2 rounded-md mb-2 ${
                  isToday ? 'bg-[#BFFF00] text-[#222222]' : 'bg-[#656565] text-[#AAAAAA]'
                }`}>
                  <div className="text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {daysOfWeek[date.getDay()]}
                  </div>
                  <div className="text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {date.getDate()}
                  </div>
                </div>

                {/* Time slots */}
                <div className="relative">
                  {Array.from({ length: 14 }, (_, i) => (
                    <div
                      key={i}
                      className="h-16 border-t border-[#656565] cursor-pointer hover:bg-[#525252] transition-colors"
                      onClick={() => onCreateJadwal?.(date, `${7 + i}:00`)}
                    ></div>
                  ))}

                  {/* Jadwal events */}
                  {dayJadwal.map((jadwal) => {
                    const { top, height } = getJadwalPosition(jadwal);
                    return (
                      <div
                        key={jadwal.id}
                        className="absolute left-1 right-1 bg-blue-600 hover:bg-blue-700 rounded-md p-2 cursor-pointer transition-colors border border-blue-500"
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(height, 40)}px`,
                          zIndex: 10
                        }}
                        onClick={() => onJadwalClick?.(jadwal)}
                      >
                        <div className="text-xs font-medium text-white truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {jadwal.mataKuliah.namaMk}
                        </div>
                        <div className="text-xs text-blue-100 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {jadwal.dosen.name}
                        </div>
                        <div className="text-xs text-blue-100 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {jadwal.ruangan.nama}
                        </div>
                        <div className="text-xs text-blue-100" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {formatTime(new Date(jadwal.jamMulai))} - {formatTime(new Date(jadwal.jamSelesai))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;