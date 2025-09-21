/*
  Warnings:

  - A unique constraint covering the columns `[namaKelas]` on the table `Kelas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nama]` on the table `Ruangan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Kelas_namaKelas_key" ON "Kelas"("namaKelas");

-- CreateIndex
CREATE UNIQUE INDEX "Ruangan_nama_key" ON "Ruangan"("nama");
