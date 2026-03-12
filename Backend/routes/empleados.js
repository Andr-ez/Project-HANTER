import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Crear empleado
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, correo, documento, celular, id_rol } = req.body;

    // Validar que el rol existe
    const rol = await prisma.rol.findUnique({
      where: { id_rol: Number(id_rol) }
    });

    if (!rol) {
      return res.status(400).json({ error: 'Rol no encontrado' });
    }

    // Crear empleado conectado al rol
    const empleado = await prisma.empleado.create({
      data: {
        nombre,
        apellido,
        correo,
        documento,
        celular,
        rol: { connect: { id_rol: Number(id_rol) } }
      },
      include: { rol: true } // incluir el rol en la respuesta
    });

    res.json(empleado);
  } catch (error) {
    console.error("Error al crear empleado:", error);
    res.status(500).json({ error: 'Error al crear empleado', detalle: error.message });
  }
});


// Listar empleados
router.get('/', async (req, res) => {
  try {
    const empleados = await prisma.empleado.findMany({
      include: { rol: true }
    });
    res.json(empleados);
  } catch (error) {
    console.error("Error al listar empleados:", error);
    res.status(500).json({ error: 'Error al listar empleados', detalle: error.message });
  }
});


export default router;
