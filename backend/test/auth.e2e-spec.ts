import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prisma = app.get(PrismaService);
        await prisma.user.deleteMany(); // Clean up
    });

    afterEach(async () => {
        await prisma.user.deleteMany();
        await app.close();
    });

    describe('/auth/login (POST)', () => {
        it('should login successfully', async () => {
            const password = 'password';
            const hashedPassword = await bcrypt.hash(password, 10);

            await prisma.user.create({
                data: {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: hashedPassword,
                    role: Role.ADMIN,
                },
            });

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'test@example.com', password })
                .expect(201);

            expect(response.body).toHaveProperty('access_token');
        });

        it('should fail with invalid credentials', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'invalid@example.com', password: 'wrong' })
                .expect(401);
        });
    });
});