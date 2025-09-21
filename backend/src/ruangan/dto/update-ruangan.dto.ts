import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRuanganDto {
    @ApiPropertyOptional({
        description: 'Nama Ruangan',
        example: 'Lab Komputer 2',
    })
    @IsOptional()
    @IsString()
    nama?: string;

    @ApiPropertyOptional({
        description: 'Kapasitas Ruangan',
        example: 40,
    })
    @IsOptional()
    @IsInt()
    kapasitas?: number;

    @ApiPropertyOptional({
        description: 'Lokasi Ruangan',
        example: 'Gedung B Lantai 3',
    })
    @IsOptional()
    @IsString()
    lokasi?: string;
}