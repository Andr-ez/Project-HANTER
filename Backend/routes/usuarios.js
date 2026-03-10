import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verificarToken } from '../middlewares/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Obtener perfil del usuario autenticado
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.usuario.id_usuario },
      include: { rol: true, empleado: true }
    });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Crear usuario (signup)
router.post('/signup', async (req, res) => {
  const { nombre_usuario, password, id_rol, id_empleado } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre_usuario,
        password_hash: hashedPassword,
        id_rol,
        id_empleado
      }
    });

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear usuario', detalle: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { nombre_usuario, password } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { nombre_usuario }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, usuario.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en login', detalle: error.message });
  }
});

export default router;
