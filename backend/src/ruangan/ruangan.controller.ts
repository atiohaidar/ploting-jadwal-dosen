import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { RuanganService } from './ruangan.service';
import { CreateRuanganDto } from './dto/create-ruangan.dto';
import { UpdateRuanganDto } from './dto/update-ruangan.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('ruangan')
@ApiBearerAuth('JWT-auth')
@Controller('ruangan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RuanganController {
    constructor(private readonly ruanganService: RuanganService) { }

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Create a new ruangan (Admin only)' })
    @ApiBody({ type: CreateRuanganDto })
    @ApiResponse({
        status: 201,
        description: 'Ruangan created successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                nama: { type: 'string', example: 'Lab Komputer 1' },
                kapasitas: { type: 'number', example: 30 },
                lokasi: { type: 'string', nullable: true, example: 'Gedung A Lantai 2' },
                Jadwal: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 409, description: 'Ruangan with this nama already exists' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() createRuanganDto: CreateRuanganDto) {
        return this.ruanganService.create(createRuanganDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.KAPRODI, Role.DOSEN)
    @ApiOperation({ summary: 'Get all ruangan' })
    @ApiResponse({
        status: 200,
        description: 'List of ruangan',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    nama: { type: 'string' },
                    kapasitas: { type: 'number' },
                    lokasi: { type: 'string', nullable: true },
                    Jadwal: { type: 'array', items: { type: 'object' } },
                },
            },
        },
    })
    findAll() {
        return this.ruanganService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.KAPRODI, Role.DOSEN)
    @ApiOperation({ summary: 'Get ruangan by ID' })
    @ApiParam({ name: 'id', description: 'Ruangan ID', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'Ruangan found',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                nama: { type: 'string' },
                kapasitas: { type: 'number' },
                lokasi: { type: 'string', nullable: true },
                Jadwal: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Ruangan not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.ruanganService.findOne(id);
    }

    @Put(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update ruangan (Admin only)' })
    @ApiParam({ name: 'id', description: 'Ruangan ID', type: 'number' })
    @ApiBody({ type: UpdateRuanganDto })
    @ApiResponse({
        status: 200,
        description: 'Ruangan updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                nama: { type: 'string' },
                kapasitas: { type: 'number' },
                lokasi: { type: 'string', nullable: true },
                Jadwal: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Ruangan not found' })
    @ApiResponse({ status: 409, description: 'Ruangan with this nama already exists' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateRuanganDto: UpdateRuanganDto) {
        return this.ruanganService.update(id, updateRuanganDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete a ruangan (Admin only)' })
    @ApiParam({ name: 'id', description: 'Ruangan ID', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'Ruangan deleted successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                nama: { type: 'string' },
                kapasitas: { type: 'number' },
                lokasi: { type: 'string', nullable: true },
                Jadwal: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Ruangan not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.ruanganService.remove(id);
    }
}