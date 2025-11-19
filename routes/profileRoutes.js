const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Rutas del perfil
router.get('/profile/:id', profileController.getProfile);
router.get('/profile', profileController.getProfile); // Sin ID usa default
router.put('/profile/:id', profileController.updateProfile);
router.put('/profile', profileController.updateProfile); // Sin ID usa default

// Rutas de direcciones
router.get('/profile/:id/addresses', profileController.getAddresses);
router.post('/profile/:id/addresses', profileController.addAddress);

// Rutas de métodos de pago
router.get('/profile/:id/payment-methods', profileController.getPaymentMethods);
router.post('/profile/:id/payment-methods', profileController.addPaymentMethod);

module.exports = router;