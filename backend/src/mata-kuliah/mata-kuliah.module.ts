import { Module } from '@nestjs/common';
import { MataKuliahService } from './mata-kuliah.service';
import { MataKuliahController } from './mata-kuliah.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [MataKuliahController],
    providers: [MataKuliahService],
    exports: [MataKuliahService],
})
export class MataKuliahModule { }