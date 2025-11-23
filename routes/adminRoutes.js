const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Aplicar autenticación y verificación de admin a todas las rutas
router.use(authenticateToken);
router.use(requireAdmin);

// ============ DASHBOARD ============
router.get('/admin/dashboard/stats', adminController.getDashboardStats);
router.get('/admin/dashboard/activity', adminController.getRecentActivity);

// ============ PRODUCTOS ============
router.get('/admin/products', adminController.getAllProducts);
router.get('/admin/products/:id', adminController.getProduct);
router.post('/admin/products', adminController.createProduct);
router.put('/admin/products/:id', adminController.updateProduct);
router.delete('/admin/products/:id', adminController.deleteProduct);

// ============ PEDIDOS ============
router.get('/admin/orders', adminController.getAllOrders);
router.get('/admin/orders/:id', adminController.getOrder);
router.put('/admin/orders/:id/status', adminController.updateOrderStatus);

// ============ USUARIOS ============
router.get('/admin/users', adminController.getAllUsers);
router.get('/admin/users/:id', adminController.getUser);
router.put('/admin/users/:id', adminController.updateUser);

module.exports = router;