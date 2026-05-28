-- CreateTable
CREATE TABLE "Curso" (
    "id_curso" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha_inicio" DATETIME NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id_inscripcion" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fecha_solicitud" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_decision" DATETIME,
    "id_empleado" INTEGER NOT NULL,
    "id_curso" INTEGER NOT NULL,
    CONSTRAINT "Inscripcion_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Inscripcion_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "Curso" ("id_curso") ON DELETE CASCADE ON UPDATE CASCADE
);
