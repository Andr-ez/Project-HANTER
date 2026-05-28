// ============================================================
// RUTAS DE ADMINISTRACIÓN DE USUARIOS  —  uso EXCLUSIVO de admins
// Las consume la página 150-A (Gestión de Usuarios).
//
// Todas las rutas requieren token y rol Administrador/Supervisor.
// Permite: listar, crear, editar, cambiar foto y eliminar usuarios
// (empleados que tienen una cuenta de tipo "Usuario" normal).
// ============================================================
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { verificarToken, verificarRol } from '../middlewares/auth.js';
import { subirFotoPerfil } from '../middlewares/upload.js';

const prisma = new PrismaClient();
const router = express.Router();

// Protege TODAS las rutas de este archivo: solo admin/supervisor.
router.use(verificarToken, verificarRol(['Administrador', 'Supervisor']));

// Da forma uniforme a la respuesta de un empleado + su cuenta de usuario.
function formatearUsuario(empleado) {
  return {
    id_empleado:   empleado.id_empleado,
    id_usuario:    empleado.usuario ? empleado.usuario.id_usuario : null,
    nombre:        empleado.nombre,
    apellido:      empleado.apellido,
    correo:        empleado.correo,
    documento:     empleado.documento,
    celular:       empleado.celular,
    fecha_ingreso: empleado.fecha_ingreso,
    rol:           empleado.rol ? empleado.rol.nombre_rol : '',
    nombre_usuario: empleado.usuario ? empleado.usuario.nombre_usuario : null,
    foto: empleado.foto_perfil
      ? `http://localhost:3000/uploads/${empleado.foto_perfil}`
      : null
  };
}

// Devuelve true si el empleado tiene un rol administrativo.
// Los empleados con estos roles NO se pueden editar ni eliminar
// desde esta página: solo se gestionan usuarios normales.
function esRolProtegido(empleado) {
  const rol = empleado.rol ? empleado.rol.nombre_rol : '';
  return rol === 'Administrador' || rol === 'Supervisor';
}

// ============================================================
// GET /admin/usuarios
// Lista todos los usuarios (empleados) con su cuenta y su rol.
// ============================================================
router.get('/', async (req, res) => {
  try {
    // include trae también el rol y la cuenta de usuario de cada empleado
    const empleados = await prisma.empleado.findMany({
      include: { rol: true, usuario: true },
      orderBy: { id_empleado: 'asc' }
    });
    res.json(empleados.map(formatearUsuario));
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error al listar usuarios', detalle: error.message });
  }
});

// ============================================================
// POST /admin/usuarios
// Da de alta SOLO el empleado (sin cuenta de usuario).
// La cuenta — nombre de usuario y contraseña — la crea el propio
// empleado al registrarse en la página 004, igual que antes con
// Postman: el admin lo registra, el empleado elige su clave.
// body: nombre, apellido, correo, documento, celular
// ============================================================
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, correo, documento, celular } = req.body;

    if (!nombre || !apellido || !correo || !documento || !celular) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // El rol siempre es "Usuario" (no se crean administradores desde aquí).
    const rolUsuario = await prisma.rol.findUnique({ where: { nombre_rol: 'Usuario' } });
    if (!rolUsuario) {
      return res.status(500).json({ error: 'No existe el rol "Usuario" en la base de datos.' });
    }

    // Validaciones de campos únicos para dar errores claros.
    if (await prisma.empleado.findUnique({ where: { correo } })) {
      return res.status(400).json({ error: 'Ya existe un empleado con ese correo.' });
    }
    if (await prisma.empleado.findUnique({ where: { documento } })) {
      return res.status(400).json({ error: 'Ya existe un empleado con esa cédula.' });
    }
    if (await prisma.empleado.findUnique({ where: { celular } })) {
      return res.status(400).json({ error: 'Ya existe un empleado con ese número de teléfono.' });
    }

    // Solo se crea el empleado. La cuenta queda pendiente de registro.
    const empleado = await prisma.empleado.create({
      data: {
        nombre:    nombre.trim(),
        apellido:  apellido.trim(),
        correo:    correo.trim(),
        documento: documento.trim(),
        celular:   celular.trim(),
        rol: { connect: { id_rol: rolUsuario.id_rol } } // enlaza el empleado al rol "Usuario"
      }
    });

    res.json({
      mensaje: 'Empleado registrado. Ya puede crear su cuenta en la página de registro.',
      id_empleado: empleado.id_empleado
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    // P2002: error de Prisma por restricción única violada
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Hay un dato duplicado (correo, cédula o teléfono).' });
    }
    res.status(500).json({ error: 'Error al crear usuario', detalle: error.message });
  }
});

// ============================================================
// PUT /admin/usuarios/:id_empleado
// Edita los datos del empleado y, si tiene cuenta, su nombre de
// usuario y opcionalmente su contraseña.
// body: nombre, apellido, correo, documento, celular, nombre_usuario, password?
// ============================================================
router.put('/:id_empleado', async (req, res) => {
  try {
    const id = Number(req.params.id_empleado);
    const { nombre, apellido, correo, documento, celular, nombre_usuario, password } = req.body;

    const empleado = await prisma.empleado.findUnique({
      where: { id_empleado: id },
      include: { usuario: true, rol: true }
    });
    if (!empleado) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Blindaje: no se permite editar a un administrador/supervisor
    // desde esta página. Solo se gestionan usuarios normales.
    if (esRolProtegido(empleado)) {
      return res.status(403).json({
        error: 'No tienes permiso para editar a un administrador desde aquí.'
      });
    }

    // Validaciones de unicidad excluyendo al propio empleado (NOT: id actual).
    if (correo) {
      const ocupado = await prisma.empleado.findFirst({
        where: { correo: correo.trim(), NOT: { id_empleado: id } }
      });
      if (ocupado) return res.status(400).json({ error: 'Ese correo ya está en uso.' });
    }
    if (documento) {
      const ocupado = await prisma.empleado.findFirst({
        where: { documento: documento.trim(), NOT: { id_empleado: id } }
      });
      if (ocupado) return res.status(400).json({ error: 'Esa cédula ya está en uso.' });
    }
    if (celular) {
      const ocupado = await prisma.empleado.findFirst({
        where: { celular: celular.trim(), NOT: { id_empleado: id } }
      });
      if (ocupado) return res.status(400).json({ error: 'Ese número de teléfono ya está en uso.' });
    }
    if (nombre_usuario && empleado.usuario) {
      const ocupado = await prisma.usuario.findFirst({
        where: {
          nombre_usuario: nombre_usuario.trim(),
          NOT: { id_usuario: empleado.usuario.id_usuario }
        }
      });
      if (ocupado) return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso.' });
    }

    // Se arman solo los campos enviados, para no sobrescribir con vacío.
    const dataEmpleado = {};
    if (nombre)    dataEmpleado.nombre    = nombre.trim();
    if (apellido)  dataEmpleado.apellido  = apellido.trim();
    if (correo)    dataEmpleado.correo    = correo.trim();
    if (documento) dataEmpleado.documento = documento.trim();
    if (celular)   dataEmpleado.celular   = celular.trim();

    // Datos a actualizar de la cuenta (si existe).
    const dataUsuario = {};
    if (nombre_usuario) dataUsuario.nombre_usuario = nombre_usuario.trim();
    if (password) {
      if (password.length < 4) {
        return res.status(400).json({ error: 'La contraseña debe tener mínimo 4 caracteres.' });
      }
      dataUsuario.password_hash = await bcrypt.hash(password, 10); // nunca se guarda en texto plano
    }

    // Transacción: empleado y cuenta se actualizan juntos o no se actualiza nada.
    await prisma.$transaction(async (tx) => {
      if (Object.keys(dataEmpleado).length > 0) {
        await tx.empleado.update({ where: { id_empleado: id }, data: dataEmpleado });
      }
      if (empleado.usuario && Object.keys(dataUsuario).length > 0) {
        await tx.usuario.update({
          where: { id_usuario: empleado.usuario.id_usuario },
          data: dataUsuario
        });
      }
    });

    res.json({ mensaje: 'Usuario actualizado correctamente.' });
  } catch (error) {
    console.error('Error al editar usuario:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Hay un dato duplicado (correo, cédula, teléfono o usuario).' });
    }
    res.status(500).json({ error: 'Error al editar usuario', detalle: error.message });
  }
});

// ============================================================
// PUT /admin/usuarios/:id_empleado/foto
// Actualiza la foto de perfil de un empleado (multipart, campo "foto").
// ============================================================
router.put('/:id_empleado/foto', (req, res) => {
  // subirFotoPerfil procesa el archivo; el resto del flujo va en su callback.
  subirFotoPerfil(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message }); // error de Multer (tipo/tamaño)
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen.' });
    }

    try {
      const id = Number(req.params.id_empleado);

      const empleado = await prisma.empleado.findUnique({
        where: { id_empleado: id },
        include: { rol: true }
      });
      if (!empleado) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      // Blindaje: no se permite cambiar la foto de un administrador.
      if (esRolProtegido(empleado)) {
        return res.status(403).json({
          error: 'No tienes permiso para modificar a un administrador.'
        });
      }

      // Ruta relativa guardada en BD (normaliza barras y quita el prefijo uploads/).
      const rutaRelativa = req.file.path.replace(/\\/g, '/').replace('uploads/', '');

      await prisma.empleado.update({
        where: { id_empleado: id },
        data: { foto_perfil: rutaRelativa }
      });

      res.json({
        mensaje: 'Foto de perfil actualizada correctamente.',
        foto_url: `http://localhost:3000/uploads/${rutaRelativa}`
      });
    } catch (error) {
      console.error('Error al actualizar foto:', error);
      res.status(500).json({ error: 'Error al actualizar foto', detalle: error.message });
    }
  });
});

// ============================================================
// DELETE /admin/usuarios/:id_empleado
// Elimina el empleado. Por las relaciones onDelete:Cascade del
// esquema, esto borra también su cuenta de usuario y sus datos.
// ============================================================
router.delete('/:id_empleado', async (req, res) => {
  try {
    const id = Number(req.params.id_empleado);

    const empleado = await prisma.empleado.findUnique({
      where: { id_empleado: id },
      include: { rol: true }
    });
    if (!empleado) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Blindaje: no se permite eliminar a un administrador/supervisor
    // desde esta página. Solo se gestionan usuarios normales.
    if (esRolProtegido(empleado)) {
      return res.status(403).json({
        error: 'No tienes permiso para eliminar a un administrador.'
      });
    }

    res.json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario', detalle: error.message });
  }
});

export default router;