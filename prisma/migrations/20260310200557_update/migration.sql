/*
  Warnings:

  - Made the column `correo` on table `Empleado` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Empleado" (
    "id_empleado" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "documento" INTEGER NOT NULL,
    "celular" TEXT NOT NULL,
    "fecha_ingreso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Empleado" ("apellido", "celular", "correo", "documento", "fecha_ingreso", "id_empleado", "nombre") SELECT "apellido", "celular", "correo", "documento", "fecha_ingreso", "id_empleado", "nombre" FROM "Empleado";
DROP TABLE "Empleado";
ALTER TABLE "new_Empleado" RENAME TO "Empleado";
CREATE UNIQUE INDEX "Empleado_correo_key" ON "Empleado"("correo");
CREATE UNIQUE INDEX "Empleado_documento_key" ON "Empleado"("documento");
CREATE UNIQUE INDEX "Empleado_celular_key" ON "Empleado"("celular");
PRAGMA foreign_key_check("Empleado");
PRAGMA foreign_keys=ON;
