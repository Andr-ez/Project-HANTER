import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verificarToken, verificarRol } from '../middlewares/auth.js';
import { subirFotoPerfil } from '../middlewares/upload.js';
import path from 'path';

const prisma = new PrismaClient();
const router = express.Router();

// ============================================================
// GET /usuarios
// Solo admin/supervisor. Lista las cuentas de usuario con su
// empleado y el rol de ese empleado.
// ============================================================
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

// ============================================================
// DELETE /usuarios/:id
// Solo admin/supervisor. Elimina una cuenta de usuario por su ID.
// ============================================================
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

// ============================================================
// PUT /usuarios/:id
// Solo admin/supervisor. Edita el nombre de usuario y/o la
// contraseña de una cuenta.
// ============================================================
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

      // Se arman solo los campos enviados.
      let dataUpdate = {};
      if (nombre_usuario) {
        dataUpdate.nombre_usuario = nombre_usuario.trim();
      }
      if (password) {
        if (password.length < 4) {
          return res.status(400).json({ error: "La contraseña debe tener mínimo 4 caracteres" });
        }
        const hashedPassword = await bcrypt.hash(password, 10); // se guarda cifrada
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

// ============================================================
// GET /usuarios/perfil
// Devuelve el perfil completo del usuario autenticado (datos de
// su cuenta + su empleado + su rol). Usa el id del token.
// ============================================================
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

    // Respuesta con forma fija para el frontend del perfil.
    res.json({
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      ultimo_login: usuario.ultimo_login,
      empleado: {
        id_empleado: usuario.empleado.id_empleado,
        nombre: usuario.empleado.nombre,
        apellido: usuario.empleado.apellido,
        correo: usuario.empleado.correo,
        documento: usuario.empleado.documento,
        celular: usuario.empleado.celular,
        fecha_ingreso: usuario.empleado.fecha_ingreso,
        foto_perfil: usuario.empleado.foto_perfil
          ? `http://localhost:3000/uploads/${usuario.empleado.foto_perfil}`
          : null,
        rol: usuario.empleado.rol.nombre_rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener perfil', detalle: error.message });
  }
});

// ============================================================
// PUT /usuarios/perfil/foto
// El propio usuario actualiza su foto de perfil (campo "foto").
// ============================================================
router.put('/perfil/foto', verificarToken, (req, res) => {
  // subirFotoPerfil procesa la imagen; el flujo sigue en su callback.
  subirFotoPerfil(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message }); // error de Multer (tipo/tamaño)
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    try {
      // La ruta relativa que se guarda en DB (sin el prefijo uploads/)
      const rutaRelativa = req.file.path.replace(/\\/g, '/').replace('uploads/', '');

      // Se ubica el empleado vinculado a la cuenta y se actualiza su foto.
      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: req.usuario.id_usuario }
      });

      await prisma.empleado.update({
        where: { id_empleado: usuario.id_empleado },
        data: { foto_perfil: rutaRelativa }
      });

      res.json({
        mensaje: 'Foto de perfil actualizada correctamente',
        foto_url: `http://localhost:3000/uploads/${rutaRelativa}`
      });
    } catch (error) {
      console.error('Error al actualizar foto:', error);
      res.status(500).json({ error: 'Error al actualizar foto de perfil', detalle: error.message });
    }
  });
});

// ============================================================
// PUT /usuarios/perfil/nombre
// El propio usuario cambia su nombre de usuario (mínimo 3 chars,
// debe ser único).
// ============================================================
router.put('/perfil/nombre', verificarToken, async (req, res) => {
  try {
    const { nombre_usuario } = req.body;

    if (!nombre_usuario || nombre_usuario.trim().length < 3) {
      return res.status(400).json({ error: 'El nombre de usuario debe tener mínimo 3 caracteres' });
    }

    // Se verifica que el nombre no lo tenga ya OTRA cuenta.
    const nombreTomado = await prisma.usuario.findFirst({
      where: {
        nombre_usuario: nombre_usuario.trim(),
        NOT: { id_usuario: req.usuario.id_usuario }
      }
    });

    if (nombreTomado) {
      return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso' });
    }

    const actualizado = await prisma.usuario.update({
      where: { id_usuario: req.usuario.id_usuario },
      data: { nombre_usuario: nombre_usuario.trim() }
    });

    res.json({
      mensaje: 'Nombre de usuario actualizado correctamente',
      nombre_usuario: actualizado.nombre_usuario
    });
  } catch (error) {
    console.error('Error al cambiar nombre usuario:', error);
    res.status(500).json({ error: 'Error al actualizar nombre de usuario', detalle: error.message });
  }
});

// ============================================================
// POST /usuarios/signup
// Registro de cuenta. El empleado ya debe existir (creado por el
// admin); aquí elige su nombre de usuario y contraseña.
// La cuenta se asocia al empleado mediante el correo.
// ============================================================
router.post('/signup', async (req, res) => {
  const { nombre_usuario, password, confirm_password, correo } = req.body;

  try {
    // Confirma que coincidan las contraseñas.
    if (password !== confirm_password) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    // Busca el empleado por correo para asociar el usuario.
    const empleado = await prisma.empleado.findUnique({
      where: { correo }
    });

    if (!empleado) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    // Valida que ese empleado no tenga ya una cuenta.
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id_empleado: empleado.id_empleado }
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: "Ya existe un usuario para este empleado" });
    }

    // Valida que el nombre de usuario esté libre.
    const nombreTomado = await prisma.usuario.findUnique({
      where: { nombre_usuario }
    });
    if (nombreTomado) {
      return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: "La contraseña debe tener mínimo 4 caracteres" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // contraseña cifrada

    // Crea la cuenta asociada al empleado.
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

// ============================================================
// POST /usuarios/login
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
      { expiresIn: '1h' } // el token caduca en 1 hora
    );

    // Registra la fecha/hora del último inicio de sesión.
    await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { ultimo_login: new Date() }
    });

    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.empleado.correo,
        rol: usuario.empleado.rol.nombre_rol,
        foto_perfil: usuario.empleado.foto_perfil
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en login', detalle: error.message });
  }
});

export default router;