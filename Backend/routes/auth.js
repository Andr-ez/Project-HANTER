import express from 'express';
import { PrismaClient } from '@prisma/client';
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

export default router;