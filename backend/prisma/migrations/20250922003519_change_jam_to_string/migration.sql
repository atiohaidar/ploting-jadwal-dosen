-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Jadwal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hari" TEXT NOT NULL,
    "jamMulai" TEXT NOT NULL,
    "jamSelesai" TEXT NOT NULL,
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
INSERT INTO "new_Jadwal" ("dosenId", "hari", "id", "jamMulai", "jamSelesai", "kelasId", "mataKuliahId", "ruanganId", "status") SELECT "dosenId", "hari", "id", "jamMulai", "jamSelesai", "kelasId", "mataKuliahId", "ruanganId", "status" FROM "Jadwal";
DROP TABLE "Jadwal";
ALTER TABLE "new_Jadwal" RENAME TO "Jadwal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
