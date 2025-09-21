import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProdiDto {
    @ApiPropertyOptional({
        description: 'Nama Program Studi',
        example: 'Teknik Informatika Updated',
    })
    @IsOptional()
    @IsString()
    namaProdi?: string;
}