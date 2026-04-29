# Task Checklist

## Phase 5: Dynamic Product Variants

- [x] Create Database migration for `product_variants`, `product_variant_options`, and alter `cart_items`, `order_items`
- [x] Refactor `models/productModel.js` to handle variant CRUD operations
- [x] Refactor `controllers/productController.js` to process `variants` array from Request Body
- [x] Refactor `models/cartModel.js` to support `variant_id` (Internal ID lookup & UUID exposure)
- [x] Refactor `controllers/cartController.js` to validate specific variant stock
- [x] Refactor `models/orderModel.js` to deduct stock from correct variant and save variant details in `order_items`
- [x] Refactor `controllers/orderController.js` for checkout logic adaptation
