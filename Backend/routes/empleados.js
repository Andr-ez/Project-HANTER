import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Crear empleado
router.post('/', async (req, res) => {
  const { nombre, apellido, correo, documento, celular } = req.body;

  try {
    const empleado = await prisma.empleado.create({
      data: { nombre, apellido, correo, documento, celular }
    });
    res.json(empleado);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear empleado' });
  }
});

// Listar empleados
router.get('/', async (req, res) => {
  const empleados = await prisma.empleado.findMany();
  res.json(empleados);
});

export default router;
