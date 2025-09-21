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
  constructor(private prisma: PrismaService) {}

  async create(createJadwalDto: CreateJadwalDto) {
    // Check for conflicts before creating
    await this.checkConflicts(createJadwalDto);

    return this.prisma.jadwal.create({
      data: {
        hari: createJadwalDto.hari,
        jamMulai: new Date(createJadwalDto.jamMulai),
        jamSelesai: new Date(createJadwalDto.jamSelesai),
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
        ...(updateJadwalDto.jamMulai && { jamMulai: new Date(updateJadwalDto.jamMulai) }),
        ...(updateJadwalDto.jamSelesai && { jamSelesai: new Date(updateJadwalDto.jamSelesai) }),
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

  private async checkConflicts(jadwalData: CreateJadwalDto | UpdateJadwalDto, excludeId?: number) {
    const hari = jadwalData.hari!;
    const jamMulai = new Date(jadwalData.jamMulai!);
    const jamSelesai = new Date(jadwalData.jamSelesai!);

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
          jamMulai: conflict.jamMulai.toISOString(),
          jamSelesai: conflict.jamSelesai.toISOString(),
          mataKuliah: conflict.mataKuliah,
          dosen: conflict.dosen,
          kelas: conflict.kelas,
          ruangan: conflict.ruangan,
        },
      });
    });

    // Check for ruangan conflict
    const ruanganConflicts = await this.prisma.jadwal.findMany({
      where: {
        ruanganId: jadwalData.ruanganId,
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

    ruanganConflicts.forEach(conflict => {
      conflicts.push({
        type: 'RUANGAN',
        existingJadwal: {
          id: conflict.id,
          hari: conflict.hari,
          jamMulai: conflict.jamMulai.toISOString(),
          jamSelesai: conflict.jamSelesai.toISOString(),
          mataKuliah: conflict.mataKuliah,
          dosen: conflict.dosen,
          kelas: conflict.kelas,
          ruangan: conflict.ruangan,
        },
      });
    });

    // Check for kelas conflict
    const kelasConflicts = await this.prisma.jadwal.findMany({
      where: {
        kelasId: jadwalData.kelasId,
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

    kelasConflicts.forEach(conflict => {
      conflicts.push({
        type: 'KELAS',
        existingJadwal: {
          id: conflict.id,
          hari: conflict.hari,
          jamMulai: conflict.jamMulai.toISOString(),
          jamSelesai: conflict.jamSelesai.toISOString(),
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