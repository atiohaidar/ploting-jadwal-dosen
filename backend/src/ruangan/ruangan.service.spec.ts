import { Test, TestingModule } from '@nestjs/testing';
import { RuanganService } from './ruangan.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('RuanganService', () => {
    let service: RuanganService;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrisma = {
            ruangan: {
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
                RuanganService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile();

        service = module.get<RuanganService>(RuanganService);
        prisma = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new ruangan', async () => {
            const createRuanganDto = {
                nama: 'Lab Komputer 1',
                kapasitas: 30,
                lokasi: 'Gedung A Lantai 2',
            };
            const expectedResult = {
                id: 1,
                nama: 'Lab Komputer 1',
                kapasitas: 30,
                lokasi: 'Gedung A Lantai 2',
                Jadwal: [],
            };

            prisma.ruangan.findFirst.mockResolvedValue(null);
            prisma.ruangan.create.mockResolvedValue(expectedResult);

            const result = await service.create(createRuanganDto);
            expect(result).toEqual(expectedResult);
            expect(prisma.ruangan.create).toHaveBeenCalledWith({
                data: createRuanganDto,
                include: {
                    Jadwal: true,
                },
            });
        });

        it('should create a new ruangan without lokasi', async () => {
            const createRuanganDto = {
                nama: 'Lab Komputer 1',
                kapasitas: 30,
            };
            const expectedResult = {
                id: 1,
                nama: 'Lab Komputer 1',
                kapasitas: 30,
                lokasi: null,
                Jadwal: [],
            };

            prisma.ruangan.findFirst.mockResolvedValue(null);
            prisma.ruangan.create.mockResolvedValue(expectedResult);

            const result = await service.create(createRuanganDto);
            expect(result).toEqual(expectedResult);
        });

        it('should throw ConflictException if nama already exists', async () => {
            const createRuanganDto = {
                nama: 'Lab Komputer 1',
                kapasitas: 30,
            };

            prisma.ruangan.findFirst.mockResolvedValue({
                id: 1,
                nama: 'Lab Komputer 1',
                kapasitas: 30,
                lokasi: null,
            });

            await expect(service.create(createRuanganDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return all ruangan', async () => {
            const expectedResult = [
                {
                    id: 1,
                    nama: 'Lab Komputer 1',
                    kapasitas: 30,
                    lokasi: 'Gedung A Lantai 2',
                    Jadwal: [],
                },
            ];

            prisma.ruangan.findMany.mockResolvedValue(expectedResult);

            const result = await service.findAll();
            expect(result).toEqual(expectedResult);
            expect(prisma.ruangan.findMany).toHaveBeenCalledWith({
                include: {
                    Jadwal: true,
                },
            });
        });
    });

    describe('findOne', () => {
        it('should return a ruangan by id', async () => {
            const expectedResult = {
                id: 1,
                nama: 'Lab Komputer 1',
                kapasitas: 30,
                lokasi: 'Gedung A Lantai 2',
                Jadwal: [],
            };

            prisma.ruangan.findUnique.mockResolvedValue(expectedResult);

            const result = await service.findOne(1);
            expect(result).toEqual(expectedResult);
            expect(prisma.ruangan.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    Jadwal: true,
                },
            });
        });

        it('should throw NotFoundException if ruangan not found', async () => {
            prisma.ruangan.findUnique.mockResolvedValue(null);

            await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a ruangan', async () => {
            const updateRuanganDto = {
                nama: 'Lab Komputer 2',
            };
            const expectedResult = {
                id: 1,
                nama: 'Lab Komputer 2',
                kapasitas: 30,
                lokasi: 'Gedung A Lantai 2',
                Jadwal: [],
            };

            prisma.ruangan.findUnique.mockResolvedValue({
                id: 1,
                nama: 'Lab Komputer 1',
                kapasitas: 30,
                lokasi: 'Gedung A Lantai 2',
                Jadwal: [],
            });
            prisma.ruangan.findFirst.mockResolvedValue(null);
            prisma.ruangan.update.mockResolvedValue(expectedResult);

            const result = await service.update(1, updateRuanganDto);
            expect(result).toEqual(expectedResult);
            expect(prisma.ruangan.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateRuanganDto,
                include: {
                    Jadwal: true,
                },
            });
        });

        it('should throw ConflictException if nama already exists', async () => {
            const updateRuanganDto = {
                nama: 'Lab Komputer 2',
            };

            prisma.ruangan.findUnique.mockResolvedValue({
                id: 1,
                nama: 'Lab Komputer 1',
                kapasitas: 30,
                lokasi: 'Gedung A Lantai 2',
                Jadwal: [],
            });
            prisma.ruangan.findFirst.mockResolvedValue({
                id: 2,
                nama: 'Lab Komputer 2',
                kapasitas: 25,
                lokasi: null,
            });

            await expect(service.update(1, updateRuanganDto)).rejects.toThrow(ConflictException);
        });

        it('should throw NotFoundException if ruangan not found', async () => {
            prisma.ruangan.findUnique.mockResolvedValue(null);

            await expect(service.update(1, { nama: 'Updated' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete a ruangan', async () => {
            const expectedResult = {
                id: 1,
                nama: 'Lab Komputer 1',
                kapasitas: 30,
                lokasi: 'Gedung A Lantai 2',
                Jadwal: [],
            };

            prisma.ruangan.findUnique.mockResolvedValue(expectedResult);
            prisma.ruangan.delete.mockResolvedValue(expectedResult);

            const result = await service.remove(1);
            expect(result).toEqual(expectedResult);
            expect(prisma.ruangan.delete).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    Jadwal: true,
                },
            });
        });

        it('should throw NotFoundException if ruangan not found', async () => {
            prisma.ruangan.findUnique.mockResolvedValue(null);

            await expect(service.remove(1)).rejects.toThrow(NotFoundException);
        });
    });
});