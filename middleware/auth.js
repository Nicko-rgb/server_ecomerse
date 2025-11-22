const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambiar_en_produccion';

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Token no proporcionado' 
      });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ 
          success: false,
          error: 'Token inválido o expirado' 
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error al verificar token' 
    });
  }
};

// Middleware para verificar rol de admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador' 
    });
  }
  next();
};

// Middleware para verificar que el usuario accede a sus propios datos
const requireOwnerOrAdmin = (req, res, next) => {
  const requestedUserId = parseInt(req.params.id);
  const currentUserId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (currentUserId !== requestedUserId && !isAdmin) {
    return res.status(403).json({ 
      success: false,
      error: 'Acceso denegado. No tienes permisos para acceder a estos datos' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnerOrAdmin
};