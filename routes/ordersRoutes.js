const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/orders', ordersController.listOrders);
router.get('/orders/:id', ordersController.getOrder);
router.post('/orders', ordersController.createOrder);

module.exports = router;
