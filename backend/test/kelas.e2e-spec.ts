import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('KelasController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let adminToken: string;
    let kaprodiToken: string;
    let dosenToken: string;
    let prodiId: number;

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

        // Create prodi first
        const prodi = await prisma.prodi.create({
            data: { namaProdi: 'Teknik Informatika' },
        });
        prodiId = prodi.id;

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

        // Create dosen user for testing
        const dosenPassword = 'dosenpass';
        const hashedDosenPassword = await bcrypt.hash(dosenPassword, 10);
        await prisma.user.create({
            data: {
                name: 'Dosen User',
                email: 'dosen@example.com',
                password: hashedDosenPassword,
                role: Role.DOSEN,
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

        const dosenLoginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'dosen@example.com', password: dosenPassword });
        dosenToken = dosenLoginResponse.body.access_token;
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

    describe('/kelas (POST)', () => {
        it('should create a new kelas (Admin)', async () => {
            const createKelasDto = {
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: prodiId,
            };

            const response = await request(app.getHttpServer())
                .post('/kelas')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createKelasDto)
                .expect(201);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: prodiId,
                prodi: { id: prodiId, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            });
        });

        it('should create a new kelas (Kaprodi)', async () => {
            const createKelasDto = {
                namaKelas: 'TI-3B',
                angkatan: 2023,
                prodiId: prodiId,
            };

            const response = await request(app.getHttpServer())
                .post('/kelas')
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .send(createKelasDto)
                .expect(201);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                namaKelas: 'TI-3B',
                angkatan: 2023,
                prodiId: prodiId,
            });
        });

        it('should return 409 if namaKelas already exists', async () => {
            const createKelasDto = {
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: prodiId,
            };

            // Create first kelas
            await request(app.getHttpServer())
                .post('/kelas')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createKelasDto)
                .expect(201);

            // Try to create duplicate
            await request(app.getHttpServer())
                .post('/kelas')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createKelasDto)
                .expect(409);
        });

        it('should return 401 if not authenticated', async () => {
            const createKelasDto = {
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: prodiId,
            };

            await request(app.getHttpServer())
                .post('/kelas')
                .send(createKelasDto)
                .expect(401);
        });

        it('should return 403 if not authorized role', async () => {
            const createKelasDto = {
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: prodiId,
            };

            await request(app.getHttpServer())
                .post('/kelas')
                .set('Authorization', `Bearer ${dosenToken}`)
                .send(createKelasDto)
                .expect(403);
        });
    });

    describe('/kelas (GET)', () => {
        beforeEach(async () => {
            await prisma.kelas.create({
                data: {
                    namaKelas: 'TI-3A',
                    angkatan: 2023,
                    prodiId: prodiId,
                },
            });
            await prisma.kelas.create({
                data: {
                    namaKelas: 'TI-3B',
                    angkatan: 2023,
                    prodiId: prodiId,
                },
            });
        });

        it('should get all kelas (Admin)', async () => {
            const response = await request(app.getHttpServer())
                .get('/kelas')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toMatchObject({
                id: expect.any(Number),
                namaKelas: expect.any(String),
                angkatan: expect.any(Number),
                prodiId: prodiId,
                prodi: { id: prodiId, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            });
        });

        it('should get all kelas (Kaprodi)', async () => {
            const response = await request(app.getHttpServer())
                .get('/kelas')
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
        });

        it('should get all kelas (Dosen)', async () => {
            const response = await request(app.getHttpServer())
                .get('/kelas')
                .set('Authorization', `Bearer ${dosenToken}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
        });
    });

    describe('/kelas/:id (GET)', () => {
        let kelasId: number;

        beforeEach(async () => {
            const kelas = await prisma.kelas.create({
                data: {
                    namaKelas: 'TI-3A',
                    angkatan: 2023,
                    prodiId: prodiId,
                },
            });
            kelasId = kelas.id;
        });

        it('should get kelas by id', async () => {
            const response = await request(app.getHttpServer())
                .get(`/kelas/${kelasId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                id: kelasId,
                namaKelas: 'TI-3A',
                angkatan: 2023,
                prodiId: prodiId,
                prodi: { id: prodiId, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            });
        });

        it('should return 404 if kelas not found', async () => {
            await request(app.getHttpServer())
                .get('/kelas/999')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });

    describe('/kelas/:id (PUT)', () => {
        let kelasId: number;

        beforeEach(async () => {
            const kelas = await prisma.kelas.create({
                data: {
                    namaKelas: 'TI-3A',
                    angkatan: 2023,
                    prodiId: prodiId,
                },
            });
            kelasId = kelas.id;
        });

        it('should update kelas (Admin)', async () => {
            const updateKelasDto = {
                namaKelas: 'TI-3C',
            };

            const response = await request(app.getHttpServer())
                .put(`/kelas/${kelasId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateKelasDto)
                .expect(200);

            expect(response.body).toMatchObject({
                id: kelasId,
                namaKelas: 'TI-3C',
                angkatan: 2023,
                prodiId: prodiId,
            });
        });

        it('should update kelas (Kaprodi)', async () => {
            const updateKelasDto = {
                namaKelas: 'TI-3C',
            };

            const response = await request(app.getHttpServer())
                .put(`/kelas/${kelasId}`)
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .send(updateKelasDto)
                .expect(200);

            expect(response.body.namaKelas).toBe('TI-3C');
        });

        it('should return 409 if namaKelas already exists', async () => {
            // Create another kelas
            await prisma.kelas.create({
                data: {
                    namaKelas: 'TI-3B',
                    angkatan: 2023,
                    prodiId: prodiId,
                },
            });

            const updateKelasDto = {
                namaKelas: 'TI-3B',
            };

            await request(app.getHttpServer())
                .put(`/kelas/${kelasId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateKelasDto)
                .expect(409);
        });

        it('should return 403 if not authorized role', async () => {
            const updateKelasDto = {
                namaKelas: 'TI-3C',
            };

            await request(app.getHttpServer())
                .put(`/kelas/${kelasId}`)
                .set('Authorization', `Bearer ${dosenToken}`)
                .send(updateKelasDto)
                .expect(403);
        });
    });

    describe('/kelas/:id (DELETE)', () => {
        let kelasId: number;

        beforeEach(async () => {
            const kelas = await prisma.kelas.create({
                data: {
                    namaKelas: 'TI-3A',
                    angkatan: 2023,
                    prodiId: prodiId,
                },
            });
            kelasId = kelas.id;
        });

        it('should delete kelas (Admin)', async () => {
            await request(app.getHttpServer())
                .delete(`/kelas/${kelasId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            // Verify kelas is deleted
            const deletedKelas = await prisma.kelas.findUnique({
                where: { id: kelasId },
            });
            expect(deletedKelas).toBeNull();
        });

        it('should delete kelas (Kaprodi)', async () => {
            await request(app.getHttpServer())
                .delete(`/kelas/${kelasId}`)
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .expect(200);

            // Verify kelas is deleted
            const deletedKelas = await prisma.kelas.findUnique({
                where: { id: kelasId },
            });
            expect(deletedKelas).toBeNull();
        });

        it('should return 403 if not authorized role', async () => {
            await request(app.getHttpServer())
                .delete(`/kelas/${kelasId}`)
                .set('Authorization', `Bearer ${dosenToken}`)
                .expect(403);
        });
    });
});