import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class BulkCreateUserDto {
    @ApiProperty({
        description: 'Array of users to create',
        type: [CreateUserDto],
        example: [
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'password123',
                role: 'DOSEN',
                nip: '123456789',
            },
            {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                password: 'password123',
                role: 'MAHASISWA',
                nim: '987654321',
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateUserDto)
    users: CreateUserDto[];
}