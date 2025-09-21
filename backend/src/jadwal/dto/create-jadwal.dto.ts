import { IsNotEmpty, IsString, IsInt, IsDateString, IsOptional } from 'class-validator';

export class CreateJadwalDto {
    @IsNotEmpty()
    @IsString()
    hari: string;

    @IsNotEmpty()
    @IsDateString()
    jamMulai: string;

    @IsNotEmpty()
    @IsDateString()
    jamSelesai: string;

    @IsNotEmpty()
    @IsInt()
    mataKuliahId: number;

    @IsNotEmpty()
    @IsInt()
    dosenId: number;

    @IsNotEmpty()
    @IsInt()
    kelasId: number;

    @IsNotEmpty()
    @IsInt()
    ruanganId: number;

    @IsOptional()
    @IsString()
    status?: string;
}