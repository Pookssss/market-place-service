const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/permissionMiddleware');
const storeUpload = require('../middleware/storeUpload');

const uploadFields = storeUpload.fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'cover_image', maxCount: 1 }
]);

// เฉพาะ seller เท่านั้นที่จัดการร้านได้
router.post('/', verifyToken, requireRole(['seller']), uploadFields, storeController.createStore);
router.get('/me', verifyToken, requireRole(['seller']), storeController.getMyStore);
router.put('/:id', verifyToken, requireRole(['seller', 'admin']), uploadFields, storeController.updateStore);

// Public route (ไม่ต้องเช็ค Token) - ต้องอยู่ล่างสุดเพื่อไม่ให้ทับ /me
router.get('/:id', storeController.getPublicStore);
router.get('/:id/products', storeController.getPublicStoreWithProducts);

module.exports = router;
