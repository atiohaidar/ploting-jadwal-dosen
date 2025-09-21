import { IsString, IsEmail, IsEnum, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, Gender } from '@prisma/client';

export class CreateUserDto {
    @ApiProperty({
        description: 'User full name',
        example: 'John Doe',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password',
        example: 'password123',
    })
    @IsString()
    password: string;

    @ApiProperty({
        description: 'User role',
        enum: Role,
        example: Role.DOSEN,
    })
    @IsEnum(Role)
    role: Role;

    @ApiPropertyOptional({
        description: 'User gender',
        enum: Gender,
        example: Gender.MALE,
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