import { Test, TestingModule } from '@nestjs/testing';
import { KelasService } from './kelas.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('KelasService', () => {
    let service: KelasService;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrisma = {
            kelas: {
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
                KelasService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile();

        service = module.get<KelasService>(KelasService);
        prisma = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new kelas', async () => {
            const createKelasDto = {
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: 1,
            };
            const expectedResult = {
                id: 1,
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: 1,
                prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            };

            (prisma.kelas.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.kelas.create as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.create(createKelasDto);
            expect(result).toEqual(expectedResult);
            expect(prisma.kelas.create).toHaveBeenCalledWith({
                data: createKelasDto,
                include: {
                    prodi: true,
                    Jadwal: true,
                },
            });
        });

        it('should throw ConflictException if namaKelas already exists', async () => {
            const createKelasDto = {
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: 1,
            };

            (prisma.kelas.findFirst as jest.Mock).mockResolvedValue({
                id: 1,
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: 1,
            });

            await expect(service.create(createKelasDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return all kelas', async () => {
            const expectedResult = [
                {
                    id: 1,
                    namaKelas: 'TI-3A',
                    angkatan: 2023,
                    prodiId: 1,
                    prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                    Jadwal: [],
                },
            ];

            (prisma.kelas.findMany as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.findAll();
            expect(result).toEqual(expectedResult);
            expect(prisma.kelas.findMany).toHaveBeenCalledWith({
                include: {
                    prodi: true,
                    Jadwal: true,
                },
            });
        });
    });

    describe('findOne', () => {
        it('should return a kelas by id', async () => {
            const expectedResult = {
                id: 1,
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: 1,
                prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            };

            (prisma.kelas.findUnique as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.findOne(1);
            expect(result).toEqual(expectedResult);
            expect(prisma.kelas.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    prodi: true,
                    Jadwal: true,
                },
            });
        });

        it('should throw NotFoundException if kelas not found', async () => {
            (prisma.kelas.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a kelas', async () => {
            const updateKelasDto = {
                namaKelas: 'TI-3B',
            };
            const expectedResult = {
                id: 1,
                namaKelas: 'TI-3B',
                angkatan: 2023,
                prodiId: 1,
                prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            };

            (prisma.kelas.findUnique as jest.Mock).mockResolvedValue({
                id: 1,
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: 1,
                prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            });
            (prisma.kelas.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.kelas.update as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.update(1, updateKelasDto);
            expect(result).toEqual(expectedResult);
            expect(prisma.kelas.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateKelasDto,
                include: {
                    prodi: true,
                    Jadwal: true,
                },
            });
        });

        it('should throw ConflictException if namaKelas already exists', async () => {
            const updateKelasDto = {
                namaKelas: 'TI-3B',
            };

            (prisma.kelas.findUnique as jest.Mock).mockResolvedValue({
                id: 1,
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: 1,
                prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            });
            (prisma.kelas.findFirst as jest.Mock).mockResolvedValue({
                id: 2,
                namaKelas: 'TI-3B',
                angkatan: 2023,
                prodiId: 1,
            });

            await expect(service.update(1, updateKelasDto)).rejects.toThrow(ConflictException);
        });

        it('should throw NotFoundException if kelas not found', async () => {
            (prisma.kelas.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.update(1, { namaKelas: 'Updated' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete a kelas', async () => {
            const expectedResult = {
                id: 1,
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: 1,
                prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            };

            (prisma.kelas.findUnique as jest.Mock).mockResolvedValue(expectedResult);
            (prisma.kelas.delete as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.remove(1);
            expect(result).toEqual(expectedResult);
            expect(prisma.kelas.delete).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    prodi: true,
                    Jadwal: true,
                },
            });
        });

        it('should throw NotFoundException if kelas not found', async () => {
            (prisma.kelas.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.remove(1)).rejects.toThrow(NotFoundException);
        });
    });
});