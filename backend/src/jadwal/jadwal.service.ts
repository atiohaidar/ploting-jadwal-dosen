import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { UpdateJadwalDto } from './dto/update-jadwal.dto';

interface ConflictDetail {
    type: 'DOSEN' | 'RUANGAN' | 'KELAS';
    existingJadwal: {
        id: number;
        hari: string;
        jamMulai: string;
        jamSelesai: string;
        mataKuliah: { namaMk: string };
        dosen: { name: string };
        kelas: { namaKelas: string };
        ruangan: { nama: string };
    };
}

@Injectable()
export class JadwalService {
    constructor(private prisma: PrismaService) { }

    private parseTimeString(timeStr: string): Date {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setUTCHours(hours, minutes, 0, 0);
        return date;
    }

    private formatTimeString(time: Date | string): string {
        if (typeof time === 'string') {
            return time;
        }
        return `${time.getUTCHours().toString().padStart(2, '0')}:${time.getUTCMinutes().toString().padStart(2, '0')}`;
    }

    async create(createJadwalDto: CreateJadwalDto) {
        // Check for conflicts before creating
        await this.checkConflicts(createJadwalDto);

        return this.prisma.jadwal.create({
            data: {
                hari: createJadwalDto.hari,
                jamMulai: createJadwalDto.jamMulai,
                jamSelesai: createJadwalDto.jamSelesai,
                mataKuliahId: createJadwalDto.mataKuliahId,
                dosenId: createJadwalDto.dosenId,
                kelasId: createJadwalDto.kelasId,
                ruanganId: createJadwalDto.ruanganId,
                status: createJadwalDto.status || 'aktif',
            },
            include: {
                mataKuliah: true,
                dosen: true,
                kelas: true,
                ruangan: true,
            },
        });
    }

    async findAll() {
        return this.prisma.jadwal.findMany({
            include: {
                mataKuliah: true,
                dosen: true,
                kelas: true,
                ruangan: true,
            },
        });
    }

    async findOne(id: number) {
        const jadwal = await this.prisma.jadwal.findUnique({
            where: { id },
            include: {
                mataKuliah: true,
                dosen: true,
                kelas: true,
                ruangan: true,
            },
        });

        if (!jadwal) {
            throw new NotFoundException(`Jadwal with ID ${id} not found`);
        }

        return jadwal;
    }

    async update(id: number, updateJadwalDto: UpdateJadwalDto) {
        // Check if jadwal exists
        await this.findOne(id);

        // Check for conflicts before updating
        await this.checkConflicts(updateJadwalDto, id);

        return this.prisma.jadwal.update({
            where: { id },
            data: {
                ...(updateJadwalDto.hari && { hari: updateJadwalDto.hari }),
                ...(updateJadwalDto.jamMulai && { jamMulai: updateJadwalDto.jamMulai }),
                ...(updateJadwalDto.jamSelesai && { jamSelesai: updateJadwalDto.jamSelesai }),
                ...(updateJadwalDto.mataKuliahId && { mataKuliahId: updateJadwalDto.mataKuliahId }),
                ...(updateJadwalDto.dosenId && { dosenId: updateJadwalDto.dosenId }),
                ...(updateJadwalDto.kelasId && { kelasId: updateJadwalDto.kelasId }),
                ...(updateJadwalDto.ruanganId && { ruanganId: updateJadwalDto.ruanganId }),
                ...(updateJadwalDto.status && { status: updateJadwalDto.status }),
            },
            include: {
                mataKuliah: true,
                dosen: true,
                kelas: true,
                ruangan: true,
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);

        return this.prisma.jadwal.delete({
            where: { id },
            include: {
                mataKuliah: true,
                dosen: true,
                kelas: true,
                ruangan: true,
            },
        });
    }

    private timeToMinutes(timeStr: string): number {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private async checkConflicts(jadwalData: CreateJadwalDto | UpdateJadwalDto, excludeId?: number) {
        const hari = jadwalData.hari!;
        const jamMulai = jadwalData.jamMulai!;
        const jamSelesai = jadwalData.jamSelesai!;

        const conflicts: ConflictDetail[] = [];

        // Check for dosen conflict
        const dosenConflicts = await this.prisma.jadwal.findMany({
            where: {
                dosenId: jadwalData.dosenId,
                hari: hari,
                OR: [
                    {
                        AND: [
                            { jamMulai: { lte: jamMulai } },
                            { jamSelesai: { gt: jamMulai } }
                        ]
                    },
                    {
                        AND: [
                            { jamMulai: { lt: jamSelesai } },
                            { jamSelesai: { gte: jamSelesai } }
                        ]
                    },
                    {
                        AND: [
                            { jamMulai: { gte: jamMulai } },
                            { jamSelesai: { lte: jamSelesai } }
                        ]
                    }
                ],
                ...(excludeId && { id: { not: excludeId } })
            },
            include: {
                mataKuliah: { select: { namaMk: true } },
                dosen: { select: { name: true } },
                kelas: { select: { namaKelas: true } },
                ruangan: { select: { nama: true } },
            },
        });

        dosenConflicts.forEach(conflict => {
            conflicts.push({
                type: 'DOSEN',
                existingJadwal: {
                    id: conflict.id,
                    hari: conflict.hari,
                    jamMulai: this.formatTimeString(conflict.jamMulai),
                    jamSelesai: this.formatTimeString(conflict.jamSelesai),
                    mataKuliah: conflict.mataKuliah,
                    dosen: conflict.dosen,
                    kelas: conflict.kelas,
                    ruangan: conflict.ruangan,
                },
            });
        });

        if (conflicts.length > 0) {
            throw new ConflictException({
                message: 'Jadwal conflict detected',
                conflicts: conflicts,
            });
        }
    }
}