import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMataKuliahDto {
    @ApiPropertyOptional({
        description: 'Kode Mata Kuliah',
        example: 'TI102',
    })
    @IsOptional()
    @IsString()
    kodeMk?: string;

    @ApiPropertyOptional({
        description: 'Nama Mata Kuliah',
        example: 'Pemrograman Lanjutan',
    })
    @IsOptional()
    @IsString()
    namaMk?: string;

    @ApiPropertyOptional({
        description: 'Jumlah SKS',
        example: 4,
    })
    @IsOptional()
    @IsInt()
    sks?: number;

    @ApiPropertyOptional({
        description: 'Program Studi ID',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    prodiId?: number;
}