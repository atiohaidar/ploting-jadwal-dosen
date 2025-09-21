import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKelasDto } from './dto/create-kelas.dto';
import { UpdateKelasDto } from './dto/update-kelas.dto';
import { Kelas } from '@prisma/client';

@Injectable()
export class KelasService {
    constructor(private prisma: PrismaService) { }

    async create(createKelasDto: CreateKelasDto): Promise<Kelas> {
        const { namaKelas, ...rest } = createKelasDto;

        // Check if kelas with namaKelas already exists
        const existingKelas = await this.prisma.kelas.findFirst({
            where: { namaKelas },
        });
        if (existingKelas) {
            throw new ConflictException('Kelas with this namaKelas already exists');
        }

        return this.prisma.kelas.create({
            data: createKelasDto,
            include: {
                prodi: true,
                Jadwal: true,
            },
        });
    }

    async findAll(): Promise<Kelas[]> {
        return this.prisma.kelas.findMany({
            include: {
                prodi: true,
                Jadwal: true,
            },
        });
    }

    async findOne(id: number): Promise<Kelas> {
        const kelas = await this.prisma.kelas.findUnique({
            where: { id },
            include: {
                prodi: true,
                Jadwal: true,
            },
        });
        if (!kelas) {
            throw new NotFoundException('Kelas not found');
        }
        return kelas;
    }

    async update(id: number, updateKelasDto: UpdateKelasDto): Promise<Kelas> {
        // Check if kelas exists
        await this.findOne(id);

        // Check if namaKelas is being updated and already exists
        if (updateKelasDto.namaKelas) {
            const existingKelas = await this.prisma.kelas.findFirst({
                where: { namaKelas: updateKelasDto.namaKelas },
            });
            if (existingKelas && existingKelas.id !== id) {
                throw new ConflictException('Kelas with this namaKelas already exists');
            }
        }

        return this.prisma.kelas.update({
            where: { id },
            data: updateKelasDto,
            include: {
                prodi: true,
                Jadwal: true,
            },
        });
    }

    async remove(id: number): Promise<Kelas> {
        // Check if kelas exists
        await this.findOne(id);

        return this.prisma.kelas.delete({
            where: { id },
            include: {
                prodi: true,
                Jadwal: true,
            },
        });
    }
}