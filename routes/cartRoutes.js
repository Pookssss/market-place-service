const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/authMiddleware');

// ทุกเส้นทางของตะกร้าต้อง Login (buyer/seller ก็ถือว่าเป็น user ซื้อของได้)
router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItemToCart);
router.put('/items/:id', cartController.updateCartItem);
router.delete('/items/:id', cartController.removeCartItem);

module.exports = router;
