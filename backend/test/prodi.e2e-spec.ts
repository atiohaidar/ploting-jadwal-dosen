import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('ProdiController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let adminToken: string;
    let kaprodiToken: string;

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

        // Create kaprodi user for testing
        const kaprodiPassword = 'kaprodipass';
        const hashedKaprodiPassword = await bcrypt.hash(kaprodiPassword, 10);
        await prisma.user.create({
            data: {
                name: 'Kaprodi User',
                email: 'kaprodi@example.com',
                password: hashedKaprodiPassword,
                role: Role.KAPRODI,
            },
        });

        // Login to get tokens
        const adminLoginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'admin@example.com', password: adminPassword });
        adminToken = adminLoginResponse.body.access_token;

        const kaprodiLoginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'kaprodi@example.com', password: kaprodiPassword });
        kaprodiToken = kaprodiLoginResponse.body.access_token;
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

    describe('/prodi (POST)', () => {
        it('should create a new prodi (Admin only)', async () => {
            const createProdiDto = {
                namaProdi: 'Teknik Informatika',
            };

            const response = await request(app.getHttpServer())
                .post('/prodi')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createProdiDto)
                .expect(201);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                namaProdi: 'Teknik Informatika',
                users: [],
                kelas: [],
                mataKuliah: [],
            });
        });

        it('should return 401 if not authenticated', async () => {
            const createProdiDto = {
                namaProdi: 'Teknik Informatika',
            };

            await request(app.getHttpServer())
                .post('/prodi')
                .send(createProdiDto)
                .expect(401);
        });

        it('should return 403 if not admin', async () => {
            const createProdiDto = {
                namaProdi: 'Teknik Informatika',
            };

            await request(app.getHttpServer())
                .post('/prodi')
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .send(createProdiDto)
                .expect(403);
        });
    });

    describe('/prodi (GET)', () => {
        beforeEach(async () => {
            await prisma.prodi.create({
                data: { namaProdi: 'Teknik Informatika' },
            });
            await prisma.prodi.create({
                data: { namaProdi: 'Sistem Informasi' },
            });
        });

        it('should get all prodi (Admin)', async () => {
            const response = await request(app.getHttpServer())
                .get('/prodi')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toMatchObject({
                id: expect.any(Number),
                namaProdi: expect.any(String),
                users: [],
                kelas: [],
                mataKuliah: [],
            });
        });

        it('should get all prodi (Kaprodi)', async () => {
            const response = await request(app.getHttpServer())
                .get('/prodi')
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
        });
    });

    describe('/prodi/:id (GET)', () => {
        let prodiId: number;

        beforeEach(async () => {
            const prodi = await prisma.prodi.create({
                data: { namaProdi: 'Teknik Informatika' },
            });
            prodiId = prodi.id;
        });

        it('should get prodi by id', async () => {
            const response = await request(app.getHttpServer())
                .get(`/prodi/${prodiId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                id: prodiId,
                namaProdi: 'Teknik Informatika',
                users: [],
                kelas: [],
                mataKuliah: [],
            });
        });

        it('should return 404 if prodi not found', async () => {
            await request(app.getHttpServer())
                .get('/prodi/999')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });

    describe('/prodi/:id (PUT)', () => {
        let prodiId: number;

        beforeEach(async () => {
            const prodi = await prisma.prodi.create({
                data: { namaProdi: 'Teknik Informatika' },
            });
            prodiId = prodi.id;
        });

        it('should update prodi (Admin only)', async () => {
            const updateProdiDto = {
                namaProdi: 'Teknik Informatika Updated',
            };

            const response = await request(app.getHttpServer())
                .put(`/prodi/${prodiId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateProdiDto)
                .expect(200);

            expect(response.body).toMatchObject({
                id: prodiId,
                namaProdi: 'Teknik Informatika Updated',
                users: [],
                kelas: [],
                mataKuliah: [],
            });
        });

        it('should return 403 if not admin', async () => {
            const updateProdiDto = {
                namaProdi: 'Teknik Informatika Updated',
            };

            await request(app.getHttpServer())
                .put(`/prodi/${prodiId}`)
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .send(updateProdiDto)
                .expect(403);
        });
    });

    describe('/prodi/:id (DELETE)', () => {
        let prodiId: number;

        beforeEach(async () => {
            const prodi = await prisma.prodi.create({
                data: { namaProdi: 'Teknik Informatika' },
            });
            prodiId = prodi.id;
        });

        it('should delete prodi (Admin only)', async () => {
            await request(app.getHttpServer())
                .delete(`/prodi/${prodiId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            // Verify prodi is deleted
            const deletedProdi = await prisma.prodi.findUnique({
                where: { id: prodiId },
            });
            expect(deletedProdi).toBeNull();
        });

        it('should return 403 if not admin', async () => {
            await request(app.getHttpServer())
                .delete(`/prodi/${prodiId}`)
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .expect(403);
        });
    });
});