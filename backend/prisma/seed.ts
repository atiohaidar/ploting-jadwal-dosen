import { PrismaClient, Role, Gender, PermintaanStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Program Studi (Prodi)
  console.log('📚 Creating Program Studi...');
  const prodiInformatika = await prisma.prodi.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      namaProdi: 'Teknik Informatika',
    },
  });

  const prodiSistemInformasi = await prisma.prodi.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      namaProdi: 'Sistem Informasi',
    },
  });

  const prodiTeknikElektro = await prisma.prodi.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      namaProdi: 'Teknik Elektro',
    },
  });

  // Create Mata Kuliah (Courses)
  console.log('📖 Creating Mata Kuliah...');
  const mataKuliahData = [
    { kodeMk: 'TI101', namaMk: 'Algoritma dan Pemrograman', sks: 3, prodiId: prodiInformatika.id },
    { kodeMk: 'TI102', namaMk: 'Struktur Data', sks: 3, prodiId: prodiInformatika.id },
    { kodeMk: 'TI103', namaMk: 'Basis Data', sks: 3, prodiId: prodiInformatika.id },
    { kodeMk: 'TI104', namaMk: 'Pemrograman Web', sks: 3, prodiId: prodiInformatika.id },
    { kodeMk: 'TI105', namaMk: 'Jaringan Komputer', sks: 3, prodiId: prodiInformatika.id },
    { kodeMk: 'SI101', namaMk: 'Sistem Informasi', sks: 3, prodiId: prodiSistemInformasi.id },
    { kodeMk: 'SI102', namaMk: 'Analisis Sistem', sks: 3, prodiId: prodiSistemInformasi.id },
    { kodeMk: 'TE101', namaMk: 'Dasar Teknik Elektro', sks: 3, prodiId: prodiTeknikElektro.id },
    { kodeMk: 'TE102', namaMk: 'Sistem Tenaga Listrik', sks: 3, prodiId: prodiTeknikElektro.id },
  ];

  for (const mk of mataKuliahData) {
    await prisma.mataKuliah.upsert({
      where: { kodeMk: mk.kodeMk },
      update: {},
      create: mk,
    });
  }

  // Create Kelas (Classes)
  console.log('🏫 Creating Kelas...');
  const kelasData = [
    { namaKelas: 'TI-2021-A', angkatan: 2021, prodiId: prodiInformatika.id },
    { namaKelas: 'TI-2021-B', angkatan: 2021, prodiId: prodiInformatika.id },
    { namaKelas: 'TI-2022-A', angkatan: 2022, prodiId: prodiInformatika.id },
    { namaKelas: 'SI-2021-A', angkatan: 2021, prodiId: prodiSistemInformasi.id },
    { namaKelas: 'SI-2022-A', angkatan: 2022, prodiId: prodiSistemInformasi.id },
    { namaKelas: 'TE-2021-A', angkatan: 2021, prodiId: prodiTeknikElektro.id },
  ];

  for (const kelas of kelasData) {
    await prisma.kelas.upsert({
      where: { namaKelas: kelas.namaKelas },
      update: {},
      create: kelas,
    });
  }

  // Create Ruangan (Rooms)
  console.log('🏢 Creating Ruangan...');
  const ruanganData = [
    { nama: 'Lab. Komputer 1', kapasitas: 30, lokasi: 'Gedung A Lantai 2' },
    { nama: 'Lab. Komputer 2', kapasitas: 30, lokasi: 'Gedung A Lantai 3' },
    { nama: 'Lab. Elektro', kapasitas: 25, lokasi: 'Gedung B Lantai 1' },
    { nama: 'Ruang Kuliah 101', kapasitas: 50, lokasi: 'Gedung A Lantai 1' },
    { nama: 'Ruang Kuliah 102', kapasitas: 50, lokasi: 'Gedung A Lantai 1' },
    { nama: 'Ruang Kuliah 201', kapasitas: 40, lokasi: 'Gedung B Lantai 2' },
    { nama: 'Ruang Kuliah 202', kapasitas: 40, lokasi: 'Gedung B Lantai 2' },
  ];

  for (const ruangan of ruanganData) {
    await prisma.ruangan.upsert({
      where: { nama: ruangan.nama },
      update: {},
      create: ruangan,
    });
  }

  // Create Users
  console.log('👥 Creating Users...');

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@university.ac.id' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@university.ac.id',
      password: hashedPassword,
      role: Role.ADMIN,
      gender: Gender.MALE,
    },
  });

  // Kaprodi users
  const kaprodiTI = await prisma.user.upsert({
    where: { email: 'kaprodi.ti@university.ac.id' },
    update: {},
    create: {
      name: 'Dr. Ahmad Surya, S.Kom., M.Kom.',
      email: 'kaprodi.ti@university.ac.id',
      password: hashedPassword,
      role: Role.KAPRODI,
      gender: Gender.MALE,
      prodiId: prodiInformatika.id,
    },
  });

  const kaprodiSI = await prisma.user.upsert({
    where: { email: 'kaprodi.si@university.ac.id' },
    update: {},
    create: {
      name: 'Dr. Siti Nurhaliza, S.Kom., M.TI.',
      email: 'kaprodi.si@university.ac.id',
      password: hashedPassword,
      role: Role.KAPRODI,
      gender: Gender.FEMALE,
      prodiId: prodiSistemInformasi.id,
    },
  });

  // Dosen users
  const dosenData = [
    {
      name: 'Prof. Dr. Budi Santoso, S.Kom., M.Kom.',
      email: 'budi.santoso@university.ac.id',
      nip: '198001011234567890',
      prodiId: prodiInformatika.id,
      gender: Gender.MALE,
    },
    {
      name: 'Dr. Maya Sari, S.Kom., M.TI.',
      email: 'maya.sari@university.ac.id',
      nip: '198512151234567891',
      prodiId: prodiInformatika.id,
      gender: Gender.FEMALE,
    },
    {
      name: 'Ir. Hendro Wicaksono, M.T.',
      email: 'hendro.wicaksono@university.ac.id',
      nip: '197803221234567892',
      prodiId: prodiTeknikElektro.id,
      gender: Gender.MALE,
    },
    {
      name: 'Dr. Ratna Dewi, S.T., M.T.',
      email: 'ratna.dewi@university.ac.id',
      nip: '198206101234567893',
      prodiId: prodiTeknikElektro.id,
      gender: Gender.FEMALE,
    },
    {
      name: 'Drs. Agus Priyanto, M.Kom.',
      email: 'agus.priyanto@university.ac.id',
      nip: '197512051234567894',
      prodiId: prodiSistemInformasi.id,
      gender: Gender.MALE,
    },
  ];

  const dosenUsers: any[] = [];
  for (const dosen of dosenData) {
    const user = await prisma.user.upsert({
      where: { email: dosen.email },
      update: {},
      create: {
        ...dosen,
        password: hashedPassword,
        role: Role.DOSEN,
      },
    });
    dosenUsers.push(user);
  }

  // Mahasiswa users
  const mahasiswaData = [
    {
      name: 'Ahmad Fauzi',
      email: 'ahmad.fauzi@student.university.ac.id',
      nim: '2021001',
      prodiId: prodiInformatika.id,
      gender: Gender.MALE,
    },
    {
      name: 'Siti Aminah',
      email: 'siti.aminah@student.university.ac.id',
      nim: '2021002',
      prodiId: prodiInformatika.id,
      gender: Gender.FEMALE,
    },
    {
      name: 'Rudi Hartono',
      email: 'rudi.hartono@student.university.ac.id',
      nim: '2021003',
      prodiId: prodiSistemInformasi.id,
      gender: Gender.MALE,
    },
    {
      name: 'Maya Putri',
      email: 'maya.putri@student.university.ac.id',
      nim: '2021004',
      prodiId: prodiSistemInformasi.id,
      gender: Gender.FEMALE,
    },
    {
      name: 'Budi Santosa',
      email: 'budi.santosa@student.university.ac.id',
      nim: '2021005',
      prodiId: prodiTeknikElektro.id,
      gender: Gender.MALE,
    },
    {
      name: 'Linda Sari',
      email: 'linda.sari@student.university.ac.id',
      nim: '2021006',
      prodiId: prodiTeknikElektro.id,
      gender: Gender.FEMALE,
    },
  ];

  for (const mahasiswa of mahasiswaData) {
    await prisma.user.upsert({
      where: { email: mahasiswa.email },
      update: {},
      create: {
        ...mahasiswa,
        password: hashedPassword,
        role: Role.MAHASISWA,
      },
    });
  }

  // Create some sample Jadwal (Schedules)
  console.log('📅 Creating Sample Jadwal...');

  const mataKuliahList = await prisma.mataKuliah.findMany();
  const kelasList = await prisma.kelas.findMany();
  const ruanganList = await prisma.ruangan.findMany();

  const jadwalData = [
    {
      hari: 'Senin',
      jamMulai: '08:00',
      jamSelesai: '10:30',
      mataKuliahId: mataKuliahList[0].id, // Algoritma dan Pemrograman
      dosenId: dosenUsers[0].id, // Budi Santoso
      kelasId: kelasList[0].id, // TI-2021-A
      ruanganId: ruanganList[0].id, // Lab. Komputer 1
    },
    {
      hari: 'Senin',
      jamMulai: '10:45',
      jamSelesai: '13:15',
      mataKuliahId: mataKuliahList[1].id, // Struktur Data
      dosenId: dosenUsers[1].id, // Maya Sari
      kelasId: kelasList[0].id, // TI-2021-A
      ruanganId: ruanganList[1].id, // Lab. Komputer 2
    },
    {
      hari: 'Selasa',
      jamMulai: '08:00',
      jamSelesai: '10:30',
      mataKuliahId: mataKuliahList[5].id, // Sistem Informasi
      dosenId: dosenUsers[4].id, // Agus Priyanto
      kelasId: kelasList[3].id, // SI-2021-A
      ruanganId: ruanganList[3].id, // Ruang Kuliah 101
    },
    {
      hari: 'Rabu',
      jamMulai: '08:00',
      jamSelesai: '10:30',
      mataKuliahId: mataKuliahList[7].id, // Dasar Teknik Elektro
      dosenId: dosenUsers[2].id, // Hendro Wicaksono
      kelasId: kelasList[5].id, // TE-2021-A
      ruanganId: ruanganList[2].id, // Lab. Elektro
    },
  ];

  for (const jadwal of jadwalData) {
    await prisma.jadwal.create({
      data: jadwal,
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Seeded Data Summary:');
  console.log(`   • ${await prisma.prodi.count()} Program Studi`);
  console.log(`   • ${await prisma.mataKuliah.count()} Mata Kuliah`);
  console.log(`   • ${await prisma.kelas.count()} Kelas`);
  console.log(`   • ${await prisma.ruangan.count()} Ruangan`);
  console.log(`   • ${await prisma.user.count()} Users`);
  console.log(`   • ${await prisma.jadwal.count()} Jadwal`);
  console.log('\n🔐 Default login credentials:');
  console.log('   Admin: admin@university.ac.id / password123');
  console.log('   Kaprodi TI: kaprodi.ti@university.ac.id / password123');
  console.log('   Kaprodi SI: kaprodi.si@university.ac.id / password123');
  console.log('   All other users: [email] / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
