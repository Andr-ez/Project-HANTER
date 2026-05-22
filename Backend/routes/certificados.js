import express from 'express';
<<<<<<< HEAD
import fs from 'fs';
=======
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
import { PrismaClient } from '@prisma/client';
import { verificarToken, verificarRol } from '../middlewares/auth.js';
import { subirCertificado } from '../middlewares/upload.js';

const prisma = new PrismaClient();
const router = express.Router();

// ============================================================
// POST /certificados/anadir
// El empleado sube su PDF. Se guarda con estado PENDIENTE.
// Se crea notificación para todos los administradores.
<<<<<<< HEAD
// Usa transacción atómica: si algo falla, el certificado NO
// queda en la DB y el archivo se borra del disco.
=======
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
// ============================================================
router.post('/anadir', verificarToken, (req, res) => {
  subirCertificado(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Debes adjuntar un archivo PDF.' });
    }

    const { titulo, institucion, fecha_certificacion } = req.body;

    if (!titulo || !institucion || !fecha_certificacion) {
<<<<<<< HEAD
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const rutaRelativa = req.file.path.replace(/\\/g, '/').replace('uploads/', '');

    try {
=======
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
      // Ruta relativa guardada en DB (sin prefijo "uploads/")
      const rutaRelativa = req.file.path.replace(/\\/g, '/').replace('uploads/', '');

      // Obtener datos del empleado que sube el certificado
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: req.usuario.id_usuario },
        include: { empleado: true }
      });

<<<<<<< HEAD
      if (!usuario || !usuario.empleado) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ error: 'Tu cuenta no tiene un perfil de empleado vinculado.' });
      }

      const nombreCompleto = `${usuario.empleado.nombre} ${usuario.empleado.apellido}`;

=======
      // Crear certificado con estado PENDIENTE
      const certificado = await prisma.certificado.create({
        data: {
          titulo,
          institucion,
          fecha_cert: fecha_certificacion,
          estado: 'PENDIENTE',
          url_archivo: rutaRelativa,
          id_empleado: usuario.id_empleado
        }
      });

      // Notificar a todos los administradores y supervisores
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
      const admins = await prisma.empleado.findMany({
        where: {
          rol: { nombre_rol: { in: ['Administrador', 'Supervisor'] } }
        }
      });

<<<<<<< HEAD
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
=======
      const nombreCompleto = `${usuario.empleado.nombre} ${usuario.empleado.apellido}`;

      await prisma.notificacion.createMany({
        data: admins.map(admin => ({
          id_empleado: admin.id_empleado,
          mensaje: `El empleado ${nombreCompleto} ha enviado un certificado para revisión: "${titulo}".`
        }))
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
      });

      res.json({
        mensaje: 'Su certificado fue enviado a revisión. Se le notificará cuando sea aprobado.',
        id_certificado: certificado.id_certificado
      });

    } catch (error) {
<<<<<<< HEAD
      fs.unlink(req.file.path, () => {});
=======
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
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

<<<<<<< HEAD
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

=======
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
    const certificados = await prisma.certificado.findMany({
      where: {
        id_empleado: usuario.id_empleado,
        estado: 'APROBADO'
      },
      orderBy: { fecha_emision: 'desc' }
    });

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
<<<<<<< HEAD
=======
// Devuelve todos los certificados PENDIENTES de todos los empleados.
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
// ============================================================
router.get(
  '/pendientes',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  async (req, res) => {
    try {
      const certificados = await prisma.certificado.findMany({
        where: { estado: 'PENDIENTE' },
<<<<<<< HEAD
        include: { empleado: true },
=======
        include: {
          empleado: true
        },
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
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
<<<<<<< HEAD
=======
// Solo administradores/supervisores.
// Cambia estado a APROBADO y notifica al empleado.
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
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
      if (certificado.estado !== 'PENDIENTE') {
        return res.status(400).json({ error: 'Este certificado ya fue procesado.' });
      }

<<<<<<< HEAD
      await prisma.$transaction(async (tx) => {
        await tx.certificado.update({
          where: { id_certificado: id },
          data: {
            estado: 'APROBADO',
            fecha_emision: new Date(),
            id_usuario_emisor: req.usuario.id_usuario
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
=======
      // Actualizar estado a APROBADO
      await prisma.certificado.update({
        where: { id_certificado: id },
        data: {
          estado: 'APROBADO',
          fecha_emision: new Date(),
          id_usuario_emisor: req.usuario.id_usuario
        }
      });

      // Notificar al empleado
      await prisma.notificacion.create({
        data: {
          id_empleado: certificado.id_empleado,
          mensaje: `Tu certificado "${certificado.titulo}" fue aprobado y ya está disponible en tu perfil.`
        }
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
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
<<<<<<< HEAD
=======
// Solo administradores/supervisores.
// Cambia estado a RECHAZADO y notifica al empleado.
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
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

<<<<<<< HEAD
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
=======
      await prisma.certificado.update({
        where: { id_certificado: id },
        data: { estado: 'RECHAZADO' }
      });

      // Notificar al empleado
      await prisma.notificacion.create({
        data: {
          id_empleado: certificado.id_empleado,
          mensaje: `Tu certificado "${certificado.titulo}" fue revisado y no pudo ser aprobado. Contacta a tu administrador para más información.`
        }
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
      });

      res.json({ mensaje: 'Certificado rechazado correctamente.' });
    } catch (error) {
      console.error('Error al rechazar:', error);
      res.status(500).json({ error: 'Error al rechazar el certificado.', detalle: error.message });
    }
  }
);

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
