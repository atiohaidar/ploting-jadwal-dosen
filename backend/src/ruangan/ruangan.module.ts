import { Module } from '@nestjs/common';
import { RuanganService } from './ruangan.service';
import { RuanganController } from './ruangan.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [RuanganController],
    providers: [RuanganService],
    exports: [RuanganService],
})
export class RuanganModule { }