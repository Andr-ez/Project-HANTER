import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verificarToken, verificarRol } from '../middlewares/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Listar usuarios
router.get(
  '/',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  async (req, res) => {
    try {
      const usuarios = await prisma.usuario.findMany({
        include: {
          empleado: {
            include: { rol: true } // incluir datos del empleado y su rol
          }
        }
      });
      res.json(usuarios);
    } catch (error) {
      console.error("Error al listar usuarios:", error);
      res.status(500).json({ error: 'Error al listar usuarios', detalle: error.message });
    }
  }
);

//eliminar usuario por ID, solo para admin y supervisor
router.delete(
  '/:id',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: id }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      await prisma.usuario.delete({
        where: { id_usuario: id }
      });

      res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      res.status(500).json({ error: 'Error al eliminar usuario', detalle: error.message });
    }
  }
);

// Editar usuario por ID
router.put(
  '/:id',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { nombre_usuario, password } = req.body;

      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: id }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      let dataUpdate = {};
      if (nombre_usuario) {
        dataUpdate.nombre_usuario = nombre_usuario.trim();
      }
      if (password) {
        if (password.length < 4) {
          return res.status(400).json({ error: "La contraseña debe tener mínimo 4 caracteres" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        dataUpdate.password_hash = hashedPassword;
      }

      const usuarioActualizado = await prisma.usuario.update({
        where: { id_usuario: id },
        data: dataUpdate
      });

      res.json(usuarioActualizado);
    } catch (error) {
      console.error("Error al editar usuario:", error);
      res.status(500).json({ error: 'Error al editar usuario', detalle: error.message });
    }
  }
);

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
