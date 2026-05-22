import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verificarToken } from '../middlewares/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET /notificaciones
// Devuelve las notificaciones del empleado autenticado (más recientes primero)
router.get('/', verificarToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.usuario.id_usuario }
    });

    const notificaciones = await prisma.notificacion.findMany({
      where: { id_empleado: usuario.id_empleado },
      orderBy: { fecha_creacion: 'desc' }
    });

    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones.', detalle: error.message });
  }
});

// PATCH /notificaciones/:id/leer
// Marca una notificación como leída
router.patch('/:id/leer', verificarToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.notificacion.update({
      where: { id_notificacion: id },
      data: { leida: true }
    });
    res.json({ mensaje: 'Notificación marcada como leída.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar notificación.', detalle: error.message });
  }
});

// PATCH /notificaciones/leer-todas
// Marca todas las notificaciones del usuario como leídas
router.patch('/leer-todas', verificarToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.usuario.id_usuario }
    });

    await prisma.notificacion.updateMany({
      where: { id_empleado: usuario.id_empleado, leida: false },
      data: { leida: true }
    });

    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar notificaciones.', detalle: error.message });
  }
});

export default router;