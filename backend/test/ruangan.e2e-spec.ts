import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('RuanganController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let adminToken: string;
    let kaprodiToken: string;
    let dosenToken: string;

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

    describe('/ruangan (POST)', () => {
        it('should create a new ruangan (Admin only)', async () => {
            const createRuanganDto = {
                nama: 'Lab Komputer 1',
                kapasitas: 30,
                lokasi: 'Gedung A Lantai 2',
            };

            const response = await request(app.getHttpServer())
                .post('/ruangan')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createRuanganDto)
                .expect(201);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                nama: 'Lab Komputer 1',
                kapasitas: 30,
                lokasi: 'Gedung A Lantai 2',
                Jadwal: [],
            });
        });

        it('should create a new ruangan without lokasi', async () => {
            const createRuanganDto = {
                nama: 'Lab Komputer 2',
                kapasitas: 25,
            };

            const response = await request(app.getHttpServer())
                .post('/ruangan')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createRuanganDto)
                .expect(201);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                nama: 'Lab Komputer 2',
                kapasitas: 25,
                lokasi: null,
                Jadwal: [],
            });
        });

        it('should return 409 if nama already exists', async () => {
            const createRuanganDto = {
                nama: 'Lab Komputer 1',
                kapasitas: 30,
            };

            // Create first ruangan
            await request(app.getHttpServer())
                .post('/ruangan')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createRuanganDto)
                .expect(201);

            // Try to create duplicate
            await request(app.getHttpServer())
                .post('/ruangan')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createRuanganDto)
                .expect(409);
        });

        it('should return 401 if not authenticated', async () => {
            const createRuanganDto = {
                nama: 'Lab Komputer 1',
                kapasitas: 30,
            };

            await request(app.getHttpServer())
                .post('/ruangan')
                .send(createRuanganDto)
                .expect(401);
        });

        it('should return 403 if not admin', async () => {
            const createRuanganDto = {
                nama: 'Lab Komputer 1',
                kapasitas: 30,
            };

            await request(app.getHttpServer())
                .post('/ruangan')
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .send(createRuanganDto)
                .expect(403);
        });
    });

    describe('/ruangan (GET)', () => {
        beforeEach(async () => {
            await prisma.ruangan.create({
                data: {
                    nama: 'Lab Komputer 1',
                    kapasitas: 30,
                    lokasi: 'Gedung A Lantai 2',
                },
            });
            await prisma.ruangan.create({
                data: {
                    nama: 'Ruang Kuliah 101',
                    kapasitas: 50,
                },
            });
        });

        it('should get all ruangan (Admin)', async () => {
            const response = await request(app.getHttpServer())
                .get('/ruangan')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toMatchObject({
                id: expect.any(Number),
                nama: expect.any(String),
                kapasitas: expect.any(Number),
                lokasi: expect.any(String),
                Jadwal: [],
            });
        });

        it('should get all ruangan (Kaprodi)', async () => {
            const response = await request(app.getHttpServer())
                .get('/ruangan')
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
        });

        it('should get all ruangan (Dosen)', async () => {
            const response = await request(app.getHttpServer())
                .get('/ruangan')
                .set('Authorization', `Bearer ${dosenToken}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
        });
    });

    describe('/ruangan/:id (GET)', () => {
        let ruanganId: number;

        beforeEach(async () => {
            const ruangan = await prisma.ruangan.create({
                data: {
                    nama: 'Lab Komputer 1',
                    kapasitas: 30,
                    lokasi: 'Gedung A Lantai 2',
                },
            });
            ruanganId = ruangan.id;
        });

        it('should get ruangan by id', async () => {
            const response = await request(app.getHttpServer())
                .get(`/ruangan/${ruanganId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                id: ruanganId,
                nama: 'Lab Komputer 1',
                kapasitas: 30,
                lokasi: 'Gedung A Lantai 2',
                Jadwal: [],
            });
        });

        it('should return 404 if ruangan not found', async () => {
            await request(app.getHttpServer())
                .get('/ruangan/999')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });

    describe('/ruangan/:id (PUT)', () => {
        let ruanganId: number;

        beforeEach(async () => {
            const ruangan = await prisma.ruangan.create({
                data: {
                    nama: 'Lab Komputer 1',
                    kapasitas: 30,
                    lokasi: 'Gedung A Lantai 2',
                },
            });
            ruanganId = ruangan.id;
        });

        it('should update ruangan (Admin only)', async () => {
            const updateRuanganDto = {
                nama: 'Lab Komputer 1 Updated',
            };

            const response = await request(app.getHttpServer())
                .put(`/ruangan/${ruanganId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateRuanganDto)
                .expect(200);

            expect(response.body).toMatchObject({
                id: ruanganId,
                nama: 'Lab Komputer 1 Updated',
                kapasitas: 30,
                lokasi: 'Gedung A Lantai 2',
                Jadwal: [],
            });
        });

        it('should return 409 if nama already exists', async () => {
            // Create another ruangan
            await prisma.ruangan.create({
                data: {
                    nama: 'Lab Komputer 2',
                    kapasitas: 25,
                },
            });

            const updateRuanganDto = {
                nama: 'Lab Komputer 2',
            };

            await request(app.getHttpServer())
                .put(`/ruangan/${ruanganId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateRuanganDto)
                .expect(409);
        });

        it('should return 403 if not admin', async () => {
            const updateRuanganDto = {
                nama: 'Lab Komputer 1 Updated',
            };

            await request(app.getHttpServer())
                .put(`/ruangan/${ruanganId}`)
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .send(updateRuanganDto)
                .expect(403);
        });
    });

    describe('/ruangan/:id (DELETE)', () => {
        let ruanganId: number;

        beforeEach(async () => {
            const ruangan = await prisma.ruangan.create({
                data: {
                    nama: 'Lab Komputer 1',
                    kapasitas: 30,
                    lokasi: 'Gedung A Lantai 2',
                },
            });
            ruanganId = ruangan.id;
        });

        it('should delete ruangan (Admin only)', async () => {
            await request(app.getHttpServer())
                .delete(`/ruangan/${ruanganId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            // Verify ruangan is deleted
            const deletedRuangan = await prisma.ruangan.findUnique({
                where: { id: ruanganId },
            });
            expect(deletedRuangan).toBeNull();
        });

        it('should return 403 if not admin', async () => {
            await request(app.getHttpServer())
                .delete(`/ruangan/${ruanganId}`)
                .set('Authorization', `Bearer ${kaprodiToken}`)
                .expect(403);
        });
    });
});