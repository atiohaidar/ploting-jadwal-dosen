import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRuanganDto {
    @ApiProperty({
        description: 'Nama Ruangan',
        example: 'Lab Komputer 1',
    })
    @IsString()
    nama: string;

    @ApiProperty({
        description: 'Kapasitas Ruangan',
        example: 30,
    })
    @IsInt()
    kapasitas: number;

    @ApiPropertyOptional({
        description: 'Lokasi Ruangan',
        example: 'Gedung A Lantai 2',
    })
    @IsOptional()
    @IsString()
    lokasi?: string;
}