import jwt from 'jsonwebtoken';

// Middleware: verifica que la petición traiga un token JWT válido.
// Se usa para proteger rutas que requieren que el usuario esté logueado.
export function verificarToken(req, res, next) {
  // El token viaja en el header "Authorization" con formato: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // separa "Bearer" del token y toma solo el token

  // Si no hay token, se corta la petición: no está autenticado
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    // Valida la firma y vigencia del token con la clave secreta del .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // guarda los datos del usuario (id_usuario, rol, etc.) para usarlos en la ruta
    next(); // todo bien: continúa hacia el siguiente middleware o controlador
  } catch (error) {
    // Token mal firmado, manipulado o expirado
    console.error('Error al verificar token:', error);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

// Middleware fábrica: recibe los roles permitidos y devuelve el middleware real.
// Debe usarse SIEMPRE después de verificarToken, porque depende de req.usuario.
export function verificarRol(rolesPermitidos) {
  return (req, res, next) => {
    // Si no existe req.usuario, es que no se corrió verificarToken antes
    if (!req.usuario) {
      return res.status(401).json({ error: 'Token no procesado' });
    }

    // El rol del usuario no está dentro de los autorizados para esta ruta
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    next(); // el rol es válido: continúa
  };
}