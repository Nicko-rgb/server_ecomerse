const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Rutas públicas
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Rutas protegidas
router.get('/auth/verify', authenticateToken, authController.verifyToken);
router.post('/auth/change-password', authenticateToken, authController.changePassword);

module.exports = router;