import { IsNotEmpty, IsString, IsInt, Matches, IsOptional } from 'class-validator';

export class CreateJadwalDto {
    @IsNotEmpty()
    @IsString()
    hari: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'jamMulai must be in HH:MM format' })
    jamMulai: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'jamSelesai must be in HH:MM format' })
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