import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { MataKuliahService } from './mata-kuliah.service';
import { CreateMataKuliahDto } from './dto/create-mata-kuliah.dto';
import { UpdateMataKuliahDto } from './dto/update-mata-kuliah.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('mata-kuliah')
@ApiBearerAuth('JWT-auth')
@Controller('mata-kuliah')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MataKuliahController {
    constructor(private readonly mataKuliahService: MataKuliahService) { }

    @Post()
    @Roles(Role.ADMIN, Role.KAPRODI)
    @ApiOperation({ summary: 'Create a new mata kuliah' })
    @ApiBody({ type: CreateMataKuliahDto })
    @ApiResponse({
        status: 201,
        description: 'Mata Kuliah created successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                kodeMk: { type: 'string', example: 'TI101' },
                namaMk: { type: 'string', example: 'Pemrograman Dasar' },
                sks: { type: 'number', example: 3 },
                prodiId: { type: 'number', example: 1 },
                prodi: { type: 'object' },
                Jadwal: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 409, description: 'Mata Kuliah with this kodeMk already exists' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() createMataKuliahDto: CreateMataKuliahDto) {
        return this.mataKuliahService.create(createMataKuliahDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.KAPRODI, Role.DOSEN)
    @ApiOperation({ summary: 'Get all mata kuliah' })
    @ApiResponse({
        status: 200,
        description: 'List of mata kuliah',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    kodeMk: { type: 'string' },
                    namaMk: { type: 'string' },
                    sks: { type: 'number' },
                    prodiId: { type: 'number' },
                    prodi: { type: 'object' },
                    Jadwal: { type: 'array', items: { type: 'object' } },
                },
            },
        },
    })
    findAll() {
        return this.mataKuliahService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.KAPRODI, Role.DOSEN)
    @ApiOperation({ summary: 'Get mata kuliah by ID' })
    @ApiParam({ name: 'id', description: 'Mata Kuliah ID', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'Mata Kuliah found',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                kodeMk: { type: 'string' },
                namaMk: { type: 'string' },
                sks: { type: 'number' },
                prodiId: { type: 'number' },
                prodi: { type: 'object' },
                Jadwal: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Mata Kuliah not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.mataKuliahService.findOne(id);
    }

    @Put(':id')
    @Roles(Role.ADMIN, Role.KAPRODI)
    @ApiOperation({ summary: 'Update mata kuliah' })
    @ApiParam({ name: 'id', description: 'Mata Kuliah ID', type: 'number' })
    @ApiBody({ type: UpdateMataKuliahDto })
    @ApiResponse({
        status: 200,
        description: 'Mata Kuliah updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                kodeMk: { type: 'string' },
                namaMk: { type: 'string' },
                sks: { type: 'number' },
                prodiId: { type: 'number' },
                prodi: { type: 'object' },
                Jadwal: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Mata Kuliah not found' })
    @ApiResponse({ status: 409, description: 'Mata Kuliah with this kodeMk already exists' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateMataKuliahDto: UpdateMataKuliahDto) {
        return this.mataKuliahService.update(id, updateMataKuliahDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.KAPRODI)
    @ApiOperation({ summary: 'Delete a mata kuliah' })
    @ApiParam({ name: 'id', description: 'Mata Kuliah ID', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'Mata Kuliah deleted successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                kodeMk: { type: 'string' },
                namaMk: { type: 'string' },
                sks: { type: 'number' },
                prodiId: { type: 'number' },
                prodi: { type: 'object' },
                Jadwal: { type: 'array', items: { type: 'object' } },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Mata Kuliah not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.mataKuliahService.remove(id);
    }
}