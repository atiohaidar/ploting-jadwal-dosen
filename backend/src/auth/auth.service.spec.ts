import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
    let service: AuthService;
    let userService: jest.Mocked<UserService>;
    let jwtService: jest.Mocked<JwtService>;

    beforeEach(async () => {
        const mockUserService = {
            findByEmail: jest.fn(),
        };
        const mockJwtService = {
            sign: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get(UserService);
        jwtService = module.get(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        it('should return access token for valid credentials', async () => {
            const loginDto = { email: 'test@example.com', password: 'password' };
            const user = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                password: await bcrypt.hash('password', 10),
                role: 'ADMIN' as any,
                nip: null,
                nim: null,
                prodiId: null,
            };
            const token = 'jwt-token';

            userService.findByEmail.mockResolvedValue(user);
            jwtService.sign.mockReturnValue(token);

            const result = await service.login(loginDto);

            expect(result).toEqual({ access_token: token });
            expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
            expect(jwtService.sign).toHaveBeenCalledWith({
                email: user.email,
                sub: user.id,
                role: user.role,
            });
        });

        it('should throw UnauthorizedException for invalid email', async () => {
            const loginDto = { email: 'invalid@example.com', password: 'password' };

            userService.findByEmail.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for invalid password', async () => {
            const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
            const user = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                password: await bcrypt.hash('password', 10),
                role: 'ADMIN' as any,
                nip: null,
                nim: null,
                prodiId: null,
            };

            userService.findByEmail.mockResolvedValue(user);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });
});