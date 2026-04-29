const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/permissionMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/attributes', categoryController.getCategoryAttributes);

// Admin only routes — Category CRUD
router.post('/', verifyToken, requireRole(['admin', 'super_admin']), categoryController.createCategory);
router.put('/:id', verifyToken, requireRole(['admin', 'super_admin']), categoryController.updateCategory);
router.delete('/:id', verifyToken, requireRole(['admin', 'super_admin']), categoryController.deleteCategory);

// Admin only routes — Attribute CRUD
router.post('/:id/attributes', verifyToken, requireRole(['admin', 'super_admin']), categoryController.createCategoryAttribute);
router.put('/attributes/:id', verifyToken, requireRole(['admin', 'super_admin']), categoryController.updateCategoryAttribute);
router.delete('/attributes/:id', verifyToken, requireRole(['admin', 'super_admin']), categoryController.deleteCategoryAttribute);

// Admin only routes — Attribute Values
router.post('/attributes/:id/values', verifyToken, requireRole(['admin', 'super_admin']), categoryController.addAttributeValue);
router.delete('/attributes/values/:id', verifyToken, requireRole(['admin', 'super_admin']), categoryController.removeAttributeValue);

module.exports = router;
