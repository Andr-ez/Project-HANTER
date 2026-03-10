-- CreateTable
CREATE TABLE "Rol" (
    "id_rol" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre_rol" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id_empleado" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT,
    "documento" INTEGER NOT NULL,
    "fecha_ingreso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre_usuario" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "id_empleado" INTEGER NOT NULL,
    CONSTRAINT "Usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "Rol" ("id_rol") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Usuario_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certificado" (
    "id_certificado" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha_emision" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url_archivo" TEXT NOT NULL,
    "id_empleado" INTEGER NOT NULL,
    "id_usuario_emisor" INTEGER NOT NULL,
    CONSTRAINT "Certificado_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificado_id_usuario_emisor_fkey" FOREIGN KEY ("id_usuario_emisor") REFERENCES "Usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmpleadoCapacitacion" (
    "id_capacitacion" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre_capacitacion" TEXT NOT NULL,
    "fecha_inicio" DATETIME NOT NULL,
    "fecha_fin" DATETIME,
    "id_empleado" INTEGER NOT NULL,
    CONSTRAINT "EmpleadoCapacitacion_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_rol_key" ON "Rol"("nombre_rol");

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_correo_key" ON "Empleado"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_documento_key" ON "Empleado"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_nombre_usuario_key" ON "Usuario"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_id_empleado_key" ON "Usuario"("id_empleado");
