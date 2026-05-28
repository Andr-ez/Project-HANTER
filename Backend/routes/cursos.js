import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verificarToken, verificarRol } from '../middlewares/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// ============================================================
// HELPERS
// ============================================================

// Formatea una fecha Date -> "DD/MM/YYYY" (lo que esperan las páginas 126 / 126-A / 133)
function fechaDDMMYYYY(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  const dia  = String(d.getDate()).padStart(2, '0');       // padStart: asegura 2 dígitos
  const mes  = String(d.getMonth() + 1).padStart(2, '0');  // +1 porque getMonth() va de 0 a 11
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// Devuelve el empleado vinculado al usuario autenticado (o null)
async function empleadoDelUsuario(id_usuario) {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario },
    include: { empleado: true }
  });
  return usuario ? usuario.empleado : null;
}

// ============================================================
// POST /cursos
// Solo Administrador/Supervisor.
// El admin crea un nuevo curso desde la página 125-A.
// Queda disponible para que los empleados se inscriban (página 126).
// ============================================================
router.post(
  '/',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  async (req, res) => {
    try {
      const { nombre, tipo, fecha_inicio, descripcion } = req.body;

      if (!nombre || !tipo || !fecha_inicio) {
        return res.status(400).json({ error: 'Nombre, tipo y fecha de inicio son obligatorios.' });
      }

      // Se valida que la fecha recibida sea convertible a una fecha real.
      const fecha = new Date(fecha_inicio);
      if (isNaN(fecha.getTime())) {
        return res.status(400).json({ error: 'La fecha de inicio no es válida.' });
      }

      const curso = await prisma.curso.create({
        data: {
          nombre,
          tipo,
          fecha_inicio: fecha,
          descripcion: descripcion || null // descripción opcional
        }
      });

      res.json({ mensaje: 'Curso creado correctamente.', id_curso: curso.id_curso });
    } catch (error) {
      console.error('Error al crear curso:', error);
      res.status(500).json({ error: 'Error al crear el curso.', detalle: error.message });
    }
  }
);

// ============================================================
// GET /cursos/disponibles
// Cualquier usuario autenticado.
// Devuelve los cursos activos para que el empleado decida inscribirse.
// Lo consume la página 126.
// ============================================================
router.get('/disponibles', verificarToken, async (req, res) => {
  try {
    // activo: true -> solo cursos vigentes.
    const cursos = await prisma.curso.findMany({
      where: { activo: true },
      orderBy: { fecha_inicio: 'asc' }
    });

    res.json(cursos.map(c => ({
      id:           c.id_curso,
      nombre:       c.nombre,
      fecha_inicio: fechaDDMMYYYY(c.fecha_inicio),
      tipo:         c.tipo,
      descripcion:  c.descripcion || ''
    })));
  } catch (error) {
    console.error('Error al listar cursos:', error);
    res.status(500).json({ error: 'Error al obtener cursos.', detalle: error.message });
  }
});

// ============================================================
// POST /cursos/inscripcion
// El empleado solicita inscribirse a un curso.
// Crea una Inscripcion en estado PENDIENTE y notifica a los admins.
// Transacción atómica: si algo falla, nada queda en la BD.
// Lo consume la página 126.
// ============================================================
router.post('/inscripcion', verificarToken, async (req, res) => {
  try {
    const { id_curso } = req.body;
    if (!id_curso) {
      return res.status(400).json({ error: 'Debes indicar el curso.' });
    }

    const empleado = await empleadoDelUsuario(req.usuario.id_usuario);
    if (!empleado) {
      return res.status(400).json({ error: 'Tu cuenta no tiene un perfil de empleado vinculado.' });
    }

    const curso = await prisma.curso.findUnique({ where: { id_curso: Number(id_curso) } });
    if (!curso) {
      return res.status(404).json({ error: 'El curso no existe.' });
    }

    // Evitar solicitudes duplicadas: una inscripción activa por curso y empleado
    const yaExiste = await prisma.inscripcion.findFirst({
      where: {
        id_empleado: empleado.id_empleado,
        id_curso:    curso.id_curso,
        estado:      { in: ['PENDIENTE', 'MATRICULADO', 'EN_PROGRESO'] }
      }
    });
    if (yaExiste) {
      return res.status(400).json({ mensaje: 'Ya tienes una solicitud o inscripción activa para este curso.' });
    }

    // Destinatarios de la notificación: admins/supervisores.
    const admins = await prisma.empleado.findMany({
      where: { rol: { nombre_rol: { in: ['Administrador', 'Supervisor'] } } }
    });

    const nombreCompleto = `${empleado.nombre} ${empleado.apellido}`;

    // Transacción: crear inscripción + notificar a los admins.
    const inscripcion = await prisma.$transaction(async (tx) => {
      const ins = await tx.inscripcion.create({
        data: {
          id_empleado: empleado.id_empleado,
          id_curso:    curso.id_curso,
          estado:      'PENDIENTE'
        }
      });

      if (admins.length > 0) {
        await tx.notificacion.createMany({
          data: admins.map(admin => ({
            id_empleado:    admin.id_empleado,
            tipo:           'inscripcion_pendiente',
            titulo:         'Nueva solicitud de inscripción',
            mensaje:        `El empleado ${nombreCompleto} solicitó inscribirse al curso "${curso.nombre}".`,
            ruta_destino:   '/126-A',
            etiqueta_boton: 'Revisar solicitud'
          }))
        });
      }

      return ins;
    });

    res.json({
      mensaje: 'Solicitud enviada correctamente',
      id_solicitud: inscripcion.id_inscripcion
    });
  } catch (error) {
    console.error('Error al crear inscripción:', error);
    res.status(500).json({ error: 'Error al enviar la solicitud.', detalle: error.message });
  }
});

// ============================================================
// GET /cursos/inscripciones/pendientes
// Solo Administrador/Supervisor.
// Devuelve todas las solicitudes de inscripción en estado PENDIENTE.
// Lo consume la página 126-A.
// ============================================================
router.get(
  '/inscripciones/pendientes',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  async (req, res) => {
    try {
      // include: empleado y curso -> para mostrar nombres completos.
      const inscripciones = await prisma.inscripcion.findMany({
        where: { estado: 'PENDIENTE' },
        include: { empleado: true, curso: true },
        orderBy: { fecha_solicitud: 'desc' }
      });

      res.json(inscripciones.map(i => ({
        id:              i.id_inscripcion,
        id_usuario:      i.id_empleado,
        nombre_empleado: `${i.empleado.nombre} ${i.empleado.apellido}`,
        id_curso:        i.id_curso,
        nombre_curso:    i.curso.nombre,
        fecha_inicio:    fechaDDMMYYYY(i.curso.fecha_inicio),
        tipo_curso:      i.curso.tipo,
        fecha_solicitud: fechaDDMMYYYY(i.fecha_solicitud),
        estado:          i.estado
      })));
    } catch (error) {
      console.error('Error al listar inscripciones pendientes:', error);
      res.status(500).json({ error: 'Error al obtener solicitudes.', detalle: error.message });
    }
  }
);

// ============================================================
// PATCH /cursos/inscripciones/:id/matricular
// Solo Administrador/Supervisor.
// Aprueba la solicitud (estado MATRICULADO) y notifica al empleado.
// Lo consume la página 126-A.
// ============================================================
router.patch(
  '/inscripciones/:id/matricular',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const inscripcion = await prisma.inscripcion.findUnique({
        where: { id_inscripcion: id },
        include: { curso: true }
      });

      if (!inscripcion) {
        return res.status(404).json({ error: 'Solicitud no encontrada.' });
      }
      // Solo se puede matricular una solicitud aún pendiente.
      if (inscripcion.estado !== 'PENDIENTE') {
        return res.status(400).json({ error: 'Esta solicitud ya fue procesada.' });
      }

      // Transacción: matricular + notificar al empleado.
      await prisma.$transaction(async (tx) => {
        await tx.inscripcion.update({
          where: { id_inscripcion: id },
          data: { estado: 'MATRICULADO', fecha_decision: new Date() }
        });

        await tx.notificacion.create({
          data: {
            id_empleado:    inscripcion.id_empleado,
            tipo:           'inscripcion_aprobada',
            titulo:         '¡Has sido matriculado!',
            mensaje:        `Has sido matriculado en el curso "${inscripcion.curso.nombre}". Inicio: ${fechaDDMMYYYY(inscripcion.curso.fecha_inicio)}.`,
            ruta_destino:   '/133',
            etiqueta_boton: 'Ver mis cursos'
          }
        });
      });

      res.json({ mensaje: 'Empleado matriculado correctamente' });
    } catch (error) {
      console.error('Error al matricular:', error);
      res.status(500).json({ error: 'Error al matricular.', detalle: error.message });
    }
  }
);

// ============================================================
// PATCH /cursos/inscripciones/:id/declinar
// Solo Administrador/Supervisor.
// Rechaza la solicitud (estado DECLINADO) y notifica al empleado.
// Lo consume la página 126-A.
// ============================================================
router.patch(
  '/inscripciones/:id/declinar',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const inscripcion = await prisma.inscripcion.findUnique({
        where: { id_inscripcion: id },
        include: { curso: true }
      });

      if (!inscripcion) {
        return res.status(404).json({ error: 'Solicitud no encontrada.' });
      }
      if (inscripcion.estado !== 'PENDIENTE') {
        return res.status(400).json({ error: 'Esta solicitud ya fue procesada.' });
      }

      // Transacción: declinar + notificar al empleado.
      await prisma.$transaction(async (tx) => {
        await tx.inscripcion.update({
          where: { id_inscripcion: id },
          data: { estado: 'DECLINADO', fecha_decision: new Date() }
        });

        await tx.notificacion.create({
          data: {
            id_empleado:    inscripcion.id_empleado,
            tipo:           'inscripcion_declinada',
            titulo:         'Solicitud de inscripción declinada',
            mensaje:        `Tu solicitud de inscripción al curso "${inscripcion.curso.nombre}" fue declinada. Contacta a tu administrador para más información.`,
            ruta_destino:   '/126',
            etiqueta_boton: 'Ver cursos'
          }
        });
      });

      res.json({ mensaje: 'Solicitud declinada correctamente' });
    } catch (error) {
      console.error('Error al declinar:', error);
      res.status(500).json({ error: 'Error al declinar.', detalle: error.message });
    }
  }
);

// ============================================================
// GET /cursos/historial
// Cualquier usuario autenticado.
// Devuelve TODAS las inscripciones del empleado (cualquier estado),
// para mostrar su historial de postulaciones. Lo consume la página 133.
// ============================================================
router.get('/historial', verificarToken, async (req, res) => {
  try {
    const empleado = await empleadoDelUsuario(req.usuario.id_usuario);
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado.' });
    }

    // Sin filtro de estado: trae el historial completo del empleado.
    const inscripciones = await prisma.inscripcion.findMany({
      where: { id_empleado: empleado.id_empleado },
      include: { curso: true },
      orderBy: { fecha_solicitud: 'desc' }
    });

    res.json(inscripciones.map(i => ({
      id:           i.id_inscripcion,
      nombre:       i.curso.nombre,
      fecha_inicio: fechaDDMMYYYY(i.curso.fecha_inicio),
      tipo:         i.curso.tipo,
      estado:       i.estado   // PENDIENTE | MATRICULADO | DECLINADO | EN_PROGRESO | COMPLETADO
    })));
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener el historial.', detalle: error.message });
  }
});

// ============================================================
// GET /cursos/inscripciones/activas
// Solo Administrador/Supervisor.
// Devuelve las inscripciones MATRICULADO / EN_PROGRESO / COMPLETADO
// para que el admin pueda validar el avance de los empleados.
// (Conexión lista para usar en una página de validación más adelante.)
// ============================================================
router.get(
  '/inscripciones/activas',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  async (req, res) => {
    try {
      const inscripciones = await prisma.inscripcion.findMany({
        where: { estado: { in: ['MATRICULADO', 'EN_PROGRESO', 'COMPLETADO'] } },
        include: { empleado: true, curso: true },
        orderBy: { fecha_decision: 'desc' }
      });

      res.json(inscripciones.map(i => ({
        id:              i.id_inscripcion,
        nombre_empleado: `${i.empleado.nombre} ${i.empleado.apellido}`,
        nombre_curso:    i.curso.nombre,
        fecha_inicio:    fechaDDMMYYYY(i.curso.fecha_inicio),
        estado:          i.estado
      })));
    } catch (error) {
      console.error('Error al listar inscripciones activas:', error);
      res.status(500).json({ error: 'Error al obtener inscripciones.', detalle: error.message });
    }
  }
);

// ============================================================
// PATCH /cursos/inscripciones/:id/estado
// Solo Administrador/Supervisor.
// Permite al admin actualizar el avance del curso del empleado:
//   - EN_PROGRESO  -> el empleado sigue cursándolo
//   - COMPLETADO   -> el empleado ya lo terminó
// Notifica al empleado. (Conexión lista para usar más adelante.)
// ============================================================
router.patch(
  '/inscripciones/:id/estado',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { estado } = req.body;

      // Solo se aceptan estos dos estados por esta ruta.
      const permitidos = ['EN_PROGRESO', 'COMPLETADO'];
      if (!permitidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido. Usa EN_PROGRESO o COMPLETADO.' });
      }

      const inscripcion = await prisma.inscripcion.findUnique({
        where: { id_inscripcion: id },
        include: { curso: true }
      });
      if (!inscripcion) {
        return res.status(404).json({ error: 'Inscripción no encontrada.' });
      }

      // Transacción: actualizar estado + notificar (mensaje según el estado).
      await prisma.$transaction(async (tx) => {
        await tx.inscripcion.update({
          where: { id_inscripcion: id },
          data: { estado }
        });

        await tx.notificacion.create({
          data: {
            id_empleado:    inscripcion.id_empleado,
            tipo:           'inscripcion_estado',
            titulo:         estado === 'COMPLETADO' ? '¡Curso completado!' : 'Tu curso está en progreso',
            mensaje:        estado === 'COMPLETADO'
              ? `Has completado el curso "${inscripcion.curso.nombre}". ¡Felicidades!`
              : `Tu curso "${inscripcion.curso.nombre}" fue marcado como en progreso.`,
            ruta_destino:   '/133',
            etiqueta_boton: 'Ver mis cursos'
          }
        });
      });

      res.json({ mensaje: 'Estado actualizado correctamente.' });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({ error: 'Error al actualizar el estado.', detalle: error.message });
    }
  }
);

export default router;