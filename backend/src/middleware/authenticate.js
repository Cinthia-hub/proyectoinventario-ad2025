import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro';

export default function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Aseguramos compatibilidad con 'role' y 'rol'
    req.user = {
      id: payload.id || payload.sub,
      username: payload.username,
      role: payload.role || payload.rol
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}