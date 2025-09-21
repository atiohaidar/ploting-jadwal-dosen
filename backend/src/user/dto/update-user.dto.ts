import { IsEnum, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role, Gender } from '@prisma/client';

export class UpdateUserDto {
    @ApiPropertyOptional({
        description: 'User full name',
        example: 'John Doe Updated',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        description: 'User role',
        enum: Role,
        example: Role.KAPRODI,
    })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @ApiPropertyOptional({
        description: 'User gender',
        enum: Gender,
        example: Gender.FEMALE,
    })
    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @ApiPropertyOptional({
        description: 'NIP for lecturers',
        example: '123456789',
    })
    @IsOptional()
    @IsString()
    nip?: string;

    @ApiPropertyOptional({
        description: 'NIM for students',
        example: '123456789',
    })
    @IsOptional()
    @IsString()
    nim?: string;

    @ApiPropertyOptional({
        description: 'Program Studi ID',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    prodiId?: number;
}