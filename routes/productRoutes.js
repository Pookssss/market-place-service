const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireRole, requirePermission } = require('../middlewares/permissionMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);

// Seller / Admin routes
// Get products for the logged in seller
router.get('/seller/me', verifyToken, requireRole(['seller']), productController.getMyProducts);

// Create product (Requires seller role and product.create permission)
router.post('/', verifyToken, requirePermission('product.create'), upload.array('images', 10), productController.createProduct);

// Update product (Requires product.update.own or product.manage.all)
// (Ownership is checked inside the controller)
router.put('/:id', verifyToken, requireRole(['seller', 'admin']), upload.array('images', 10), productController.updateProduct);

// Delete product
router.delete('/:id', verifyToken, requireRole(['seller', 'admin']), productController.deleteProduct);

module.exports = router;
