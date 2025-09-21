import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { JadwalService } from './jadwal.service';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { UpdateJadwalDto } from './dto/update-jadwal.dto';

@Controller('jadwal')
export class JadwalController {
    constructor(private readonly jadwalService: JadwalService) { }

    @Post()
    create(@Body() createJadwalDto: CreateJadwalDto) {
        return this.jadwalService.create(createJadwalDto);
    }

    @Get()
    findAll() {
        return this.jadwalService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.jadwalService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateJadwalDto: UpdateJadwalDto) {
        return this.jadwalService.update(id, updateJadwalDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.jadwalService.remove(id);
    }
}