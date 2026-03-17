import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verificarToken } from '../middlewares/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Obtener perfil del usuario autenticado, usa su token
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.usuario.id_usuario },
      include: {
        empleado: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener perfil', detalle: error.message });
  }
});


// Crear usuario (signup)
router.post('/signup', async (req, res) => {
  const { nombre_usuario, password, confirm_password, correo } = req.body;

  try {
//confirma que coincidan las contraseñas
    if (password !== confirm_password) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

// Busca el empleado por correo para asociar el usuario
     const empleado = await prisma.empleado.findUnique({
      where: { correo }
    });

    if (!empleado) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
//Valida que ese usuario ya exista para ese empleado
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id_empleado: empleado.id_empleado }
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: "Ya existe un usuario para este empleado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

// Crea el usuario asociado al empleado en la DB Usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre_usuario,
        password_hash: hashedPassword,
        id_empleado: empleado.id_empleado
      }
    });

    res.json({
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      id_empleado: usuario.id_empleado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear usuario', detalle: error.message });
  }
});

// Login que nos genera un token JWT con la info del usuario y su rol para usar en el frontend
router.post('/login', async (req, res) => {
  const { nombre_usuario, password } = req.body;

  try {
    let usuario = await prisma.usuario.findUnique({
      where: { nombre_usuario },
      include: { empleado: { include: { rol: true } } }
    });

    // Si no encontró usuario por nombre_usuario, probar como correo
    if (!usuario && nombre_usuario.includes("@")) {
      const empleado = await prisma.empleado.findUnique({
        where: { correo: nombre_usuario },
        include: { rol: true }
      });

      if (!empleado) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }

      usuario = await prisma.usuario.findFirst({
        where: { id_empleado: empleado.id_empleado },
        include: { empleado: { include: { rol: true } } }
      });
    }

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, usuario.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario,
        id_empleado: usuario.id_empleado,
        rol: usuario.empleado.rol.nombre_rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.empleado.correo,
        rol: usuario.empleado.rol.nombre_rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en login', detalle: error.message });
  }
});

export default router;
