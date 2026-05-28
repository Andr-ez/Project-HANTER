import express from 'express';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { verificarToken, verificarRol } from '../middlewares/auth.js';
import { subirCertificado } from '../middlewares/upload.js';

const prisma = new PrismaClient();
const router = express.Router();

// ============================================================
// POST /certificados/anadir
// El empleado sube su PDF. Se guarda con estado PENDIENTE.
// Se crea notificación para todos los administradores.
// Usa transacción atómica: si algo falla, el certificado NO
// queda en la DB y el archivo se borra del disco.
// ============================================================
router.post('/anadir', verificarToken, (req, res) => {
  // subirCertificado procesa el PDF; el flujo continúa en su callback.
  subirCertificado(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message }); // error de Multer (tipo/tamaño)
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Debes adjuntar un archivo PDF.' });
    }

    const { titulo, institucion, fecha_certificacion } = req.body;

    if (!titulo || !institucion || !fecha_certificacion) {
      fs.unlink(req.file.path, () => {}); // borra el archivo ya subido si faltan datos
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // Ruta relativa para guardar en BD (sin el prefijo uploads/).
    const rutaRelativa = req.file.path.replace(/\\/g, '/').replace('uploads/', '');

    try {
      // Se obtiene el empleado vinculado a la cuenta autenticada.
      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: req.usuario.id_usuario },
        include: { empleado: true }
      });

      if (!usuario || !usuario.empleado) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ error: 'Tu cuenta no tiene un perfil de empleado vinculado.' });
      }

      const nombreCompleto = `${usuario.empleado.nombre} ${usuario.empleado.apellido}`;

      // Destinatarios de la notificación: todos los admins/supervisores.
      const admins = await prisma.empleado.findMany({
        where: {
          rol: { nombre_rol: { in: ['Administrador', 'Supervisor'] } }
        }
      });

      // TRANSACCION ATOMICA: certificado + notificaciones juntos.
      // Si algo falla, TODO se revierte y el archivo se borra.
      const certificado = await prisma.$transaction(async (tx) => {
        const cert = await tx.certificado.create({
          data: {
            titulo,
            institucion,
            fecha_cert: fecha_certificacion,
            estado: 'PENDIENTE',
            url_archivo: rutaRelativa,
            id_empleado: usuario.id_empleado
          }
        });

        // createMany: una notificación por cada admin de una sola vez.
        if (admins.length > 0) {
          await tx.notificacion.createMany({
            data: admins.map(admin => ({
              id_empleado:    admin.id_empleado,
              tipo:           'certificado_pendiente',
              titulo:         'Nuevo certificado pendiente de revisión',
              mensaje:        `El empleado ${nombreCompleto} ha enviado el certificado "${titulo}" para revisión.`,
              ruta_destino:   '/103-A',
              etiqueta_boton: 'Revisar certificado'
            }))
          });
        }

        return cert;
      });

      res.json({
        mensaje: 'Su certificado fue enviado a revisión. Se le notificará cuando sea aprobado.',
        id_certificado: certificado.id_certificado
      });

    } catch (error) {
      fs.unlink(req.file.path, () => {}); // limpia el disco si la transacción falló
      console.error('Error al guardar certificado:', error);
      res.status(500).json({ error: 'Error al procesar el certificado.', detalle: error.message });
    }
  });
});

// ============================================================
// GET /certificados
// Devuelve los certificados APROBADOS del empleado autenticado.
// ============================================================
router.get('/', verificarToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.usuario.id_usuario }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Solo los aprobados: los pendientes/rechazados no se muestran al empleado.
    const certificados = await prisma.certificado.findMany({
      where: {
        id_empleado: usuario.id_empleado,
        estado: 'APROBADO'
      },
      orderBy: { fecha_emision: 'desc' }
    });

    // Se reformatea cada registro a lo que espera el frontend.
    const resultado = certificados.map(c => ({
      id:          c.id_certificado,
      titulo:      c.titulo,
      institucion: c.institucion,
      fecha:       c.fecha_cert,
      ruta_pdf:    `http://localhost:3000/uploads/${c.url_archivo}`
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Error al listar certificados:', error);
    res.status(500).json({ error: 'Error al obtener certificados.', detalle: error.message });
  }
});

// ============================================================
// GET /certificados/pendientes
// Solo para administradores/supervisores.
// Lista los certificados en espera de revisión.
// ============================================================
router.get(
  '/pendientes',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  async (req, res) => {
    try {
      // include: empleado -> para mostrar de quién es cada certificado.
      const certificados = await prisma.certificado.findMany({
        where: { estado: 'PENDIENTE' },
        include: { empleado: true },
        orderBy: { fecha_solicitud: 'desc' }
      });

      const resultado = certificados.map(c => ({
        id:              c.id_certificado,
        id_empleado:     c.id_empleado,
        nombre_empleado: `${c.empleado.nombre} ${c.empleado.apellido}`,
        titulo:          c.titulo,
        institucion:     c.institucion,
        fecha:           c.fecha_cert,
        ruta_pdf:        `http://localhost:3000/uploads/${c.url_archivo}`,
        estado:          c.estado
      }));

      res.json(resultado);
    } catch (error) {
      console.error('Error al listar pendientes:', error);
      res.status(500).json({ error: 'Error al obtener certificados pendientes.', detalle: error.message });
    }
  }
);

// ============================================================
// PATCH /certificados/:id/aprobar
// Solo admin/supervisor. Cambia el estado a APROBADO y avisa al empleado.
// ============================================================
router.patch(
  '/:id/aprobar',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const certificado = await prisma.certificado.findUnique({
        where: { id_certificado: id },
        include: { empleado: true }
      });

      if (!certificado) {
        return res.status(404).json({ error: 'Certificado no encontrado.' });
      }
      // Evita reprocesar un certificado ya aprobado o rechazado.
      if (certificado.estado !== 'PENDIENTE') {
        return res.status(400).json({ error: 'Este certificado ya fue procesado.' });
      }

      // Transacción: aprobar el certificado + notificar al empleado.
      await prisma.$transaction(async (tx) => {
        await tx.certificado.update({
          where: { id_certificado: id },
          data: {
            estado: 'APROBADO',
            fecha_emision: new Date(),
            id_usuario_emisor: req.usuario.id_usuario // queda registrado quién lo aprobó
          }
        });

        await tx.notificacion.create({
          data: {
            id_empleado:    certificado.id_empleado,
            tipo:           'certificado_aprobado',
            titulo:         '¡Tu certificado fue aprobado!',
            mensaje:        `Tu certificado "${certificado.titulo}" fue aprobado y ya está disponible en tu perfil.`,
            ruta_destino:   '/103',
            etiqueta_boton: 'Ver certificado'
          }
        });
      });

      res.json({ mensaje: 'Certificado aprobado correctamente.' });
    } catch (error) {
      console.error('Error al aprobar:', error);
      res.status(500).json({ error: 'Error al aprobar el certificado.', detalle: error.message });
    }
  }
);

// ============================================================
// PATCH /certificados/:id/rechazar
// Solo admin/supervisor. Cambia el estado a RECHAZADO y avisa al empleado.
// ============================================================
router.patch(
  '/:id/rechazar',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const certificado = await prisma.certificado.findUnique({
        where: { id_certificado: id },
        include: { empleado: true }
      });

      if (!certificado) {
        return res.status(404).json({ error: 'Certificado no encontrado.' });
      }
      if (certificado.estado !== 'PENDIENTE') {
        return res.status(400).json({ error: 'Este certificado ya fue procesado.' });
      }

      // Transacción: rechazar el certificado + notificar al empleado.
      await prisma.$transaction(async (tx) => {
        await tx.certificado.update({
          where: { id_certificado: id },
          data: { estado: 'RECHAZADO' }
        });

        await tx.notificacion.create({
          data: {
            id_empleado:    certificado.id_empleado,
            tipo:           'certificado_rechazado',
            titulo:         'Certificado no aprobado',
            mensaje:        `Tu certificado "${certificado.titulo}" fue revisado y no pudo ser aprobado. Contacta a tu administrador para más información.`,
            ruta_destino:   '/102',
            etiqueta_boton: 'Nueva solicitud'
          }
        });
      });

      res.json({ mensaje: 'Certificado rechazado correctamente.' });
    } catch (error) {
      console.error('Error al rechazar:', error);
      res.status(500).json({ error: 'Error al rechazar el certificado.', detalle: error.message });
    }
  }
);

export default router;