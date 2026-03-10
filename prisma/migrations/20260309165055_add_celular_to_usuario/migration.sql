/*
  Warnings:

  - Added the required column `celular` to the `Empleado` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Empleado" (
    "id_empleado" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT,
    "documento" INTEGER NOT NULL,
    "celular" TEXT NOT NULL,
    "fecha_ingreso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Empleado" ("apellido", "correo", "documento", "fecha_ingreso", "id_empleado", "nombre") SELECT "apellido", "correo", "documento", "fecha_ingreso", "id_empleado", "nombre" FROM "Empleado";
DROP TABLE "Empleado";
ALTER TABLE "new_Empleado" RENAME TO "Empleado";
CREATE UNIQUE INDEX "Empleado_correo_key" ON "Empleado"("correo");
CREATE UNIQUE INDEX "Empleado_documento_key" ON "Empleado"("documento");
CREATE UNIQUE INDEX "Empleado_celular_key" ON "Empleado"("celular");
PRAGMA foreign_key_check("Empleado");
PRAGMA foreign_keys=ON;
