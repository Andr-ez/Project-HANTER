import express from 'express';
import  {PrismaClient}  from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// ============================================================
// POST /roles
// Crea un nuevo rol (ej: "Administrador", "Usuario").
// ============================================================
router.post('/', async (req, res) => {
  const { nombre_rol } = req.body;

  try {
    const rol = await prisma.rol.create({
      data: { nombre_rol }
    });
    res.json(rol);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear rol' });
  }
});

// ============================================================
// GET /roles
// Lista todos los roles existentes.
// ============================================================
router.get('/', async (req, res) => {
  try {
    const roles = await prisma.rol.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar roles' });
  }
});

export default router;