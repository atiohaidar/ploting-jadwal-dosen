import { Test, TestingModule } from '@nestjs/testing';
import { JadwalService } from './jadwal.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('JadwalService', () => {
    let service: JadwalService;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrisma = {
            jadwal: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JadwalService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile();

        service = module.get<JadwalService>(JadwalService);
        prisma = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new jadwal', async () => {
            const createJadwalDto = {
                hari: 'Senin',
                jamMulai: '2025-09-21T08:00:00.000Z',
                jamSelesai: '2025-09-21T10:00:00.000Z',
                mataKuliahId: 1,
                dosenId: 1,
                kelasId: 1,
                ruanganId: 1,
            };
            const expectedResult = {
                id: 1,
                hari: 'Senin',
                jamMulai: new Date('2025-09-21T08:00:00.000Z'),
                jamSelesai: new Date('2025-09-21T10:00:00.000Z'),
                mataKuliahId: 1,
                dosenId: 1,
                kelasId: 1,
                ruanganId: 1,
                status: 'aktif',
                mataKuliah: { namaMk: 'Matematika' },
                dosen: { name: 'Dr. John Doe' },
                kelas: { namaKelas: 'TI-2021' },
                ruangan: { nama: 'Lab Komputer 1' },
            };

            (prisma.jadwal.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.jadwal.create as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.create(createJadwalDto);
            expect(result).toEqual(expectedResult);
            expect(prisma.jadwal.create).toHaveBeenCalledWith({
                data: {
                    hari: 'Senin',
                    jamMulai: new Date('2025-09-21T08:00:00.000Z'),
                    jamSelesai: new Date('2025-09-21T10:00:00.000Z'),
                    mataKuliahId: 1,
                    dosenId: 1,
                    kelasId: 1,
                    ruanganId: 1,
                    status: 'aktif',
                },
                include: {
                    mataKuliah: true,
                    dosen: true,
                    kelas: true,
                    ruangan: true,
                },
            });
        });

        it('should throw ConflictException if dosen has conflicting schedule', async () => {
            const createJadwalDto = {
                hari: 'Senin',
                jamMulai: '2025-09-21T08:00:00.000Z',
                jamSelesai: '2025-09-21T10:00:00.000Z',
                mataKuliahId: 1,
                dosenId: 1,
                kelasId: 1,
                ruanganId: 1,
            };

            const conflictingJadwal = {
                id: 2,
                hari: 'Senin',
                jamMulai: new Date('2025-09-21T09:00:00.000Z'),
                jamSelesai: new Date('2025-09-21T11:00:00.000Z'),
                mataKuliah: { namaMk: 'Fisika' },
                dosen: { name: 'Dr. John Doe' },
                kelas: { namaKelas: 'TI-2021' },
                ruangan: { nama: 'Lab Fisika' },
            };

            (prisma.jadwal.findMany as jest.Mock)
                .mockResolvedValueOnce([conflictingJadwal]) // dosen check - has conflicts
                .mockResolvedValueOnce([]) // ruangan check - no conflicts
                .mockResolvedValueOnce([]); // kelas check - no conflicts

            await expect(service.create(createJadwalDto)).rejects.toThrow(ConflictException);
        });

        it('should throw ConflictException if ruangan has conflicting schedule', async () => {
            const createJadwalDto = {
                hari: 'Senin',
                jamMulai: '2025-09-21T08:00:00.000Z',
                jamSelesai: '2025-09-21T10:00:00.000Z',
                mataKuliahId: 1,
                dosenId: 1,
                kelasId: 1,
                ruanganId: 1,
            };

            const conflictingJadwal = {
                id: 2,
                hari: 'Senin',
                jamMulai: new Date('2025-09-21T09:00:00.000Z'),
                jamSelesai: new Date('2025-09-21T11:00:00.000Z'),
                mataKuliah: { namaMk: 'Fisika' },
                dosen: { name: 'Dr. Jane Smith' },
                kelas: { namaKelas: 'SI-2021' },
                ruangan: { nama: 'Lab Komputer 1' },
            };

            (prisma.jadwal.findMany as jest.Mock)
                .mockResolvedValueOnce([]) // dosen check - no conflicts
                .mockResolvedValueOnce([conflictingJadwal]) // ruangan check - has conflicts
                .mockResolvedValueOnce([]); // kelas check - no conflicts

            await expect(service.create(createJadwalDto)).rejects.toThrow(ConflictException);
        });

        it('should throw ConflictException if kelas has conflicting schedule', async () => {
            const createJadwalDto = {
                hari: 'Senin',
                jamMulai: '2025-09-21T08:00:00.000Z',
                jamSelesai: '2025-09-21T10:00:00.000Z',
                mataKuliahId: 1,
                dosenId: 1,
                kelasId: 1,
                ruanganId: 1,
            };

            const conflictingJadwal = {
                id: 2,
                hari: 'Senin',
                jamMulai: new Date('2025-09-21T09:00:00.000Z'),
                jamSelesai: new Date('2025-09-21T11:00:00.000Z'),
                mataKuliah: { namaMk: 'Fisika' },
                dosen: { name: 'Dr. Jane Smith' },
                kelas: { namaKelas: 'TI-2021' },
                ruangan: { nama: 'Lab Fisika' },
            };

            (prisma.jadwal.findMany as jest.Mock)
                .mockResolvedValueOnce([]) // dosen check - no conflicts
                .mockResolvedValueOnce([]) // ruangan check - no conflicts
                .mockResolvedValueOnce([conflictingJadwal]); // kelas check - has conflicts

            await expect(service.create(createJadwalDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return all jadwal', async () => {
            const expectedResult = [
                {
                    id: 1,
                    hari: 'Senin',
                    jamMulai: new Date('2025-09-21T08:00:00.000Z'),
                    jamSelesai: new Date('2025-09-21T10:00:00.000Z'),
                    mataKuliah: { namaMk: 'Matematika' },
                    dosen: { name: 'Dr. John Doe' },
                    kelas: { namaKelas: 'TI-2021' },
                    ruangan: { nama: 'Lab Komputer 1' },
                },
            ];

            (prisma.jadwal.findMany as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.findAll();
            expect(result).toEqual(expectedResult);
            expect(prisma.jadwal.findMany).toHaveBeenCalledWith({
                include: {
                    mataKuliah: true,
                    dosen: true,
                    kelas: true,
                    ruangan: true,
                },
            });
        });
    });

    describe('findOne', () => {
        it('should return a jadwal by id', async () => {
            const expectedResult = {
                id: 1,
                hari: 'Senin',
                jamMulai: new Date('2025-09-21T08:00:00.000Z'),
                jamSelesai: new Date('2025-09-21T10:00:00.000Z'),
                mataKuliah: { namaMk: 'Matematika' },
                dosen: { name: 'Dr. John Doe' },
                kelas: { namaKelas: 'TI-2021' },
                ruangan: { nama: 'Lab Komputer 1' },
            };

            (prisma.jadwal.findUnique as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.findOne(1);
            expect(result).toEqual(expectedResult);
            expect(prisma.jadwal.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    mataKuliah: true,
                    dosen: true,
                    kelas: true,
                    ruangan: true,
                },
            });
        });

        it('should throw NotFoundException if jadwal not found', async () => {
            (prisma.jadwal.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a jadwal', async () => {
            const updateJadwalDto = {
                hari: 'Selasa',
            };
            const existingJadwal = {
                id: 1,
                hari: 'Senin',
                jamMulai: new Date('2025-09-21T08:00:00.000Z'),
                jamSelesai: new Date('2025-09-21T10:00:00.000Z'),
                mataKuliah: { namaMk: 'Matematika' },
                dosen: { name: 'Dr. John Doe' },
                kelas: { namaKelas: 'TI-2021' },
                ruangan: { nama: 'Lab Komputer 1' },
            };
            const expectedResult = {
                ...existingJadwal,
                hari: 'Selasa',
            };

            (prisma.jadwal.findUnique as jest.Mock).mockResolvedValue(existingJadwal);
            (prisma.jadwal.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.jadwal.update as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.update(1, updateJadwalDto);
            expect(result).toEqual(expectedResult);
            expect(prisma.jadwal.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    hari: 'Selasa',
                },
                include: {
                    mataKuliah: true,
                    dosen: true,
                    kelas: true,
                    ruangan: true,
                },
            });
        });

        it('should throw NotFoundException if jadwal not found', async () => {
            (prisma.jadwal.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.update(1, { hari: 'Selasa' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete a jadwal', async () => {
            const existingJadwal = {
                id: 1,
                hari: 'Senin',
                jamMulai: new Date('2025-09-21T08:00:00.000Z'),
                jamSelesai: new Date('2025-09-21T10:00:00.000Z'),
                mataKuliah: { namaMk: 'Matematika' },
                dosen: { name: 'Dr. John Doe' },
                kelas: { namaKelas: 'TI-2021' },
                ruangan: { nama: 'Lab Komputer 1' },
            };

            (prisma.jadwal.findUnique as jest.Mock).mockResolvedValue(existingJadwal);
            (prisma.jadwal.delete as jest.Mock).mockResolvedValue(existingJadwal);

            const result = await service.remove(1);
            expect(result).toEqual(existingJadwal);
            expect(prisma.jadwal.delete).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    mataKuliah: true,
                    dosen: true,
                    kelas: true,
                    ruangan: true,
                },
            });
        });

        it('should throw NotFoundException if jadwal not found', async () => {
            (prisma.jadwal.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.remove(1)).rejects.toThrow(NotFoundException);
        });
    });
});