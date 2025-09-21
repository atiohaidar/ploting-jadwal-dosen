import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMataKuliahDto } from './dto/create-mata-kuliah.dto';
import { UpdateMataKuliahDto } from './dto/update-mata-kuliah.dto';
import { MataKuliah } from '@prisma/client';

@Injectable()
export class MataKuliahService {
    constructor(private prisma: PrismaService) { }

    async create(createMataKuliahDto: CreateMataKuliahDto): Promise<MataKuliah> {
        const { kodeMk, ...rest } = createMataKuliahDto;

        // Check if mata kuliah with kodeMk already exists
        const existingMataKuliah = await this.prisma.mataKuliah.findUnique({
            where: { kodeMk },
        });
        if (existingMataKuliah) {
            throw new ConflictException('Mata Kuliah with this kodeMk already exists');
        }

        return this.prisma.mataKuliah.create({
            data: createMataKuliahDto,
            include: {
                prodi: true,
                Jadwal: true,
            },
        });
    }

    async findAll(): Promise<MataKuliah[]> {
        return this.prisma.mataKuliah.findMany({
            include: {
                prodi: true,
                Jadwal: true,
            },
        });
    }

    async findOne(id: number): Promise<MataKuliah> {
        const mataKuliah = await this.prisma.mataKuliah.findUnique({
            where: { id },
            include: {
                prodi: true,
                Jadwal: true,
            },
        });
        if (!mataKuliah) {
            throw new NotFoundException('Mata Kuliah not found');
        }
        return mataKuliah;
    }

    async update(id: number, updateMataKuliahDto: UpdateMataKuliahDto): Promise<MataKuliah> {
        // Check if mata kuliah exists
        await this.findOne(id);

        // Check if kodeMk is being updated and already exists
        if (updateMataKuliahDto.kodeMk) {
            const existingMataKuliah = await this.prisma.mataKuliah.findUnique({
                where: { kodeMk: updateMataKuliahDto.kodeMk },
            });
            if (existingMataKuliah && existingMataKuliah.id !== id) {
                throw new ConflictException('Mata Kuliah with this kodeMk already exists');
            }
        }

        return this.prisma.mataKuliah.update({
            where: { id },
            data: updateMataKuliahDto,
            include: {
                prodi: true,
                Jadwal: true,
            },
        });
    }

    async remove(id: number): Promise<MataKuliah> {
        // Check if mata kuliah exists
        await this.findOne(id);

        return this.prisma.mataKuliah.delete({
            where: { id },
            include: {
                prodi: true,
                Jadwal: true,
            },
        });
    }
}