import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { ProdiService } from './prodi.service';
import { CreateProdiDto } from './dto/create-prodi.dto';
import { UpdateProdiDto } from './dto/update-prodi.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('prodi')
@ApiBearerAuth('JWT-auth')
@Controller('prodi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProdiController {
    constructor(private readonly prodiService: ProdiService) { }

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Create a new prodi (Admin only)' })
    @ApiBody({ type: CreateProdiDto })
    @ApiResponse({
        status: 201,
        description: 'Prodi created successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                namaProdi: { type: 'string', example: 'Teknik Informatika' },
                users: { type: 'array', items: { type: 'object' } },
                kelas: { type: 'array', items: { type: 'object' } },
                mataKuliah: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() createProdiDto: CreateProdiDto) {
        return this.prodiService.create(createProdiDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.KAPRODI)
    @ApiOperation({ summary: 'Get all prodi' })
    @ApiResponse({
        status: 200,
        description: 'List of prodi',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    namaProdi: { type: 'string' },
                    users: { type: 'array', items: { type: 'object' } },
                    kelas: { type: 'array', items: { type: 'object' } },
                    mataKuliah: { type: 'array', items: { type: 'object' } },
                },
            },
        },
    })
    findAll() {
        return this.prodiService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.KAPRODI)
    @ApiOperation({ summary: 'Get prodi by ID' })
    @ApiParam({ name: 'id', description: 'Prodi ID', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'Prodi found',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                namaProdi: { type: 'string' },
                users: { type: 'array', items: { type: 'object' } },
                kelas: { type: 'array', items: { type: 'object' } },
                mataKuliah: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Prodi not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.prodiService.findOne(id);
    }

    @Put(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update prodi (Admin only)' })
    @ApiParam({ name: 'id', description: 'Prodi ID', type: 'number' })
    @ApiBody({ type: UpdateProdiDto })
    @ApiResponse({
        status: 200,
        description: 'Prodi updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                namaProdi: { type: 'string' },
                users: { type: 'array', items: { type: 'object' } },
                kelas: { type: 'array', items: { type: 'object' } },
                mataKuliah: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Prodi not found' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateProdiDto: UpdateProdiDto) {
        return this.prodiService.update(id, updateProdiDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete a prodi (Admin only)' })
    @ApiParam({ name: 'id', description: 'Prodi ID', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'Prodi deleted successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                namaProdi: { type: 'string' },
                users: { type: 'array', items: { type: 'object' } },
                kelas: { type: 'array', items: { type: 'object' } },
                mataKuliah: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Prodi not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.prodiService.remove(id);
    }
}