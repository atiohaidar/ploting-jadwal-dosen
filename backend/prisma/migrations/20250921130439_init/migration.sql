-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "nip" TEXT,
    "nim" TEXT,
    "prodiId" INTEGER,
    CONSTRAINT "User_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prodi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "namaProdi" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MataKuliah" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kodeMk" TEXT NOT NULL,
    "namaMk" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "prodiId" INTEGER NOT NULL,
    CONSTRAINT "MataKuliah_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Kelas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "namaKelas" TEXT NOT NULL,
    "angkatan" INTEGER NOT NULL,
    "prodiId" INTEGER NOT NULL,
    CONSTRAINT "Kelas_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ruangan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "kapasitas" INTEGER NOT NULL,
    "lokasi" TEXT
);

-- CreateTable
CREATE TABLE "Jadwal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hari" TEXT NOT NULL,
    "jamMulai" DATETIME NOT NULL,
    "jamSelesai" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "mataKuliahId" INTEGER NOT NULL,
    "dosenId" INTEGER NOT NULL,
    "kelasId" INTEGER NOT NULL,
    "ruanganId" INTEGER NOT NULL,
    CONSTRAINT "Jadwal_mataKuliahId_fkey" FOREIGN KEY ("mataKuliahId") REFERENCES "MataKuliah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Jadwal_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Jadwal_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Jadwal_ruanganId_fkey" FOREIGN KEY ("ruanganId") REFERENCES "Ruangan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PermintaanJadwal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alasan" TEXT NOT NULL,
    "tanggalPengajuan" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "jadwalId" INTEGER NOT NULL,
    "dosenId" INTEGER NOT NULL,
    CONSTRAINT "PermintaanJadwal_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "Jadwal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PermintaanJadwal_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MataKuliah_kodeMk_key" ON "MataKuliah"("kodeMk");
