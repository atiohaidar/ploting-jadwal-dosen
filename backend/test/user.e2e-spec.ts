import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let adminToken: string;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prisma = app.get(PrismaService);
        // Clean up in correct order due to foreign key constraints
        await prisma.permintaanJadwal.deleteMany();
        await prisma.jadwal.deleteMany();
        await prisma.mataKuliah.deleteMany();
        await prisma.kelas.deleteMany();
        await prisma.ruangan.deleteMany();
        await prisma.user.deleteMany();
        await prisma.prodi.deleteMany();

        // Create admin user for testing
        const adminPassword = 'adminpass';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@example.com',
                password: hashedPassword,
                role: Role.ADMIN,
            },
        });

        // Login to get token
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'admin@example.com', password: adminPassword });
        adminToken = loginResponse.body.access_token;
    });

    afterEach(async () => {
        // Clean up in correct order due to foreign key constraints
        await prisma.permintaanJadwal.deleteMany();
        await prisma.jadwal.deleteMany();
        await prisma.mataKuliah.deleteMany();
        await prisma.kelas.deleteMany();
        await prisma.ruangan.deleteMany();
        await prisma.user.deleteMany();
        await prisma.prodi.deleteMany();
        await app.close();
    });

    describe('/users (GET)', () => {
        it('should get all users', async () => {
            const response = await request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should fail without auth', async () => {
            await request(app.getHttpServer())
                .get('/users')
                .expect(401);
        });
    });

    describe('/users (POST)', () => {
        it('should create a new user', async () => {
            const newUser = {
                name: 'New User',
                email: 'new@example.com',
                password: 'newpass',
                role: Role.DOSEN,
            };

            const response = await request(app.getHttpServer())
                .post('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newUser)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.email).toBe(newUser.email);
            expect(response.body).not.toHaveProperty('password');
        });

        it('should fail with duplicate email', async () => {
            const newUser = {
                name: 'New User',
                email: 'admin@example.com', // duplicate
                password: 'newpass',
                role: Role.DOSEN,
            };

            await request(app.getHttpServer())
                .post('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newUser)
                .expect(409);
        });
    });

    describe('/users/:id (PUT)', () => {
        it('should update user role', async () => {
            const user = await prisma.user.create({
                data: {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: await bcrypt.hash('pass', 10),
                    role: Role.MAHASISWA,
                },
            });

            const response = await request(app.getHttpServer())
                .put(`/users/${user.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: Role.DOSEN })
                .expect(200);

            expect(response.body.role).toBe(Role.DOSEN);
        });
    });

    describe('/users/bulk (POST)', () => {
        it('should create multiple users', async () => {
            const bulkUsers = {
                users: [
                    {
                        name: 'Bulk User 1',
                        email: 'bulk1@example.com',
                        password: 'password123',
                        role: Role.DOSEN,
                        nip: '111111111',
                    },
                    {
                        name: 'Bulk User 2',
                        email: 'bulk2@example.com',
                        password: 'password123',
                        role: Role.MAHASISWA,
                        nim: '222222222',
                    },
                ],
            };

            const response = await request(app.getHttpServer())
                .post('/users/bulk')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(bulkUsers)
                .expect(201);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0].email).toBe('bulk1@example.com');
            expect(response.body[1].email).toBe('bulk2@example.com');
            expect(response.body[0]).not.toHaveProperty('password');
            expect(response.body[1]).not.toHaveProperty('password');
        });

        it('should handle partial failures in bulk create', async () => {
            const bulkUsers = {
                users: [
                    {
                        name: 'Valid User',
                        email: 'valid@example.com',
                        password: 'password123',
                        role: Role.DOSEN,
                    },
                    {
                        name: 'Duplicate User',
                        email: 'admin@example.com', // duplicate email
                        password: 'password123',
                        role: Role.MAHASISWA,
                    },
                ],
            };

            const response = await request(app.getHttpServer())
                .post('/users/bulk')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(bulkUsers)
                .expect(201);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(1); // Only one user created
            expect(response.body[0].email).toBe('valid@example.com');
        });
    });

    describe('/users/:id (DELETE)', () => {
        it('should delete a user', async () => {
            const userToDelete = await prisma.user.create({
                data: {
                    name: 'User to Delete',
                    email: 'delete@example.com',
                    password: await bcrypt.hash('pass', 10),
                    role: Role.DOSEN,
                },
            });

            const response = await request(app.getHttpServer())
                .delete(`/users/${userToDelete.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body.email).toBe('delete@example.com');
            expect(response.body).not.toHaveProperty('password');

            // Verify user is deleted
            const deletedUser = await prisma.user.findUnique({
                where: { id: userToDelete.id },
            });
            expect(deletedUser).toBeNull();
        });

        it('should fail to delete non-existent user', async () => {
            await request(app.getHttpServer())
                .delete('/users/99999')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });
});