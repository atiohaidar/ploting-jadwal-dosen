import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
        const { email, password, ...rest } = createUserDto;

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                ...rest,
            },
        });

        // Exclude password from return
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async findAll(): Promise<Omit<User, 'password'>[]> {
        return this.prisma.user.findMany({
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
    }

    async findOne(id: number): Promise<Omit<User, 'password'>> {
        const user = await this.prisma.user.findUnique({
            where: { id },
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
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
        // Check if user exists
        await this.findOne(id);

        return this.prisma.user.update({
            where: { id },
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
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async bulkCreate(createUserDtos: CreateUserDto[]): Promise<Omit<User, 'password'>[]> {
        const results: Omit<User, 'password'>[] = [];

        for (const createUserDto of createUserDtos) {
            try {
                const user = await this.create(createUserDto);
                results.push(user);
            } catch (error) {
                // Continue with other users if one fails
                console.error(`Failed to create user ${createUserDto.email}:`, error.message);
            }
        }

        return results;
    }

    async remove(id: number): Promise<Omit<User, 'password'>> {
        // Check if user exists
        await this.findOne(id);

        const user = await this.prisma.user.delete({
            where: { id },
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

        return user;
    }
}