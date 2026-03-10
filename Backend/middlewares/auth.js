import jwt from 'jsonwebtoken';

export function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // aquí guardas el id_usuario
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}
