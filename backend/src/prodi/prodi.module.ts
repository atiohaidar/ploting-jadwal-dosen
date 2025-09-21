import { Module } from '@nestjs/common';
import { ProdiService } from './prodi.service';
import { ProdiController } from './prodi.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ProdiController],
    providers: [ProdiService],
    exports: [ProdiService],
})
export class ProdiModule { }