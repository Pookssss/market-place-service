คุณคือ Senior Backend Engineer / System Architect

ตอนนี้มี Backend E-commerce ด้วย Node.js + Express.js + MySQL XAMPP แล้ว
Database: ecommerce_db
Table เดิม: products

ต้องการอัปเกรดระบบให้กลายเป็น Marketplace ขนาดย่อม คล้าย Shopee / Lazada เพื่อใช้เป็น Portfolio

เป้าหมาย:
ออกแบบ Backend ให้รองรับผู้ใช้งานหลายประเภท:

1. ผู้ซื้อ buyer
2. ผู้ขาย seller
3. แอดมิน admin

แต่ละประเภทต้องมี role level หรือ permission level ควบคุมสิทธิ์อีกชั้นหนึ่ง
เช่น buyer ทั่วไป, seller ธรรมดา, seller verified, admin, super admin

ข้อสำคัญ:

- ต้องออกแบบให้ dynamic และขยายต่อได้ในอนาคต
- ไม่ hardcode role ไว้ใน code มากเกินไป
- ควรมีระบบ roles, permissions, user_roles หรือ role_permissions
- รองรับการเพิ่ม role/permission ใหม่ในอนาคตโดยไม่ต้องแก้ code เยอะ
- products เดิมต้องปรับให้ผูกกับ seller/store ได้
- ใช้ Node.js + Express.js
- ใช้ JavaScript ไม่ใช้ TypeScript
- ใช้ MySQL
- ใช้ mysql2
- ใช้ dotenv
- ใช้ JWT Authentication
- ใช้ bcrypt สำหรับ hash password
- ใช้ middleware ตรวจสอบ token, role, permission
- response เป็น JSON
- โครงสร้างโปรเจกต์ต้องอ่านง่าย แยก routes, controllers, services, models, middlewares, config

ให้ช่วยออกแบบและสร้าง backend upgrade plan พร้อม code

สิ่งที่ต้องการ:

1. วิเคราะห์ระบบเดิม

- ตอนนี้มี table products แล้ว
- อธิบายว่าควรปรับ products อย่างไรให้รองรับ marketplace
- อธิบายว่าโปรเจกต์นี้คือ Mini Marketplace Portfolio

2. ออกแบบ Database Schema ใหม่
   ต้องมีอย่างน้อย:

- users
- roles
- permissions
- user_roles
- role_permissions
- stores หรือ shops
- products
- product_categories
- product_images
- carts
- cart_items
- orders
- order_items
- payments
- shipping_addresses

โดย products ต้องรองรับ:

- เจ้าของสินค้าเป็น seller หรือ store
- status เช่น draft, active, inactive, out_of_stock, banned
- category
- หลายรูปภาพ
- stock
- price
- created_at / updated_at

3. ออกแบบ Role / Permission
   ตัวอย่าง role:

- buyer
- seller
- verified_seller
- admin
- super_admin

ตัวอย่าง permission:

- product.read
- product.create
- product.update.own
- product.delete.own
- product.manage.all
- order.create
- order.read.own
- order.manage.seller
- user.manage
- role.manage
- admin.dashboard

ให้สรุปตาราง role-permission ที่เหมาะสม

4. สร้าง SQL Migration

- SQL สำหรับสร้าง table ใหม่ทั้งหมด
- SQL สำหรับ alter table products เดิมให้รองรับ seller/store
- SQL seed role และ permission เริ่มต้น
- SQL seed admin user ตัวอย่าง ถ้าจำเป็นให้บอกวิธี hash password ด้วย bcrypt

5. ออกแบบ API Routes
   ต้องมี route หลัก:
   Auth:

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

Users:

- GET /api/users/me
- PUT /api/users/me
- GET /api/admin/users
- PATCH /api/admin/users/:id/status

Roles/Permissions:

- GET /api/admin/roles
- POST /api/admin/roles
- GET /api/admin/permissions
- POST /api/admin/roles/:id/permissions

Stores:

- POST /api/seller/stores
- GET /api/seller/stores/me
- PUT /api/seller/stores/:id

Products:

- GET /api/products
- GET /api/products/:id
- POST /api/seller/products
- PUT /api/seller/products/:id
- DELETE /api/seller/products/:id
- PATCH /api/admin/products/:id/status

Cart:

- GET /api/cart
- POST /api/cart/items
- PUT /api/cart/items/:id
- DELETE /api/cart/items/:id

Orders:

- POST /api/orders
- GET /api/orders/me
- GET /api/seller/orders
- PATCH /api/seller/orders/:id/status
- GET /api/admin/orders

6. สร้างโครงสร้าง Folder
   ตัวอย่าง:
   src/
   config/
   controllers/
   services/
   models/
   routes/
   middlewares/
   utils/
   validators/
   database/
   app.js
   server.js

7. สร้าง Middleware สำคัญ

- authMiddleware ตรวจ JWT
- requireRole
- requirePermission
- requireOwnership สำหรับเช็คเจ้าของสินค้า/store/order
- errorHandler

8. อธิบายหลักการ Permission แบบ Dynamic
   เช่น:

- login แล้วดึง permissions จาก DB
- JWT เก็บ user id และ role เบื้องต้น
- ทุก request ตรวจ permission จาก DB หรือ cache
- ไม่ควรเช็คแค่ role string อย่างเดียว
- admin/super_admin สามารถเพิ่ม permission ในอนาคตได้

9. สร้าง Source Code ตัวอย่าง
   ขอ code ที่ copy ไปใช้ต่อได้:

- config/db.js
- config/jwt.js
- middlewares/authMiddleware.js
- middlewares/permissionMiddleware.js
- controllers/authController.js
- controllers/productController.js
- routes/authRoutes.js
- routes/productRoutes.js
- app.js
- server.js

10. ปรับ Products API เดิม
    จากเดิม products เป็นสินค้ารวม
    ให้ปรับเป็น:

- public GET เห็นเฉพาะ active products
- seller เพิ่ม/แก้ไข/ลบ ได้เฉพาะสินค้าของตัวเอง
- admin จัดการสินค้าได้ทุกตัว
- รองรับ store_id / seller_id

11. Security พื้นฐาน

- hash password ด้วย bcrypt
- JWT expire
- validate input
- ป้องกัน SQL Injection ด้วย prepared statement
- CORS config
- rate limit สำหรับ login
- ไม่ส่ง password กลับไปใน response

12. ขอคำอธิบายเป็นภาษาไทย

- อธิบายแบบเข้าใจง่าย
- แยกเป็น Phase การพัฒนา
- Phase 1: Auth + Role + Permission
- Phase 2: Store + Seller Product
- Phase 3: Cart + Order
- Phase 4: Admin Dashboard
- Phase 5: Payment/Shipping Mock

ข้อจำกัด:

- ใช้ JavaScript เท่านั้น
- ใช้ Express.js
- ใช้ MySQL จาก XAMPP
- ไม่ใช้ ORM ก่อน
- ใช้ mysql2/promise
- เน้นทำเป็น Portfolio ที่ดูมีสถาปัตยกรรมดี
- โค้ดต้องไม่ซับซ้อนเกินไปสำหรับเริ่มต้น แต่ขยายต่อได้
