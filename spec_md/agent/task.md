# Task Checklist

## Phase 1: Auth + Role + Permission

- [x] Create Database schema and seed data for `users`, `roles`, `permissions`, `user_roles`, `role_permissions`
- [x] Install required packages (`bcrypt`, `jsonwebtoken`)
- [x] Implement `config/jwt.js`
- [x] Implement `middlewares/authMiddleware.js` (Token validation)
- [x] Implement `middlewares/permissionMiddleware.js` (Role & Permission checking)
- [x] Implement `models/userModel.js` (and role/permission models if needed)
- [x] Implement `controllers/authController.js` (Register, Login, Get Me)
- [x] Implement `routes/authRoutes.js`
- [x] Refactor `server.js` into `app.js` and `server.js` for better separation
- [x] Test the Auth endpoints

## Phase 2: Store + Seller Product

- [x] Create Database migration for `stores`, `product_categories`, `product_images` and alter `products`
- [x] Implement `models/storeModel.js`
- [x] Update `models/productModel.js` to support new schema and ownership
- [x] Implement `controllers/storeController.js`
- [x] Update `controllers/productController.js` (Seller scope vs Public scope)
- [x] Implement `routes/storeRoutes.js`
- [x] Update `routes/productRoutes.js` with Role/Permission middlewares
- [x] Update `app.js` with new routes

## Phase 3: Cart + Order

- [x] Create Database migration for `carts`, `cart_items`, `orders`, `order_items`
- [x] Implement `models/cartModel.js`
- [x] Implement `controllers/cartController.js`
- [x] Implement `routes/cartRoutes.js`
- [x] Implement `models/orderModel.js`
- [x] Implement `controllers/orderController.js`
- [x] Implement `routes/orderRoutes.js`
- [x] Update `app.js` with Cart and Order routes
