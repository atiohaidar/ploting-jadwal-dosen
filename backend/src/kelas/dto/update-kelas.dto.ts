import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateKelasDto {
    @ApiPropertyOptional({
        description: 'Nama Kelas',
        example: 'TI-3B',
    })
    @IsOptional()
    @IsString()
    namaKelas?: string;

    @ApiPropertyOptional({
        description: 'Angkatan',
        example: 2024,
    })
    @IsOptional()
    @IsInt()
    angkatan?: number;

    @ApiPropertyOptional({
        description: 'Program Studi ID',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    prodiId?: number;
}