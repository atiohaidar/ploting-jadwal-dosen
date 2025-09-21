import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('MataKuliahController (e2e)', () => {
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

    describe('/mata-kuliah (POST)', () => {
        it('should create a new mata kuliah (Admin)', async () => {
            const createMataKuliahDto = {
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: prodiId,
            };

            const response = await request(app.getHttpServer())
                .post('/mata-kuliah')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createMataKuliahDto)
                .expect(201);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: prodiId,
                prodi: { id: prodiId, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            });
        });

        it('should create a new mata kuliah (Kaprodi)', async () => {
            const createMataKuliahDto = {
                kodeMk: 'TI102',
                namaMk: 'Pemrograman Lanjutan',
                sks: 3,
                prodiId: prodiId,
            };

            const response = await request(app.getHttpServer())
                .post('/mata-kuliah')
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .send(createMataKuliahDto)
                .expect(201);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                kodeMk: 'TI102',
                namaMk: 'Pemrograman Lanjutan',
                sks: 3,
                prodiId: prodiId,
            });
        });

        it('should return 409 if kodeMk already exists', async () => {
            const createMataKuliahDto = {
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: prodiId,
            };

            // Create first mata kuliah
            await request(app.getHttpServer())
                .post('/mata-kuliah')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createMataKuliahDto)
                .expect(201);

            // Try to create duplicate
            await request(app.getHttpServer())
                .post('/mata-kuliah')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createMataKuliahDto)
                .expect(409);
        });

        it('should return 401 if not authenticated', async () => {
            const createMataKuliahDto = {
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: prodiId,
            };

            await request(app.getHttpServer())
                .post('/mata-kuliah')
                .send(createMataKuliahDto)
                .expect(401);
        });

        it('should return 403 if not authorized role', async () => {
            const createMataKuliahDto = {
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: prodiId,
            };

            await request(app.getHttpServer())
                .post('/mata-kuliah')
                .set('Authorization', `Bearer ${dosenToken}`)
                .send(createMataKuliahDto)
                .expect(403);
        });
    });

    describe('/mata-kuliah (GET)', () => {
        beforeEach(async () => {
            await prisma.mataKuliah.create({
                data: {
                    kodeMk: 'TI101',
                    namaMk: 'Pemrograman Dasar',
                    sks: 3,
                    prodiId: prodiId,
                },
            });
            await prisma.mataKuliah.create({
                data: {
                    kodeMk: 'TI102',
                    namaMk: 'Pemrograman Lanjutan',
                    sks: 3,
                    prodiId: prodiId,
                },
            });
        });

        it('should get all mata kuliah (Admin)', async () => {
            const response = await request(app.getHttpServer())
                .get('/mata-kuliah')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toMatchObject({
                id: expect.any(Number),
                kodeMk: expect.any(String),
                namaMk: expect.any(String),
                sks: expect.any(Number),
                prodiId: prodiId,
                prodi: { id: prodiId, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            });
        });

        it('should get all mata kuliah (Kaprodi)', async () => {
            const response = await request(app.getHttpServer())
                .get('/mata-kuliah')
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
        });

        it('should get all mata kuliah (Dosen)', async () => {
            const response = await request(app.getHttpServer())
                .get('/mata-kuliah')
                .set('Authorization', `Bearer ${dosenToken}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
        });
    });

    describe('/mata-kuliah/:id (GET)', () => {
        let mataKuliahId: number;

        beforeEach(async () => {
            const mataKuliah = await prisma.mataKuliah.create({
                data: {
                    kodeMk: 'TI101',
                    namaMk: 'Pemrograman Dasar',
                    sks: 3,
                    prodiId: prodiId,
                },
            });
            mataKuliahId = mataKuliah.id;
        });

        it('should get mata kuliah by id', async () => {
            const response = await request(app.getHttpServer())
                .get(`/mata-kuliah/${mataKuliahId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                id: mataKuliahId,
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar',
                sks: 3,
                prodiId: prodiId,
                prodi: { id: prodiId, namaProdi: 'Teknik Informatika' },
                Jadwal: [],
            });
        });

        it('should return 404 if mata kuliah not found', async () => {
            await request(app.getHttpServer())
                .get('/mata-kuliah/999')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });

    describe('/mata-kuliah/:id (PUT)', () => {
        let mataKuliahId: number;

        beforeEach(async () => {
            const mataKuliah = await prisma.mataKuliah.create({
                data: {
                    kodeMk: 'TI101',
                    namaMk: 'Pemrograman Dasar',
                    sks: 3,
                    prodiId: prodiId,
                },
            });
            mataKuliahId = mataKuliah.id;
        });

        it('should update mata kuliah (Admin)', async () => {
            const updateMataKuliahDto = {
                namaMk: 'Pemrograman Dasar Updated',
            };

            const response = await request(app.getHttpServer())
                .put(`/mata-kuliah/${mataKuliahId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateMataKuliahDto)
                .expect(200);

            expect(response.body).toMatchObject({
                id: mataKuliahId,
                kodeMk: 'TI101',
                namaMk: 'Pemrograman Dasar Updated',
                sks: 3,
                prodiId: prodiId,
            });
        });

        it('should update mata kuliah (Kaprodi)', async () => {
            const updateMataKuliahDto = {
                namaMk: 'Pemrograman Dasar Updated',
            };

            const response = await request(app.getHttpServer())
                .put(`/mata-kuliah/${mataKuliahId}`)
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .send(updateMataKuliahDto)
                .expect(200);

            expect(response.body.namaMk).toBe('Pemrograman Dasar Updated');
        });

        it('should return 409 if kodeMk already exists', async () => {
            // Create another mata kuliah
            await prisma.mataKuliah.create({
                data: {
                    kodeMk: 'TI102',
                    namaMk: 'Pemrograman Lanjutan',
                    sks: 3,
                    prodiId: prodiId,
                },
            });

            const updateMataKuliahDto = {
                kodeMk: 'TI102',
            };

            await request(app.getHttpServer())
                .put(`/mata-kuliah/${mataKuliahId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateMataKuliahDto)
                .expect(409);
        });

        it('should return 403 if not authorized role', async () => {
            const updateMataKuliahDto = {
                namaMk: 'Pemrograman Dasar Updated',
            };

            await request(app.getHttpServer())
                .put(`/mata-kuliah/${mataKuliahId}`)
                .set('Authorization', `Bearer ${dosenToken}`)
                .send(updateMataKuliahDto)
                .expect(403);
        });
    });

    describe('/mata-kuliah/:id (DELETE)', () => {
        let mataKuliahId: number;

        beforeEach(async () => {
            const mataKuliah = await prisma.mataKuliah.create({
                data: {
                    kodeMk: 'TI101',
                    namaMk: 'Pemrograman Dasar',
                    sks: 3,
                    prodiId: prodiId,
                },
            });
            mataKuliahId = mataKuliah.id;
        });

        it('should delete mata kuliah (Admin)', async () => {
            await request(app.getHttpServer())
                .delete(`/mata-kuliah/${mataKuliahId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            // Verify mata kuliah is deleted
            const deletedMataKuliah = await prisma.mataKuliah.findUnique({
                where: { id: mataKuliahId },
            });
            expect(deletedMataKuliah).toBeNull();
        });

        it('should delete mata kuliah (Kaprodi)', async () => {
            await request(app.getHttpServer())
                .delete(`/mata-kuliah/${mataKuliahId}`)
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .expect(200);

            // Verify mata kuliah is deleted
            const deletedMataKuliah = await prisma.mataKuliah.findUnique({
                where: { id: mataKuliahId },
            });
            expect(deletedMataKuliah).toBeNull();
        });

        it('should return 403 if not authorized role', async () => {
            await request(app.getHttpServer())
                .delete(`/mata-kuliah/${mataKuliahId}`)
                .set('Authorization', `Bearer ${dosenToken}`)
                .expect(403);
        });
    });
});