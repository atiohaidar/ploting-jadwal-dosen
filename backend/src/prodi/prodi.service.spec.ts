import { Test, TestingModule } from '@nestjs/testing';
import { ProdiService } from './prodi.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProdiService', () => {
    let service: ProdiService;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrisma = {
            prodi: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProdiService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile();

        service = module.get<ProdiService>(ProdiService);
        prisma = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new prodi', async () => {
            const createProdiDto = {
                namaProdi: 'Teknik Informatika',
            };
            const expectedResult = {
                id: 1,
                namaProdi: 'Teknik Informatika',
                users: [],
                kelas: [],
                mataKuliah: [],
            };

            prisma.prodi.create.mockResolvedValue(expectedResult);

            const result = await service.create(createProdiDto);
            expect(result).toEqual(expectedResult);
            expect(prisma.prodi.create).toHaveBeenCalledWith({
                data: createProdiDto,
                include: expect.objectContaining({
                    users: true,
                    kelas: true,
                    mataKuliah: true,
                }),
            });
        });
    });

    describe('findAll', () => {
        it('should return all prodi', async () => {
            const expectedResult = [
                {
                    id: 1,
                    namaProdi: 'Teknik Informatika',
                    users: [],
                    kelas: [],
                    mataKuliah: [],
                },
            ];

            prisma.prodi.findMany.mockResolvedValue(expectedResult);

            const result = await service.findAll();
            expect(result).toEqual(expectedResult);
            expect(prisma.prodi.findMany).toHaveBeenCalledWith({
                include: {
                    users: true,
                    kelas: true,
                    mataKuliah: true,
                },
            });
        });
    });

    describe('findOne', () => {
        it('should return a prodi by id', async () => {
            const expectedResult = {
                id: 1,
                namaProdi: 'Teknik Informatika',
                users: [],
                kelas: [],
                mataKuliah: [],
            };

            prisma.prodi.findUnique.mockResolvedValue(expectedResult);

            const result = await service.findOne(1);
            expect(result).toEqual(expectedResult);
            expect(prisma.prodi.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    users: true,
                    kelas: true,
                    mataKuliah: true,
                },
            });
        });

        it('should throw NotFoundException if prodi not found', async () => {
            prisma.prodi.findUnique.mockResolvedValue(null);

            await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a prodi', async () => {
            const updateProdiDto = {
                namaProdi: 'Teknik Informatika Updated',
            };
            const expectedResult = {
                id: 1,
                namaProdi: 'Teknik Informatika Updated',
                users: [],
                kelas: [],
                mataKuliah: [],
            };

            prisma.prodi.findUnique.mockResolvedValue({
                id: 1,
                namaProdi: 'Teknik Informatika',
                users: [],
                kelas: [],
                mataKuliah: [],
            });
            prisma.prodi.update.mockResolvedValue(expectedResult);

            const result = await service.update(1, updateProdiDto);
            expect(result).toEqual(expectedResult);
            expect(prisma.prodi.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateProdiDto,
                include: {
                    users: true,
                    kelas: true,
                    mataKuliah: true,
                },
            });
        });

        it('should throw NotFoundException if prodi not found', async () => {
            prisma.prodi.findUnique.mockResolvedValue(null);

            await expect(service.update(1, { namaProdi: 'Updated' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete a prodi', async () => {
            const expectedResult = {
                id: 1,
                namaProdi: 'Teknik Informatika',
                users: [],
                kelas: [],
                mataKuliah: [],
            };

            prisma.prodi.findUnique.mockResolvedValue(expectedResult);
            prisma.prodi.delete.mockResolvedValue(expectedResult);

            const result = await service.remove(1);
            expect(result).toEqual(expectedResult);
            expect(prisma.prodi.delete).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    users: true,
                    kelas: true,
                    mataKuliah: true,
                },
            });
        });

        it('should throw NotFoundException if prodi not found', async () => {
            prisma.prodi.findUnique.mockResolvedValue(null);

            await expect(service.remove(1)).rejects.toThrow(NotFoundException);
        });
    });
});