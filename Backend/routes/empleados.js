import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Crear empleado
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, correo, documento, celular, id_rol } = req.body;

    // Validar que el rol existe
    const rol = await prisma.rol.findUnique({
      where: { id_rol: Number(id_rol) }
    });

    if (!rol) {
      return res.status(400).json({ error: 'Rol no encontrado' });
    }

    // Crear empleado conectado al rol
    const empleado = await prisma.empleado.create({
      data: {
        nombre,
        apellido,
        correo,
        documento,
        celular,
        rol: { connect: { id_rol: Number(id_rol) } }
      },
      include: { rol: true } // incluir el rol en la respuesta
    });

    res.json(empleado);
  } catch (error) {
    console.error("Error al crear empleado:", error);
    res.status(500).json({ error: 'Error al crear empleado', detalle: error.message });
  }
});


// Listar empleados
router.get('/', async (req, res) => {
  try {
    const empleados = await prisma.empleado.findMany({
      include: { rol: true }
    });
    res.json(empleados);
  } catch (error) {
    console.error("Error al listar empleados:", error);
    res.status(500).json({ error: 'Error al listar empleados', detalle: error.message });
  }
});

// Eliminar empleado por ID
router.delete(
  '/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);

      // Validar que el empleado exista
      const empleado = await prisma.empleado.findUnique({
        where: { id_empleado: id }
      });

      if (!empleado) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }

      // Eliminar empleado
      await prisma.empleado.delete({
        where: { id_empleado: id }
      });

      res.json({ mensaje: 'Empleado eliminado correctamente' });
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      res.status(500).json({ error: 'Error al eliminar empleado', detalle: error.message });
    }
  }
);

// Editar empleado por ID
router.put(
  '/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { nombre, apellido, correo, documento, celular, id_rol } = req.body;

      // Validar que el empleado exista
      const empleado = await prisma.empleado.findUnique({
        where: { id_empleado: id }
      });

      if (!empleado) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }

      // Si se envía id_rol, validar que exista
      if (id_rol) {
        const rol = await prisma.rol.findUnique({
          where: { id_rol: Number(id_rol) }
        });
        if (!rol) {
          return res.status(400).json({ error: 'Rol no encontrado' });
        }
      }

      // Actualizar empleado
      const empleadoActualizado = await prisma.empleado.update({
        where: { id_empleado: id },
        data: {
          nombre,
          apellido,
          correo,
          documento,
          celular,
          ...(id_rol && { rol: { connect: { id_rol: Number(id_rol) } } })
        },
        include: { rol: true }
      });

      res.json(empleadoActualizado);
    } catch (error) {
      console.error("Error al editar empleado:", error);
      res.status(500).json({ error: 'Error al editar empleado', detalle: error.message });
    }
  }
);
export default router;
