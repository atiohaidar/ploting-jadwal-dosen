import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ProdiModule } from './prodi/prodi.module';
import { MataKuliahModule } from './mata-kuliah/mata-kuliah.module';
import { KelasModule } from './kelas/kelas.module';
import { RuanganModule } from './ruangan/ruangan.module';
import { JadwalModule } from './jadwal/jadwal.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    MonitoringModule,
    ProdiModule,
    MataKuliahModule,
    KelasModule,
    RuanganModule,
    JadwalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
