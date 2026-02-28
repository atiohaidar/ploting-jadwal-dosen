import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { JadwalService } from './jadwal.service';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { UpdateJadwalDto } from './dto/update-jadwal.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('jadwal')
@ApiBearerAuth('JWT-auth')
@Controller('jadwal')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JadwalController {
    constructor(private readonly jadwalService: JadwalService) { }

    @Post()
    @Roles(Role.ADMIN, Role.KAPRODI)
    @ApiOperation({ summary: 'Create a new jadwal (Admin/Kaprodi only)' })
    @ApiBody({ type: CreateJadwalDto })
    @ApiResponse({ status: 201, description: 'Jadwal created successfully' })
    @ApiResponse({ status: 409, description: 'Jadwal conflict detected' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() createJadwalDto: CreateJadwalDto) {
        return this.jadwalService.create(createJadwalDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.KAPRODI, Role.DOSEN)
    @ApiOperation({ summary: 'Get all jadwal' })
    @ApiResponse({ status: 200, description: 'List of jadwal' })
    findAll() {
        return this.jadwalService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.KAPRODI, Role.DOSEN)
    @ApiOperation({ summary: 'Get jadwal by ID' })
    @ApiParam({ name: 'id', description: 'Jadwal ID', type: 'number' })
    @ApiResponse({ status: 200, description: 'Jadwal found' })
    @ApiResponse({ status: 404, description: 'Jadwal not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.jadwalService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.KAPRODI)
    @ApiOperation({ summary: 'Update jadwal (Admin/Kaprodi only)' })
    @ApiParam({ name: 'id', description: 'Jadwal ID', type: 'number' })
    @ApiBody({ type: UpdateJadwalDto })
    @ApiResponse({ status: 200, description: 'Jadwal updated successfully' })
    @ApiResponse({ status: 404, description: 'Jadwal not found' })
    @ApiResponse({ status: 409, description: 'Jadwal conflict detected' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateJadwalDto: UpdateJadwalDto) {
        return this.jadwalService.update(id, updateJadwalDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.KAPRODI)
    @ApiOperation({ summary: 'Delete a jadwal (Admin/Kaprodi only)' })
    @ApiParam({ name: 'id', description: 'Jadwal ID', type: 'number' })
    @ApiResponse({ status: 200, description: 'Jadwal deleted successfully' })
    @ApiResponse({ status: 404, description: 'Jadwal not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.jadwalService.remove(id);
    }
}