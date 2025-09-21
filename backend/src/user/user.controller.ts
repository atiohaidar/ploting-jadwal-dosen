import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BulkCreateUserDto } from './dto/bulk-create-user.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Create a new user (Admin only)' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'User created successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                role: { type: 'string', enum: ['ADMIN', 'DOSEN', 'MAHASISWA', 'KAPRODI'] },
                nip: { type: 'string', nullable: true },
                nim: { type: 'string', nullable: true },
                prodiId: { type: 'number', nullable: true },
            },
        },
    })
    @ApiResponse({ status: 409, description: 'User already exists' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    @ApiResponse({
        status: 200,
        description: 'List of users',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                    nip: { type: 'string', nullable: true },
                    nim: { type: 'string', nullable: true },
                    prodiId: { type: 'number', nullable: true },
                    prodi: {
                        type: 'object',
                        nullable: true,
                        properties: {
                            id: { type: 'number' },
                            namaProdi: { type: 'string' },
                        },
                    },
                },
            },
        },
    })
    findAll() {
        return this.userService.findAll();
    }

    @Put(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update user (Admin only)' })
    @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({
        status: 200,
        description: 'User updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                nip: { type: 'string', nullable: true },
                nim: { type: 'string', nullable: true },
                prodiId: { type: 'number', nullable: true },
                prodi: {
                    type: 'object',
                    nullable: true,
                    properties: {
                        id: { type: 'number' },
                        namaProdi: { type: 'string' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @Post('bulk')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Create multiple users at once (Admin only)' })
    @ApiBody({ type: BulkCreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'Users created successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                    gender: { type: 'string', nullable: true },
                    nip: { type: 'string', nullable: true },
                    nim: { type: 'string', nullable: true },
                    prodiId: { type: 'number', nullable: true },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    bulkCreate(@Body() bulkCreateUserDto: BulkCreateUserDto) {
        return this.userService.bulkCreate(bulkCreateUserDto.users);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete a user (Admin only)' })
    @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'User deleted successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                nip: { type: 'string', nullable: true },
                nim: { type: 'string', nullable: true },
                prodiId: { type: 'number', nullable: true },
                prodi: {
                    type: 'object',
                    nullable: true,
                    properties: {
                        id: { type: 'number' },
                        namaProdi: { type: 'string' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }
}