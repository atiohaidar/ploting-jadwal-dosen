import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProdiDto {
    @ApiProperty({
        description: 'Nama Program Studi',
        example: 'Teknik Informatika',
    })
    @IsString()
    namaProdi: string;
}