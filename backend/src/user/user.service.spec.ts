import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
    let service: UserService;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrisma = {
            user: {
                findUnique: jest.fn(),
                findMany: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        }; const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        prisma = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const createUserDto = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password',
                role: Role.ADMIN,
            };
            const hashedPassword = 'hashed-password';
            const expectedUser = {
                id: 1,
                ...createUserDto,
                password: hashedPassword,
                nip: null,
                nim: null,
                prodiId: null,
                gender: null,
            };
            const userWithoutPassword = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                role: Role.ADMIN,
                nip: null,
                nim: null,
                prodiId: null,
                gender: null,
            };

            mockBcrypt.hash.mockResolvedValue(hashedPassword);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.create as jest.Mock).mockResolvedValue(expectedUser);

            const result = await service.create(createUserDto);

            expect(result).toEqual(userWithoutPassword);
            expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    ...createUserDto,
                    password: hashedPassword,
                },
            });
        });

        it('should throw ConflictException if user already exists', async () => {
            const createUserDto = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password',
                role: Role.ADMIN,
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 } as any);

            await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return all users without password', async () => {
            const users = [
                {
                    id: 1,
                    name: 'User 1',
                    email: 'user1@example.com',
                    role: Role.ADMIN,
                    nip: null,
                    nim: null,
                    prodiId: null,
                    prodi: null,
                    gender: null,
                },
            ];

            (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

            const result = await service.findAll();

            expect(result).toEqual(users);
            expect(prisma.user.findMany).toHaveBeenCalledWith({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    gender: true,
                    nip: true,
                    nim: true,
                    prodiId: true,
                    prodi: true,
                },
            });
        });
    });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            const user = {
                id: 1,
                name: 'User 1',
                email: 'user1@example.com',
                role: Role.ADMIN,
                nip: null,
                nim: null,
                prodiId: null,
                prodi: null,
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(user); const result = await service.findOne(1);

            expect(result).toEqual(user);
        });

        it('should throw NotFoundException if user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const updateUserDto = { role: Role.DOSEN };
            const updatedUser = {
                id: 1,
                name: 'User 1',
                email: 'user1@example.com',
                role: Role.DOSEN,
                nip: null,
                nim: null,
                prodiId: null,
                prodi: null,
                gender: null,
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(updatedUser);
            (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser); const result = await service.update(1, updateUserDto);

            expect(result).toEqual(updatedUser);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateUserDto,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    gender: true,
                    nip: true,
                    nim: true,
                    prodiId: true,
                    prodi: true,
                },
            });
        });
    });

    describe('findByEmail', () => {
        it('should return user by email', async () => {
            const user = {
                id: 1,
                name: 'User 1',
                email: 'user1@example.com',
                password: 'hashed',
                role: Role.ADMIN,
                nip: null,
                nim: null,
                prodiId: null,
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(user); const result = await service.findByEmail('user1@example.com');

            expect(result).toEqual(user);
        });
    });

    describe('bulkCreate', () => {
        it('should create multiple users', async () => {
            const createUserDtos = [
                {
                    name: 'User 1',
                    email: 'user1@example.com',
                    password: 'password1',
                    role: Role.DOSEN,
                },
                {
                    name: 'User 2',
                    email: 'user2@example.com',
                    password: 'password2',
                    role: Role.MAHASISWA,
                },
            ];

            const expectedUsers = [
                {
                    id: 1,
                    name: 'User 1',
                    email: 'user1@example.com',
                    role: Role.DOSEN,
                    nip: null,
                    nim: null,
                    prodiId: null,
                },
                {
                    id: 2,
                    name: 'User 2',
                    email: 'user2@example.com',
                    role: Role.MAHASISWA,
                    nip: null,
                    nim: null,
                    prodiId: null,
                },
            ];

            mockBcrypt.hash.mockResolvedValue('hashed-password');
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.create as jest.Mock)
                .mockResolvedValueOnce(expectedUsers[0])
                .mockResolvedValueOnce(expectedUsers[1]);

            const result = await service.bulkCreate(createUserDtos);

            expect(result).toEqual(expectedUsers);
            expect(prisma.user.create).toHaveBeenCalledTimes(2);
        });

        it('should continue with other users if one fails', async () => {
            const createUserDtos = [
                {
                    name: 'User 1',
                    email: 'user1@example.com',
                    password: 'password1',
                    role: Role.DOSEN,
                },
                {
                    name: 'User 2',
                    email: 'user1@example.com', // duplicate email
                    password: 'password2',
                    role: Role.MAHASISWA,
                },
            ];

            const expectedUser = {
                id: 1,
                name: 'User 1',
                email: 'user1@example.com',
                role: Role.DOSEN,
                nip: null,
                nim: null,
                prodiId: null,
            };

            mockBcrypt.hash.mockResolvedValue('hashed-password');
            (prisma.user.findUnique as jest.Mock)
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ id: 1 }); // duplicate for second user
            (prisma.user.create as jest.Mock).mockResolvedValue(expectedUser);

            const result = await service.bulkCreate(createUserDtos);

            expect(result).toEqual([expectedUser]);
            expect(prisma.user.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('remove', () => {
        it('should delete a user', async () => {
            const user = {
                id: 1,
                name: 'User 1',
                email: 'user1@example.com',
                role: Role.ADMIN,
                nip: null,
                nim: null,
                prodiId: null,
                prodi: null,
                gender: null,
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
            (prisma.user.delete as jest.Mock).mockResolvedValue(user);

            const result = await service.remove(1);

            expect(result).toEqual(user);
            expect(prisma.user.delete).toHaveBeenCalledWith({
                where: { id: 1 },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    gender: true,
                    nip: true,
                    nim: true,
                    prodiId: true,
                    prodi: true,
                },
            });
        });
    });
});