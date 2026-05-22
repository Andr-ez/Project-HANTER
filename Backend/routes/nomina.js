import express from 'express';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { verificarToken, verificarRol } from '../middlewares/auth.js';
import { subirNomina } from '../middlewares/upload.js';

const prisma = new PrismaClient();
const router = express.Router();

// Nombres de mes para mostrar al empleado
const NOMBRES_MES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

// ============================================================
// POST /nomina/enviar
// Solo Administrador/Supervisor.
// El admin sube el PDF de nómina de un empleado, junto con
// salario base, deducciones, total de bonos y total del pago.
// Se crea la nómina + una notificación para el empleado.
// Transacción atómica: si algo falla, nada queda en la BD y
// el archivo se borra del disco.
// ============================================================
router.post(
  '/enviar',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']),
  (req, res) => {
    subirNomina(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Debes adjuntar el archivo PDF de la nómina.' });
      }

      const {
        id_empleado,
        mes,
        anio,
        salario_base,
        deducciones,
        total_bonos,
        total_pago
      } = req.body;

      // ── Validaciones ───────────────────────────────────────
      if (!id_empleado || !mes || !anio) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ error: 'Empleado y fecha de nómina son obligatorios.' });
      }

      const mesNum  = Number(mes);
      const anioNum = Number(anio);
      if (mesNum < 1 || mesNum > 12 || isNaN(anioNum)) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ error: 'La fecha de nómina no es válida.' });
      }

      const salarioNum     = Number(salario_base) || 0;
      const deduccionesNum = Number(deducciones)  || 0;
      const bonosNum       = Number(total_bonos)  || 0;
      const totalNum       = Number(total_pago)   || 0;

      const rutaRelativa = req.file.path.replace(/\\/g, '/').replace('uploads/', '');

      try {
        const empleado = await prisma.empleado.findUnique({
          where: { id_empleado: Number(id_empleado) }
        });

        if (!empleado) {
          fs.unlink(req.file.path, () => {});
          return res.status(404).json({ error: 'El empleado seleccionado no existe.' });
        }

        const nombreMes = NOMBRES_MES[mesNum - 1];

        // TRANSACCION ATOMICA: nómina + notificación juntas.
        const nomina = await prisma.$transaction(async (tx) => {
          const nom = await tx.nomina.create({
            data: {
              mes:          mesNum,
              anio:         anioNum,
              salario_base: salarioNum,
              deducciones:  deduccionesNum,
              total_bonos:  bonosNum,
              total_pago:   totalNum,
              url_archivo:  rutaRelativa,
              id_empleado:  empleado.id_empleado
            }
          });

          await tx.notificacion.create({
            data: {
              id_empleado:    empleado.id_empleado,
              tipo:           'nomina_recibida',
              titulo:         '¡Tu documento de nómina está disponible!',
              mensaje:        `Tu nómina del mes de ${nombreMes} ${anioNum} ya fue cargada. Puedes verla y descargarla en tu sección de Nómina.`,
              ruta_destino:   '/104',
              etiqueta_boton: 'Ver nómina'
            }
          });

          return nom;
        });

        res.json({
          mensaje: 'La nómina fue enviada y el empleado fue notificado.',
          id_nomina: nomina.id_nomina
        });

      } catch (error) {
        fs.unlink(req.file.path, () => {});
        console.error('Error al guardar nómina:', error);
        res.status(500).json({ error: 'Error al procesar la nómina.', detalle: error.message });
      }
    });
  }
);

// ============================================================
// GET /nomina
// Devuelve las nóminas del empleado autenticado.
// Si para un mismo mes/año hay varios envíos, solo se devuelve
// el MÁS RECIENTE (el último que cargó el admin).
// ============================================================
router.get('/', verificarToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.usuario.id_usuario }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Todas las nóminas del empleado, las más recientes primero
    const nominas = await prisma.nomina.findMany({
      where: { id_empleado: usuario.id_empleado },
      orderBy: { fecha_carga: 'desc' }
    });

    // Dejar solo una por mes/año: como ya vienen ordenadas
    // de más reciente a más antigua, la primera de cada
    // mes/año es la última que envió el admin.
    const vistos = new Set();
    const resultado = [];

    for (const n of nominas) {
      const clave = `${n.mes}-${n.anio}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);

      resultado.push({
        id:          n.id_nomina,
        mes:         NOMBRES_MES[n.mes - 1],
        anio:        n.anio,
        fecha:       n.fecha_carga,
        salario:     n.salario_base,
        deducciones: n.deducciones,
        bonos:       n.total_bonos,
        total:       n.total_pago,
        ruta_pdf:    `http://localhost:3000/uploads/${n.url_archivo}`
      });
    }

    res.json(resultado);
  } catch (error) {
    console.error('Error al listar nóminas:', error);
    res.status(500).json({ error: 'Error al obtener nóminas.', detalle: error.message });
  }
});

export default router;
