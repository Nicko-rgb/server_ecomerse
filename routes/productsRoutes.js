const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

// Rutas públicas de productos
router.get('/products', productsController.getAllProducts);
router.get('/products/featured', productsController.getFeaturedProducts);
router.get('/products/categories', productsController.getCategories);
router.get('/products/:id', productsController.getProductById);
router.get('/products/:id/related', productsController.getRelatedProducts);

module.exports = router;