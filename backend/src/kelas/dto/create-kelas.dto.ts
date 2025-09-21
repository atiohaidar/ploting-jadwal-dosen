import { IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKelasDto {
    @ApiProperty({
        description: 'Nama Kelas',
        example: 'TI-3A',
    })
    @IsString()
    namaKelas: string;

    @ApiProperty({
        description: 'Angkatan',
        example: 2023,
    })
    @IsInt()
    angkatan: number;

    @ApiProperty({
        description: 'Program Studi ID',
        example: 1,
    })
    @IsInt()
    prodiId: number;
}