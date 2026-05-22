/*
  Warnings:

  - Added the required column `fecha_cert` to the `Certificado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institucion` to the `Certificado` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Notificacion" (
    "id_notificacion" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL DEFAULT 'general',
    "titulo" TEXT NOT NULL DEFAULT 'Notificación',
    "mensaje" TEXT NOT NULL,
    "ruta_destino" TEXT,
    "etiqueta_boton" TEXT,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_empleado" INTEGER NOT NULL,
    CONSTRAINT "Notificacion_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Certificado" (
    "id_certificado" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "fecha_cert" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fecha_solicitud" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_emision" DATETIME,
    "url_archivo" TEXT NOT NULL,
    "id_empleado" INTEGER NOT NULL,
    "id_usuario_emisor" INTEGER,
    CONSTRAINT "Certificado_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificado_id_usuario_emisor_fkey" FOREIGN KEY ("id_usuario_emisor") REFERENCES "Usuario" ("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Certificado" ("estado", "fecha_emision", "fecha_solicitud", "id_certificado", "id_empleado", "id_usuario_emisor", "titulo", "url_archivo") SELECT "estado", "fecha_emision", "fecha_solicitud", "id_certificado", "id_empleado", "id_usuario_emisor", "titulo", "url_archivo" FROM "Certificado";
DROP TABLE "Certificado";
ALTER TABLE "new_Certificado" RENAME TO "Certificado";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
