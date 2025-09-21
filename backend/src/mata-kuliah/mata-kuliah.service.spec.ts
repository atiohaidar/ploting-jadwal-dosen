import { Test, TestingModule } from '@nestjs/testing';
import { MataKuliahService } from './mata-kuliah.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('MataKuliahService', () => {
    let service: MataKuliahService;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrisma = {
            mataKuliah: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MataKuliahService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile();

        service = module.get<MataKuliahService>(MataKuliahService);
        prisma = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new mata kuliah', async () => {
            const createMataKuliahDto = {
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: 1,
            };
            const expectedResult = {
                id: 1,
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: 1,
                prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            };

            (prisma.mataKuliah.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.mataKuliah.create as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.create(createMataKuliahDto);
            expect(result).toEqual(expectedResult);
            expect(prisma.mataKuliah.create).toHaveBeenCalledWith({
                data: createMataKuliahDto,
                include: {
                    prodi: true,
                    Jadwal: true,
                },
            });
        });

        it('should throw ConflictException if kodeMk already exists', async () => {
            const createMataKuliahDto = {
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: 1,
            };

            (prisma.mataKuliah.findUnique as jest.Mock).mockResolvedValue({
                id: 1,
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: 1,
            });

            await expect(service.create(createMataKuliahDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return all mata kuliah', async () => {
            const expectedResult = [
                {
                    id: 1,
                    kodeMk: 'TI101',
                    namaMk: 'Pemrograman Dasar',
                    sks: 3,
                    prodiId: 1,
                    prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                    Jadwal: [],
                },
            ];

            (prisma.mataKuliah.findMany as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.findAll();
            expect(result).toEqual(expectedResult);
            expect(prisma.mataKuliah.findMany).toHaveBeenCalledWith({
                include: {
                    prodi: true,
                    Jadwal: true,
                },
            });
        });
    });

    describe('findOne', () => {
        it('should return a mata kuliah by id', async () => {
            const expectedResult = {
                id: 1,
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: 1,
                prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            };

            (prisma.mataKuliah.findUnique as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.findOne(1);
            expect(result).toEqual(expectedResult);
            expect(prisma.mataKuliah.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    prodi: true,
                    Jadwal: true,
                },
            });
        });

        it('should throw NotFoundException if mata kuliah not found', async () => {
            (prisma.mataKuliah.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a mata kuliah', async () => {
            const updateMataKuliahDto = {
                namaMk: 'Pemrograman Dasar Updated',
            };
            const expectedResult = {
                id: 1,
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar Updated',
                sks: 3,
                prodiId: 1,
                prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            };

            (prisma.mataKuliah.findUnique as jest.Mock).mockResolvedValue({
                id: 1,
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: 1,
                prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            });
            (prisma.mataKuliah.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.mataKuliah.update as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.update(1, updateMataKuliahDto);
            expect(result).toEqual(expectedResult);
            expect(prisma.mataKuliah.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateMataKuliahDto,
                include: {
                    prodi: true,
                    Jadwal: true,
                },
            });
        });


        it('should throw ConflictException if kodeMk already exists', async () => {
            const updateMataKuliahDto = {
                kodeMk: 'TI102',
            };

            // First call: findOne(id) - returns the mata kuliah being updated
            (prisma.mataKuliah.findUnique as jest.Mock).mockResolvedValueOnce({
                id: 1,
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: 1,
                prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            });
            // Second call: check kodeMk conflict - returns existing mata kuliah with same kodeMk
            (prisma.mataKuliah.findUnique as jest.Mock).mockResolvedValueOnce({
                id: 2,
                kodeMk: 'TI102',
                namaMk: 'Pemrograman Lanjutan',
                sks: 3,
                prodiId: 1,
            });

            await expect(service.update(1, updateMataKuliahDto)).rejects.toThrow(ConflictException);
        });

        it('should throw NotFoundException if mata kuliah not found', async () => {
            (prisma.mataKuliah.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.update(1, { namaMk: 'Updated' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete a mata kuliah', async () => {
            const expectedResult = {
                id: 1,
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: 1,
                prodi: { id: 1, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            };

            (prisma.mataKuliah.findUnique as jest.Mock).mockResolvedValue(expectedResult);
            (prisma.mataKuliah.delete as jest.Mock).mockResolvedValue(expectedResult);

            const result = await service.remove(1);
            expect(result).toEqual(expectedResult);
            expect(prisma.mataKuliah.delete).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    prodi: true,
                    Jadwal: true,
                },
            });
        });

        it('should throw NotFoundException if mata kuliah not found', async () => {
            (prisma.mataKuliah.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.remove(1)).rejects.toThrow(NotFoundException);
        });
    });
});