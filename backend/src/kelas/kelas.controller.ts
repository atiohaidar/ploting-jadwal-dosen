import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { KelasService } from './kelas.service';
import { CreateKelasDto } from './dto/create-kelas.dto';
import { UpdateKelasDto } from './dto/update-kelas.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('kelas')
@ApiBearerAuth('JWT-auth')
@Controller('kelas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KelasController {
    constructor(private readonly kelasService: KelasService) { }

    @Post()
    @Roles(Role.ADMIN, Role.KAPRODI)
    @ApiOperation({ summary: 'Create a new kelas' })
    @ApiBody({ type: CreateKelasDto })
    @ApiResponse({
        status: 201,
        description: 'Kelas created successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                namaKelas: { type: 'string', example: 'TI-3A' },
                angkatan: { type: 'number', example: 2023 },
                prodiId: { type: 'number', example: 1 },
                prodi: { type: 'object' },
                Jadwal: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 409, description: 'Kelas with this namaKelas already exists' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() createKelasDto: CreateKelasDto) {
        return this.kelasService.create(createKelasDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.KAPRODI, Role.DOSEN)
    @ApiOperation({ summary: 'Get all kelas' })
    @ApiResponse({
        status: 200,
        description: 'List of kelas',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    namaKelas: { type: 'string' },
                    angkatan: { type: 'number' },
                    prodiId: { type: 'number' },
                    prodi: { type: 'object' },
                    Jadwal: { type: 'array', items: { type: 'object' } },
                },
            },
        },
    })
    findAll() {
        return this.kelasService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.KAPRODI, Role.DOSEN)
    @ApiOperation({ summary: 'Get kelas by ID' })
    @ApiParam({ name: 'id', description: 'Kelas ID', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'Kelas found',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                namaKelas: { type: 'string' },
                angkatan: { type: 'number' },
                prodiId: { type: 'number' },
                prodi: { type: 'object' },
                Jadwal: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Kelas not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.kelasService.findOne(id);
    }

    @Put(':id')
    @Roles(Role.ADMIN, Role.KAPRODI)
    @ApiOperation({ summary: 'Update kelas' })
    @ApiParam({ name: 'id', description: 'Kelas ID', type: 'number' })
    @ApiBody({ type: UpdateKelasDto })
    @ApiResponse({
        status: 200,
        description: 'Kelas updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                namaKelas: { type: 'string' },
                angkatan: { type: 'number' },
                prodiId: { type: 'number' },
                prodi: { type: 'object' },
                Jadwal: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Kelas not found' })
    @ApiResponse({ status: 409, description: 'Kelas with this namaKelas already exists' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateKelasDto: UpdateKelasDto) {
        return this.kelasService.update(id, updateKelasDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.KAPRODI)
    @ApiOperation({ summary: 'Delete a kelas' })
    @ApiParam({ name: 'id', description: 'Kelas ID', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'Kelas deleted successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                namaKelas: { type: 'string' },
                angkatan: { type: 'number' },
                prodiId: { type: 'number' },
                prodi: { type: 'object' },
                Jadwal: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Kelas not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.kelasService.remove(id);
    }
}