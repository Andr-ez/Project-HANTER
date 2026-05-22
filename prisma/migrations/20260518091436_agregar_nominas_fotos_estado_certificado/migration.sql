/*
  Warnings:

  - Added the required column `titulo` to the `Certificado` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Nomina" (
    "id_nomina" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "url_archivo" TEXT NOT NULL,
    "fecha_carga" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_empleado" INTEGER NOT NULL,
    CONSTRAINT "Nomina_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Certificado" (
    "id_certificado" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fecha_solicitud" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_emision" DATETIME,
    "url_archivo" TEXT NOT NULL,
    "id_empleado" INTEGER NOT NULL,
    "id_usuario_emisor" INTEGER,
    CONSTRAINT "Certificado_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificado_id_usuario_emisor_fkey" FOREIGN KEY ("id_usuario_emisor") REFERENCES "Usuario" ("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Certificado" ("fecha_emision", "id_certificado", "id_empleado", "id_usuario_emisor", "url_archivo") SELECT "fecha_emision", "id_certificado", "id_empleado", "id_usuario_emisor", "url_archivo" FROM "Certificado";
DROP TABLE "Certificado";
ALTER TABLE "new_Certificado" RENAME TO "Certificado";
CREATE TABLE "new_Empleado" (
    "id_empleado" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "fecha_ingreso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "foto_perfil" TEXT,
    "id_rol" INTEGER NOT NULL,
    CONSTRAINT "Empleado_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "Rol" ("id_rol") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Empleado" ("apellido", "celular", "correo", "documento", "fecha_ingreso", "id_empleado", "id_rol", "nombre") SELECT "apellido", "celular", "correo", "documento", "fecha_ingreso", "id_empleado", "id_rol", "nombre" FROM "Empleado";
DROP TABLE "Empleado";
ALTER TABLE "new_Empleado" RENAME TO "Empleado";
CREATE UNIQUE INDEX "Empleado_correo_key" ON "Empleado"("correo");
CREATE UNIQUE INDEX "Empleado_documento_key" ON "Empleado"("documento");
CREATE UNIQUE INDEX "Empleado_celular_key" ON "Empleado"("celular");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
