# Task Checklist

## Phase 4: Dual-ID System Refactoring (BIGINT + UUID)

- [x] Create `database/schema_v2.sql` with unified schema (BIGINT + UUID)
- [x] Refactor `models/userModel.js` (Add UUID generation, change queries)
- [x] Refactor `models/storeModel.js` (Add UUID, update queries)
- [x] Refactor `models/productModel.js` (Add UUID, update queries)
- [x] Refactor `models/cartModel.js` & `models/orderModel.js` (Handle internal IDs for logic but return UUIDs to user)
- [x] Refactor `controllers/authController.js` (Return UUID as `id`)
- [x] Refactor `controllers/storeController.js` (Expect and return UUIDs)
- [x] Refactor `controllers/productController.js` (Expect and return UUIDs)
- [x] Refactor `controllers/cartController.js` (Internal logic mainly, but ensure safe ID mapping)
- [x] Refactor `controllers/orderController.js` (Return UUIDs)
- [x] Refactor `middlewares/authMiddleware.js` (Ensure JWT stores internal ID for fast DB lookups)
