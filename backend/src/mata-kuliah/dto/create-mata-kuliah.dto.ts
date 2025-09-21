import { IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMataKuliahDto {
    @ApiProperty({
        description: 'Kode Mata Kuliah',
        example: 'TI101',
    })
    @IsString()
    kodeMk: string;

    @ApiProperty({
        description: 'Nama Mata Kuliah',
        example: 'Pemrograman Dasar',
    })
    @IsString()
    namaMk: string;

    @ApiProperty({
        description: 'Jumlah SKS',
        example: 3,
    })
    @IsInt()
    sks: number;

    @ApiProperty({
        description: 'Program Studi ID',
        example: 1,
    })
    @IsInt()
    prodiId: number;
}