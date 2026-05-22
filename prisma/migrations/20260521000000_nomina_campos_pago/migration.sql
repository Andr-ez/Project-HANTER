-- Agrega los campos de pago a la tabla Nomina:
-- salario_base, deducciones, total_bonos, total_pago.
-- La tabla Nomina está vacía, así que los DEFAULT 0 son seguros.

PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Nomina" (
    "id_nomina"    INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mes"          INTEGER  NOT NULL,
    "anio"         INTEGER  NOT NULL,
    "salario_base" REAL     NOT NULL DEFAULT 0,
    "deducciones"  REAL     NOT NULL DEFAULT 0,
    "total_bonos"  REAL     NOT NULL DEFAULT 0,
    "total_pago"   REAL     NOT NULL DEFAULT 0,
    "url_archivo"  TEXT     NOT NULL,
    "fecha_carga"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_empleado"  INTEGER  NOT NULL,
    CONSTRAINT "Nomina_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado" ("id_empleado") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Nomina" ("id_nomina", "mes", "anio", "url_archivo", "fecha_carga", "id_empleado")
SELECT "id_nomina", "mes", "anio", "url_archivo", "fecha_carga", "id_empleado" FROM "Nomina";

DROP TABLE "Nomina";
ALTER TABLE "new_Nomina" RENAME TO "Nomina";

PRAGMA foreign_keys=ON;
