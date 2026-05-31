import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verificarToken } from '../middlewares/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// ============================================================
// GET /auth/sesion
// Con el token del usuario, devuelve sus datos básicos y la lista
// de botones de navegación que le corresponden según su rol.
// Lo consume el frontend al cargar para armar header y sidebar.
// ============================================================
router.get('/sesion', verificarToken, async (req, res) => {
  try {
    // 1. Buscar usuario con su empleado y rol en la BD
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.usuario.id_usuario },
      include: {
        empleado: {
          include: { rol: true }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const rol = usuario.empleado.rol.nombre_rol;

    // 2. Armar botones según rol
    // Menú base: lo ve cualquier empleado.
    const botonesBase = [
      { id: 1, nombre: 'INICIO',         link: '/100', posicion: ['header', 'sidebar'], hijos: [] },
      { id: 2, nombre: 'CERTIFICADOS',   link: '/101', posicion: ['header', 'sidebar'], hijos: [] },
      { id: 3, nombre: 'NOMINA',         link: '/104', posicion: ['header', 'sidebar'], hijos: [] },
      { id: 4, nombre: 'CAPACITACIONES', link: '/125', posicion: ['header', 'sidebar'], hijos: [] },
    ];

    // Menú admin: base + opciones exclusivas de gestión.
    const botonesAdmin = [
      ...botonesBase,
      { id: 8, nombre: 'GESTIÓN DE USUARIOS', link: '/150-A', posicion: ['sidebar'], hijos: [] },
    ];

    // Se elige el menú según el rol del usuario.
    const botones = (rol === 'Administrador' || rol === 'Supervisor')
      ? botonesAdmin
      : botonesBase;

    // 3. Responder con la estructura que espera el frontend
    res.json({
      usuario: {
        nombre: usuario.empleado.nombre,
        apellido: usuario.empleado.apellido,
        foto:   usuario.empleado.foto_perfil
          ? `http://localhost:3000/uploads/${usuario.empleado.foto_perfil}`
          : null,
        rol:    rol
      },
      botones
    });

  } catch (error) {
    console.error('Error en /auth/sesion:', error);
    res.status(500).json({ error: 'Error al obtener sesión', detalle: error.message });
  }
});

// ============================================================
// POST /auth/login
// Inicio de sesión. Acepta nombre de usuario o correo.
// Si las credenciales son válidas, devuelve un token JWT
// (con id_usuario, id_empleado y rol) y los datos del usuario.
// ============================================================
router.post('/login', async (req, res) => {
  const { nombre_usuario, password } = req.body;

  try {
    // Intento 1: buscar la cuenta por nombre de usuario.
    let usuario = await prisma.usuario.findUnique({
      where: { nombre_usuario },
      include: { empleado: { include: { rol: true } } }
    });

    // Intento 2: si no se encontró y el texto parece un correo,
    // se busca el empleado por correo y luego su cuenta.
    if (!usuario && nombre_usuario.includes('@')) {
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

    // Compara la contraseña recibida contra el hash guardado.
    const validPassword = await bcrypt.compare(password, usuario.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Genera el token con los datos que el resto de la app necesita.
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario,
        id_empleado: usuario.id_empleado,
        rol: usuario.empleado.rol.nombre_rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Registra la fecha/hora del último inicio de sesión.
    await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { ultimo_login: new Date() }
    });

    res.json({
      token,
      usuario: {
        id_usuario:     usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo:         usuario.empleado.correo,
        rol:            usuario.empleado.rol.nombre_rol,
        foto_perfil:    usuario.empleado.foto_perfil
      }
    });
  } catch (error) {
    console.error('Error en /auth/login:', error);
    res.status(500).json({ error: 'Error en login', detalle: error.message });
  }
});

export default router;