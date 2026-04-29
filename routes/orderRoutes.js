const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireRole, requirePermission } = require('../middlewares/permissionMiddleware');

// Buyer routes
router.post('/', verifyToken, requirePermission('order.create'), orderController.createOrder);
router.get('/me', verifyToken, requirePermission('order.read.own'), orderController.getMyOrders);

// Seller routes
router.get('/seller', verifyToken, requirePermission('order.manage.seller'), orderController.getSellerOrders);
router.patch('/seller/:id/status', verifyToken, requirePermission('order.manage.seller'), orderController.updateOrderStatus);

// Admin routes
router.get('/admin', verifyToken, requireRole(['admin', 'super_admin']), orderController.getAllOrders);

module.exports = router;
