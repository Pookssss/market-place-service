const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/permissionMiddleware');

// เฉพาะ seller เท่านั้นที่จัดการร้านได้
router.post('/', verifyToken, requireRole(['seller']), storeController.createStore);
router.get('/me', verifyToken, requireRole(['seller']), storeController.getMyStore);
router.put('/:id', verifyToken, requireRole(['seller', 'admin']), storeController.updateStore);

module.exports = router;
