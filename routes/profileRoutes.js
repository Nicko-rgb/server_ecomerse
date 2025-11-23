const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken, requireOwnerOrAdmin } = require('../middleware/auth');

// Aplicar autenticación a todas las rutas de perfil
router.use(authenticateToken);

// Rutas del perfil (protegidas - solo el dueño o admin)
router.get('/profile/:id', requireOwnerOrAdmin, profileController.getProfile);
router.put('/profile/:id', requireOwnerOrAdmin, profileController.updateProfile);

// Rutas de direcciones (protegidas)
router.get('/profile/:id/addresses', requireOwnerOrAdmin, profileController.getAddresses);
router.post('/profile/:id/addresses', requireOwnerOrAdmin, profileController.addAddress);

// Rutas de métodos de pago (protegidas)
router.get('/profile/:id/payment-methods', requireOwnerOrAdmin, profileController.getPaymentMethods);
router.post('/profile/:id/payment-methods', requireOwnerOrAdmin, profileController.addPaymentMethod);

module.exports = router;