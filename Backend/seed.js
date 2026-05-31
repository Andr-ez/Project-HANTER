// Backend/seed.js
// Ejecutar desde la carpeta Backend/:  node seed.js

import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─── 1. ROLES ───────────────────────────────────────────────
  await prisma.rol.upsert({ where: { id_rol: 1 }, update: {}, create: { id_rol: 1, nombre_rol: "Administrador" } });
  await prisma.rol.upsert({ where: { id_rol: 2 }, update: {}, create: { id_rol: 2, nombre_rol: "Supervisor" } });
  await prisma.rol.upsert({ where: { id_rol: 3 }, update: {}, create: { id_rol: 3, nombre_rol: "Usuario" } });
  console.log("✅ Roles insertados");

  // ─── 2. EMPLEADOS ───────────────────────────────────────────
  const empleado1 = await prisma.empleado.upsert({
    where: { correo: "jorge@hanter.com" },
    update: {},
    create: {
      nombre: "Jorge Andres",
      apellido: "Velasquez",
      correo: "jorge@hanter.com",
      documento: "123456789",
      celular: "3004754145",
      foto_perfil: "fotos_perfil/fotos_perfil_1779962214269.png",
      id_rol: 1,
    },
  });

  const empleado2 = await prisma.empleado.upsert({
    where: { correo: "jaime@hanter.com" },
    update: {},
    create: {
      nombre: "Jaime",
      apellido: "Marin",
      correo: "jaime@hanter.com",
      documento: "12341243531",
      celular: "243546323534534",
      id_rol: 2,
    },
  });

  const empleado3 = await prisma.empleado.upsert({
    where: { correo: "rosa@hanter.com" },
    update: {},
    create: {
      nombre: "Rosa Elizabeth",
      apellido: "Castillo",
      correo: "rosa@hanter.com",
      documento: "55123126232",
      celular: "231452566423",
      id_rol: 3,
    },
  });
  console.log("✅ Empleados insertados");

  // ─── 3. LIMPIAR usuarios viejos vinculados a estos empleados ─
  await prisma.usuario.deleteMany({
    where: {
      id_empleado: {
        in: [empleado1.id_empleado, empleado2.id_empleado, empleado3.id_empleado]
      }
    }
  });

  // ─── 4. USUARIOS ────────────────────────────────────────────
  const hash1234 = await bcrypt.hash("1234", 10);

  await prisma.usuario.create({
    data: {
      nombre_usuario: "jorge",
      password_hash: hash1234,
      id_empleado: empleado1.id_empleado,
    },
  });

  await prisma.usuario.create({
    data: {
      nombre_usuario: "jaime",
      password_hash: hash1234,
      id_empleado: empleado2.id_empleado,
    },
  });

  await prisma.usuario.create({
    data: {
      nombre_usuario: "rosa",
      password_hash: hash1234,
      id_empleado: empleado3.id_empleado,
    },
  });

  console.log("✅ Usuarios insertados");
  console.log("");
  console.log("📋 Credenciales:");
  console.log("   jorge  | pass: 1234  → Administrador");
  console.log("   jaime  | pass: 1234  → Supervisor");
  console.log("   rosa   | pass: 1234  → Usuario");
  console.log("");
  console.log("🎉 Seed completado.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });