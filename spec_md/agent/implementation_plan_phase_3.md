# แผนการอัปเกรดระบบ E-commerce เป็น Mini Marketplace

เป้าหมายหลักคือการเปลี่ยนระบบ CRUD สินค้าธรรมดา ให้กลายเป็น Marketplace ขนาดย่อมที่รองรับ ผู้ซื้อ (Buyer), ผู้ขาย (Seller) และผู้ดูแลระบบ (Admin) โดยมีระบบ Role & Permission แบบ Dynamic 

## 1. Architecture Summary

สถาปัตยกรรมของระบบจะใช้หลักการ **MVC (Model-View-Controller) ผสมกับ Service Layer** เพื่อแยก Business Logic ออกจาก Controller ทำให้โค้ดอ่านง่าย ตรวจสอบได้ และขยายต่อได้ง่าย

**Tech Stack:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (ผ่าน XAMPP)
- **Database Driver:** `mysql2/promise` (ใช้คำสั่ง SQL โดยตรง ไม่ใช้ ORM เพื่อประสิทธิภาพและความยืดหยุ่น)
- **Authentication:** JWT (JSON Web Token) ควบคู่กับ bcrypt สำหรับการเข้ารหัสรหัสผ่าน

**Folder Structure (โครงสร้างโปรเจกต์):**
```text
src/
├── config/        # การตั้งค่าต่างๆ เช่น database, jwt
├── controllers/   # รับ Request จาก Route และส่ง Response กลับ
├── services/      # จัดการ Business Logic ทั้งหมด 
├── models/        # จัดการคำสั่ง SQL Database (Query)
├── routes/        # กำหนด API Endpoint
├── middlewares/   # ดักจับ Request (Auth, Role, Permission, Error Handler)
├── utils/         # ฟังก์ชันช่วยเหลือ (Helper functions)
├── validators/    # ตรวจสอบความถูกต้องของ Input data
├── database/      # สคริปต์ Database SQL, Migration, Seeders
```

**Security & Scalability:**
- **Dynamic Authorization:** ตรวจสอบสิทธิ์ (Permission) จาก Database ทุก Request (หรือผ่าน Cache ในอนาคต) ไม่พึ่งพาแค่ชื่อ Role เพื่อความยืดหยุ่น
- **Data Integrity:** ใช้ Prepared Statements ป้องกัน SQL Injection
- แยก `app.js` (Express config) และ `server.js` (Listen port) เพื่อให้ง่ายต่อการทำ Unit Test ในอนาคต

---

## 2. Database Design (Schema)

การออกแบบฐานข้อมูลแบ่งเป็นกลุ่มเพื่อให้เห็นภาพความสัมพันธ์ได้ชัดเจน

### 2.1 Auth & Authorization Group
- **`users`**: ข้อมูลผู้ใช้งาน (`id`, `email`, `password_hash`, `full_name`, `status`, `created_at`)
- **`roles`**: กำหนดกลุ่มผู้ใช้งาน (`id`, `name`, `description`) เช่น `buyer`, `seller`, `admin`
- **`permissions`**: กำหนดสิทธิ์การกระทำ (`id`, `name`, `description`) เช่น `product.create`, `order.manage`
- **`user_roles`**: ตารางเชื่อมผู้ใช้กับบทบาท (`user_id`, `role_id`) - 1 คนมีได้หลายบทบาท
- **`role_permissions`**: ตารางเชื่อมบทบาทกับสิทธิ์ (`role_id`, `permission_id`)

### 2.2 Marketplace & Product Group
- **`stores`**: ข้อมูลร้านค้า (`id`, `seller_id`, `name`, `description`, `status`)
- **`product_categories`**: หมวดหมู่สินค้า (`id`, `name`)
- **`products` (Alter จากเดิม)**: ข้อมูลสินค้า (`id`, `store_id`, `category_id`, `name`, `description`, `price`, `stock`, `status`, `created_at`, `updated_at`) 
  *(สถานะ: draft, active, inactive, banned)*
- **`product_images`**: รูปภาพสินค้า (`id`, `product_id`, `image_url`, `is_primary`)

### 2.3 Transaction Group
- **`carts` & `cart_items`**: ตะกร้าสินค้าและรายการในตะกร้า
- **`orders` & `order_items`**: คำสั่งซื้อ (รองรับแยก store_id เพื่อให้ 1 order สั่งจากหลายร้านได้ หรือแบ่ง order ตามร้าน)
- **`payments`**: ข้อมูลการชำระเงิน
- **`shipping_addresses`**: ที่อยู่จัดส่ง

---

## 3. แผนการพัฒนา (Phases)

เพื่อให้ระบบเสถียรและทดสอบได้ง่าย จะแบ่งการเขียนโค้ดออกเป็น 5 Phase ดังนี้:

- **Phase 1: Auth + Role + Permission (โฟกัสในรอบถัดไป)**
  - สร้าง SQL สำหรับตาราง users, roles, permissions
  - สร้าง middlewares สำหรับ `auth`, `requireRole`, `requirePermission`
  - สร้าง API: Register, Login, Get Me
- **Phase 2: Store + Seller Product**
  - สร้างและเชื่อมต่อ Store กับ User (Seller)
  - ปรับปรุงตาราง Products
  - สร้าง API จัดการสินค้าแบบระบุความเป็นเจ้าของ (Ownership)
- **Phase 3: Cart + Order**
  - ระบบตะกร้าสินค้า
  - ระบบ Checkout สร้าง Order
- **Phase 4: Admin Dashboard**
  - API สำหรับแอดมินดูสรุปรวม จัดการ Users, Stores, Products
- **Phase 5: Payment/Shipping Mock**
  - จำลองระบบจ่ายเงินและส่งของ

---

## User Review Required

> [!IMPORTANT]
> โปรดตรวจสอบ **Architecture Summary** และ **Database Design** รวมถึง **Phases การทำงาน** ด้านบนนี้ ว่าตรงตามความต้องการของ Portfolio Mini Marketplace หรือไม่ 
>
> หากยืนยันแผนนี้ ผมจะเริ่มดำเนินการ **Phase 1: Auth + Role + Permission** โดยจะทยอยสร้าง SQL, Middleware และ Controller ให้ทีละส่วนครับ
