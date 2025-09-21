import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdiDto } from './dto/create-prodi.dto';
import { UpdateProdiDto } from './dto/update-prodi.dto';
import { Prodi } from '@prisma/client';

@Injectable()
export class ProdiService {
    constructor(private prisma: PrismaService) { }

    async create(createProdiDto: CreateProdiDto): Promise<Prodi> {
        return this.prisma.prodi.create({
            data: createProdiDto,
            include: {
                users: true,
                kelas: true,
                mataKuliah: true,
            },
        });
    }

    async findAll(): Promise<Prodi[]> {
        return this.prisma.prodi.findMany({
            include: {
                users: true,
                kelas: true,
                mataKuliah: true,
            },
        });
    }

    async findOne(id: number): Promise<Prodi> {
        const prodi = await this.prisma.prodi.findUnique({
            where: { id },
            include: {
                users: true,
                kelas: true,
                mataKuliah: true,
            },
        });
        if (!prodi) {
            throw new NotFoundException('Prodi not found');
        }
        return prodi;
    }

    async update(id: number, updateProdiDto: UpdateProdiDto): Promise<Prodi> {
        // Check if prodi exists
        await this.findOne(id);

        return this.prisma.prodi.update({
            where: { id },
            data: updateProdiDto,
            include: {
                users: true,
                kelas: true,
                mataKuliah: true,
            },
        });
    }

    async remove(id: number): Promise<Prodi> {
        // Check if prodi exists
        await this.findOne(id);

        return this.prisma.prodi.delete({
            where: { id },
            include: {
                users: true,
                kelas: true,
                mataKuliah: true,
            },
        });
    }
}