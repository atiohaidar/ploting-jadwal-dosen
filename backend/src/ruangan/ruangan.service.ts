import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuanganDto } from './dto/create-ruangan.dto';
import { UpdateRuanganDto } from './dto/update-ruangan.dto';
import { Ruangan } from '@prisma/client';

@Injectable()
export class RuanganService {
    constructor(private prisma: PrismaService) { }

    async create(createRuanganDto: CreateRuanganDto): Promise<Ruangan> {
        const { nama, ...rest } = createRuanganDto;

        // Check if ruangan with nama already exists
        const existingRuangan = await this.prisma.ruangan.findFirst({
            where: { nama },
        });
        if (existingRuangan) {
            throw new ConflictException('Ruangan with this nama already exists');
        }

        return this.prisma.ruangan.create({
            data: createRuanganDto,
            include: {
                Jadwal: true,
            },
        });
    }

    async findAll(): Promise<Ruangan[]> {
        return this.prisma.ruangan.findMany({
            include: {
                Jadwal: true,
            },
        });
    }

    async findOne(id: number): Promise<Ruangan> {
        const ruangan = await this.prisma.ruangan.findUnique({
            where: { id },
            include: {
                Jadwal: true,
            },
        });
        if (!ruangan) {
            throw new NotFoundException('Ruangan not found');
        }
        return ruangan;
    }

    async update(id: number, updateRuanganDto: UpdateRuanganDto): Promise<Ruangan> {
        // Check if ruangan exists
        await this.findOne(id);

        // Check if nama is being updated and already exists
        if (updateRuanganDto.nama) {
            const existingRuangan = await this.prisma.ruangan.findFirst({
                where: { nama: updateRuanganDto.nama },
            });
            if (existingRuangan && existingRuangan.id !== id) {
                throw new ConflictException('Ruangan with this nama already exists');
            }
        }

        return this.prisma.ruangan.update({
            where: { id },
            data: updateRuanganDto,
            include: {
                Jadwal: true,
            },
        });
    }

    async remove(id: number): Promise<Ruangan> {
        // Check if ruangan exists
        await this.findOne(id);

        return this.prisma.ruangan.delete({
            where: { id },
            include: {
                Jadwal: true,
            },
        });
    }
}