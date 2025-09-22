import React, { useState, useEffect } from 'react';
import { Jadwal, jadwalAPI } from '../../services/api.service';

interface CalendarViewProps {
    jadwalList: Jadwal[];
    onJadwalClick?: (jadwal: Jadwal) => void;
    onCreateJadwal?: (date: Date, timeSlot?: string) => void;
    onDragCreateJadwal?: (dragData: { hari: string; jamMulai: string; jamSelesai: string }) => void;
    onUpdateJadwal?: (jadwalId: number, updateData: { hari: string; jamMulai: string; jamSelesai: string }) => void;
}const CalendarView: React.FC<CalendarViewProps> = ({
    jadwalList,
    onJadwalClick,
    onCreateJadwal,
    onDragCreateJadwal,
    onUpdateJadwal
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ dayIndex: number; hourIndex: number } | null>(null);
    const [dragEnd, setDragEnd] = useState<{ dayIndex: number; hourIndex: number } | null>(null);
    const [dragPreview, setDragPreview] = useState<{ dayIndex: number; startHour: number; endHour: number } | null>(null);
    const [draggingJadwal, setDraggingJadwal] = useState<Jadwal | null>(null);

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
    const formatTime = (time: string | Date): string => {
        if (typeof time === 'string') {
            return time;
        }
        // Use UTC time since data is stored in UTC
        const hours = time.getUTCHours().toString().padStart(2, '0');
        const minutes = time.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Convert decimal hour to HH:MM string
    const decimalHourToHHMM = (decimalHour: number): string => {
        const hours = Math.floor(decimalHour);
        const minutes = Math.round((decimalHour - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };    // Calculate position and column for jadwal events (handling overlaps within same day column)
    const getJadwalLayout = (dayJadwal: Jadwal[]) => {
        if (dayJadwal.length === 0) return { layout: [], maxColumn: 0 };

        // Sort jadwal by start time
        const sortedJadwal = [...dayJadwal].sort((a, b) => {
            const aTime = a.jamMulai;
            const bTime = b.jamMulai;
            return aTime.localeCompare(bTime);
        });

        const layout: Array<{
            jadwal: Jadwal;
            top: number;
            height: number;
            left: number;
            width: number;
            column: number;
        }> = [];

        // Process each jadwal
        sortedJadwal.forEach((jadwal) => {
            const jamMulaiParts = jadwal.jamMulai.split(':').map(Number);
            const jamSelesaiParts = jadwal.jamSelesai.split(':').map(Number);

            const startHour = jamMulaiParts[0] + jamMulaiParts[1] / 60;
            const endHour = jamSelesaiParts[0] + jamSelesaiParts[1] / 60;

            const top = (startHour - 7) * 60;
            const height = (endHour - startHour) * 60;

            // Find the first available column
            let column = 0;
            let columnFound = false;

            while (!columnFound) {
                columnFound = true;

                // Check if this column has any overlapping events
                for (const existing of layout) {
                    if (existing.column === column) {
                        const existingStart = existing.top;
                        const existingEnd = existing.top + existing.height;
                        const jadwalStart = top;
                        const jadwalEnd = top + height;

                        // Check for time overlap
                        if (jadwalStart < existingEnd && jadwalEnd > existingStart) {
                            columnFound = false;
                            break;
                        }
                    }
                }

                if (!columnFound) {
                    column++;
                }
            }

            layout.push({
                jadwal,
                top,
                height,
                left: 0, // Will be calculated after
                width: 0, // Will be calculated after
                column
            });
        });

        // Calculate max column
        const maxColumn = layout.length > 0 ? Math.max(...layout.map(l => l.column)) + 1 : 0;

        // Assign left and width
        layout.forEach(item => {
            item.width = 100 / maxColumn;
            item.left = item.column * item.width;
        });

        return { layout, maxColumn };
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

    // Color palette for different dosen
    const dosenColors = [
        'bg-red-600 hover:bg-red-700 border-red-500',
        'bg-green-600 hover:bg-green-700 border-green-500',
        'bg-blue-600 hover:bg-blue-700 border-blue-500',
        'bg-yellow-600 hover:bg-yellow-700 border-yellow-500',
        'bg-purple-600 hover:bg-purple-700 border-purple-500',
        'bg-pink-600 hover:bg-pink-700 border-pink-500',
        'bg-indigo-600 hover:bg-indigo-700 border-indigo-500',
        'bg-teal-600 hover:bg-teal-700 border-teal-500',
        'bg-orange-600 hover:bg-orange-700 border-orange-500',
        'bg-cyan-600 hover:bg-cyan-700 border-cyan-500'
    ];

    // Get consistent color for dosen
    const getDosenColor = (dosenId: number): string => {
        return dosenColors[dosenId % dosenColors.length];
    };

    // Drag handlers
    const handleMouseDown = (dayIndex: number, hourIndex: number, e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ dayIndex, hourIndex });
        setDragEnd({ dayIndex, hourIndex });
    };

    const handleJadwalMouseDown = (jadwal: Jadwal, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent triggering create drag
        setDraggingJadwal(jadwal);
        setIsDragging(true);
        // Calculate initial drag position based on jadwal time
        const [hour, min] = jadwal.jamMulai.split(':').map(Number);
        const startHour = hour + min / 60;
        const dayIndex = daysOfWeek.indexOf(jadwal.hari);
        const hourIndex = Math.floor(startHour - 7);
        setDragStart({ dayIndex, hourIndex });
        setDragEnd({ dayIndex, hourIndex });
    };

    const handleMouseEnter = (dayIndex: number, hourIndex: number) => {
        if (isDragging && dragStart) {
            setDragEnd({ dayIndex, hourIndex });

            if (draggingJadwal) {
                // For existing jadwal, maintain duration
                const [startHour, startMin] = draggingJadwal.jamMulai.split(':').map(Number);
                const [endHour, endMin] = draggingJadwal.jamSelesai.split(':').map(Number);
                const startDecimal = startHour + startMin / 60;
                const endDecimal = endHour + endMin / 60;
                const duration = endDecimal - startDecimal;

                const newStartHour = 7 + hourIndex;
                const newEndHour = newStartHour + duration;

                setDragPreview({
                    dayIndex,
                    startHour: newStartHour,
                    endHour: newEndHour
                });
            } else {
                // For new jadwal creation
                const startHour = Math.min(dragStart.hourIndex, hourIndex);
                const endHour = Math.max(dragStart.hourIndex, hourIndex) + 1; // +1 to include the end hour

                if (dragStart.dayIndex === dayIndex) {
                    setDragPreview({
                        dayIndex,
                        startHour: 7 + startHour, // Convert to actual hour (7 AM base)
                        endHour: 7 + endHour
                    });
                } else {
                    setDragPreview(null);
                }
            }
        }
    };

    const handleMouseUp = () => {
        if (isDragging && dragStart && dragEnd && dragPreview) {
            if (draggingJadwal && onUpdateJadwal) {
                // Update existing jadwal
                const hari = daysOfWeek[dragPreview.dayIndex];
                const jamMulai = decimalHourToHHMM(dragPreview.startHour);
                const jamSelesai = decimalHourToHHMM(dragPreview.endHour);

                onUpdateJadwal(draggingJadwal.id, {
                    hari,
                    jamMulai,
                    jamSelesai
                });
            } else if (onDragCreateJadwal) {
                // Create new jadwal
                const hari = daysOfWeek[dragPreview.dayIndex];
                const jamMulai = decimalHourToHHMM(dragPreview.startHour);
                const jamSelesai = decimalHourToHHMM(dragPreview.endHour);

                onDragCreateJadwal({
                    hari,
                    jamMulai,
                    jamSelesai
                });
            }
        }

        // Reset drag state
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
        setDragPreview(null);
        setDraggingJadwal(null);
    };

    // Clear drag preview when mouse leaves calendar area
    const handleMouseLeave = () => {
        if (isDragging) {
            setDragPreview(null);
        }
    };

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
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'week'
                                ? 'bg-[#BFFF00] text-[#222222]'
                                : 'bg-[#656565] text-[#AAAAAA] hover:bg-[#525252]'
                                }`}
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            Minggu
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'month'
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
            <div className="p-4 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                    {/* Time column */}
                    <div className="pr-2 flex-shrink-0 w-16">
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
                        const { layout: jadwalLayout, maxColumn } = getJadwalLayout(dayJadwal);
                        const flexGrow = maxColumn === 0 ? 0.5 : maxColumn;
                        const flexBasis = '120px';

                        return (
                            <div key={index} className="border-l border-[#656565] pl-2 relative" style={{ flexBasis, flexGrow }}>
                                {/* Day header */}
                                <div className={`h-12 text-center p-2 rounded-md mb-2 ${isToday ? 'bg-[#BFFF00] text-[#222222]' : 'bg-[#656565] text-[#AAAAAA]'
                                    }`}>
                                    <div className="text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {daysOfWeek[date.getDay()]}
                                    </div>
                                    <div className="text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {date.getDate()}
                                    </div>
                                </div>

                                {/* Time slots */}
                                <div className="relative" onMouseLeave={handleMouseLeave}>
                                    {Array.from({ length: 14 }, (_, i) => {
                                        const isInDragArea = dragPreview &&
                                            dragPreview.dayIndex === index &&
                                            i >= (dragPreview.startHour - 7) &&
                                            i < (dragPreview.endHour - 7);

                                        return (
                                            <div
                                                key={i}
                                                className={`h-16 border-t border-[#656565] cursor-pointer transition-colors ${isInDragArea
                                                    ? 'bg-gray-500 bg-opacity-50'
                                                    : 'hover:bg-[#525252]'
                                                    }`}
                                                onMouseDown={(e) => handleMouseDown(index, i, e)}
                                                onMouseEnter={() => handleMouseEnter(index, i)}
                                                onMouseUp={handleMouseUp}
                                            ></div>
                                        );
                                    })}

                                    {/* Drag preview */}
                                    {dragPreview && dragPreview.dayIndex === index && (
                                        <div
                                            className="absolute bg-gray-600 bg-opacity-70 rounded-md border-2 border-dashed border-gray-400 pointer-events-none"
                                            style={{
                                                top: `${(dragPreview.startHour - 7) * 60}px`,
                                                height: `${(dragPreview.endHour - dragPreview.startHour) * 60}px`,
                                                left: '4px',
                                                right: '4px',
                                                zIndex: 20
                                            }}
                                        >
                                            <div className="p-2 text-xs text-white text-center">
                                                {decimalHourToHHMM(dragPreview.startHour)} - {decimalHourToHHMM(dragPreview.endHour)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Jadwal events */}
                                    {jadwalLayout.map((layout) => {
                                        const dosenColor = getDosenColor(layout.jadwal.dosenId);
                                        return (
                                            <div
                                                key={layout.jadwal.id}
                                                className={`absolute rounded-md p-2 cursor-pointer transition-colors border ${dosenColor}`}
                                                style={{
                                                    top: `${layout.top}px`,
                                                    height: `${Math.max(layout.height, 40)}px`,
                                                    left: `${layout.left}%`,
                                                    width: `${layout.width}%`,
                                                    zIndex: 10
                                                }}
                                                onMouseDown={(e) => handleJadwalMouseDown(layout.jadwal, e)}
                                                onClick={() => onJadwalClick?.(layout.jadwal)}
                                            >
                                                <div className="text-xs font-medium text-white truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {layout.jadwal.mataKuliah.namaMk}
                                                </div>
                                                <div className="text-xs text-white text-opacity-80 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {layout.jadwal.dosen.name}
                                                </div>
                                                <div className="text-xs text-white text-opacity-80 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {layout.jadwal.ruangan.nama}
                                                </div>
                                                <div className="text-xs text-white text-opacity-80" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {formatTime(layout.jadwal.jamMulai)} - {formatTime(layout.jadwal.jamSelesai)}
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