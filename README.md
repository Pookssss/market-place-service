# 🛒 Marketplace API

ระบบ Backend สำหรับ E-commerce Marketplace แบบ Multi-Vendor (ล้อเลียน Shopee)  
สร้างด้วย **Node.js + Express + MySQL** พร้อมระบบ Dual-ID (BIGINT + UUID) เพื่อความปลอดภัยและประสิทธิภาพ

---

## ✨ Features

- 🔐 **Authentication** — Register / Login ด้วย JWT + bcrypt
- 👥 **Role-Based Access Control** — buyer / seller / admin / super_admin พร้อมระบบ Permission
- 🏪 **Store Management** — ผู้ขายสร้างและจัดการร้านค้าของตัวเอง
- 📦 **Product Management** — CRUD สินค้าพร้อมระบบอัปโหลดรูปภาพหลายรูป
- 🎨 **Dynamic Variants** — ตัวเลือกสินค้า (สี/ขนาด/ความจุ) แต่ละตัวเลือกมีราคาและสต็อกแยกกัน
- 📂 **Hierarchical Categories** — หมวดหมู่สินค้าแบบลำดับชั้น (Tree) พร้อม `level` + `path` สำหรับ Query ที่เร็ว
- 🏷️ **Category Attributes** — คุณลักษณะสินค้าตามหมวดหมู่แบบ Shopee (เช่น แบรนด์/ขนาด/วัสดุ)
- 🛒 **Cart System** — ตะกร้าสินค้ารองรับการเลือก Variant
- 📋 **Order System** — สั่งซื้อพร้อมตัด Stock อัตโนมัติ (แยกตาม Variant)
- 🔒 **Dual-ID Security** — ใช้ BIGINT ภายใน + UUID สำหรับ API เพื่อป้องกัน ID Enumeration

---

## 🛠️ Tech Stack

| เทคโนโลยี | เวอร์ชัน | หน้าที่               |
| --------- | -------- | --------------------- |
| Node.js   | 18+      | Runtime               |
| Express   | 5.x      | Web Framework         |
| MySQL     | 8.x      | Database              |
| JWT       | -        | Authentication        |
| bcrypt    | 6.x      | Password Hashing      |
| Multer    | 2.x      | File Upload           |
| dotenv    | -        | Environment Variables |

---

## 📁 Project Structure

```
├── app.js                          # Express app + route registration
├── server.js                       # Server entry point
├── .env                            # Environment variables
│
├── config/
│   └── db.js                       # MySQL connection pool
│
├── middleware/
│   └── upload.js                   # Multer config (file upload)
│
├── middlewares/
│   ├── authMiddleware.js           # JWT verification
│   └── permissionMiddleware.js     # Role & Permission checks
│
├── models/
│   ├── userModel.js
│   ├── storeModel.js
│   ├── productModel.js
│   ├── categoryModel.js
│   ├── categoryAttributeModel.js
│   ├── cartModel.js
│   └── orderModel.js
│
├── controllers/
│   ├── authController.js
│   ├── storeController.js
│   ├── productController.js
│   ├── categoryController.js
│   ├── cartController.js
│   └── orderController.js
│
├── routes/
│   ├── authRoutes.js               # /api/auth
│   ├── storeRoutes.js              # /api/stores
│   ├── productRoutes.js            # /api/products
│   ├── categoryRoutes.js           # /api/categories
│   ├── cartRoutes.js               # /api/cart
│   └── orderRoutes.js              # /api/orders
│
├── database/
│   ├── schema_v2.sql               # Consolidated schema
│   └── phase*.sql                  # Migration files
│
└── public/images/products/         # Uploaded images
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+
- npm

### 1. Clone & Install

```bash
git clone <repository-url>
cd e-commerge
npm install
```

### 2. Environment Variables

สร้างไฟล์ `.env` ที่ Root ของโปรเจกต์:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ecommerce_db
JWT_SECRET=your-secret-key-here
PORT=3000
```

### 3. Database Setup

สร้าง Database และรัน SQL ตามลำดับใน phpMyAdmin หรือ MySQL CLI:

```sql
CREATE DATABASE IF NOT EXISTS ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce_db;
```

จากนั้นรันไฟล์ SQL ตามลำดับ:

1. `database/schema_v2.sql` — โครงสร้างหลัก (Dual-ID + RBAC + Store/Product/Cart/Order)
2. `database/phase4_variants.sql` — ระบบ Variants + cart/order ที่รองรับ variant
3. `database/phase5_categories.sql` — หมวดหมู่ลำดับชั้น (parent_id + image_url)
4. `database/phase5_1_category_path.sql` — เพิ่ม level/path และ index สำหรับ query แบบ tree
5. `database/phase5_2_category_attributes.sql` — ระบบ Category Attributes + product attribute values
6. `database/phase5_3_screen_size.sql` — (Optional) seed ค่าหน้าจอของ Smartphones
7. `database/phase6_search_indexes.sql` — (Recommended) index สำหรับ search/filter ให้เร็วขึ้น
8. `database/phase7_store_profiles.sql` — เพิ่ม profile_image_url/cover_image_url สำหรับร้านค้า

> หมายเหตุ: สำหรับการติดตั้งใหม่บน server ให้ใช้ลำดับด้านบนเท่านั้น

#### SQL File Status (ใช้ / ไม่ใช้)

- `database/schema_v2.sql` : ใช้ (ฐานหลัก)
- `database/phase4_variants.sql` : ใช้
- `database/phase5_categories.sql` : ใช้
- `database/phase5_1_category_path.sql` : ใช้
- `database/phase5_2_category_attributes.sql` : ใช้
- `database/phase5_3_screen_size.sql` : ใช้แบบ Optional (เป็น data patch)
- `database/phase6_search_indexes.sql` : ใช้แบบ Recommended (ด้าน performance)
- `database/phase7_store_profiles.sql` : ใช้ (จำเป็นถ้าต้องอัปโหลดรูปโปรไฟล์/ปกร้าน)
- `database/phase1_auth.sql` : ไม่ใช้ (schema เก่าก่อนรวม v2)
- `database/phase2_store_product.sql` : ไม่ใช้ (schema เก่าก่อนรวม v2)
- `database/phase3_cart_order.sql` : ไม่ใช้ (schema เก่าก่อนรวม v2)

### 4. Start Server

```bash
node server.js
```

Server จะทำงานที่ `http://localhost:3000`

---

## 📡 API Reference

### Auth

| Method | Endpoint             | Body                             | คำอธิบาย                    |
| ------ | -------------------- | -------------------------------- | --------------------------- |
| `POST` | `/api/auth/register` | `{ email, password, full_name }` | สมัครสมาชิก                 |
| `POST` | `/api/auth/login`    | `{ email, password }`            | เข้าสู่ระบบ → ได้ JWT Token |

### Stores

| Method | Endpoint         | Auth   | คำอธิบาย        |
| ------ | ---------------- | ------ | --------------- |
| `POST` | `/api/stores`    | Seller | สร้างร้านค้า    |
| `GET`  | `/api/stores/me` | Seller | ดูร้านของตัวเอง |
| `PUT`  | `/api/stores/me` | Seller | อัปเดตร้าน      |

### Products

| Method   | Endpoint                  | Auth         | คำอธิบาย                          |
| -------- | ------------------------- | ------------ | --------------------------------- |
| `GET`    | `/api/products`           | -            | ดูสินค้าทั้งหมด                   |
| `GET`    | `/api/products/:uuid`     | -            | ดูรายละเอียดสินค้า                |
| `GET`    | `/api/products/seller/me` | Seller       | ดูสินค้าของตัวเอง                 |
| `POST`   | `/api/products`           | Seller       | สร้างสินค้า (multipart/form-data) |
| `PUT`    | `/api/products/:uuid`     | Seller/Admin | อัปเดตสินค้า                      |
| `DELETE` | `/api/products/:uuid`     | Seller/Admin | ลบสินค้า                          |

### Categories

| Method | Endpoint                           | Auth  | คำอธิบาย                  |
| ------ | ---------------------------------- | ----- | ------------------------- |
| `GET`  | `/api/categories`                  | -     | ดูหมวดหมู่ทั้งหมด (Tree)  |
| `GET`  | `/api/categories/:uuid`            | -     | ดูหมวดหมู่ + สินค้า       |
| `GET`  | `/api/categories/:uuid/attributes` | -     | ดู Attributes ของหมวดหมู่ |
| `POST` | `/api/categories`                  | Admin | สร้างหมวดหมู่             |
| `POST` | `/api/categories/:uuid/attributes` | Admin | เพิ่ม Attribute           |

### Cart

| Method   | Endpoint                | Auth  | คำอธิบาย                                            |
| -------- | ----------------------- | ----- | --------------------------------------------------- |
| `GET`    | `/api/cart`             | Buyer | ดูตะกร้า                                            |
| `POST`   | `/api/cart/items`       | Buyer | เพิ่มสินค้า `{ product_id, variant_id?, quantity }` |
| `PUT`    | `/api/cart/items/:uuid` | Buyer | อัปเดตจำนวน                                         |
| `DELETE` | `/api/cart/items/:uuid` | Buyer | ลบจากตะกร้า                                         |

### Orders

| Method | Endpoint                   | Auth         | คำอธิบาย                           |
| ------ | -------------------------- | ------------ | ---------------------------------- |
| `POST` | `/api/orders`              | Buyer        | สร้าง Order `{ shipping_address }` |
| `GET`  | `/api/orders/me`           | Buyer        | ดู Orders ของตัวเอง                |
| `GET`  | `/api/orders/seller`       | Seller       | ดู Orders ของร้าน                  |
| `PUT`  | `/api/orders/:uuid/status` | Seller/Admin | อัปเดตสถานะ                        |

---

## 🗄️ Database Schema

ระบบใช้ **Dual-ID Architecture**:

- `id` (BIGINT) → ใช้ภายในสำหรับ Foreign Keys และ Index
- `uuid` (CHAR 36) → ใช้สำหรับ API Response เพื่อป้องกัน ID Enumeration

**18 ตาราง:** users, roles, permissions, user_roles, role_permissions, stores, product_categories, category_attributes, category_attribute_values, products, product_images, product_variants, product_variant_options, product_attribute_values, carts, cart_items, orders, order_items

---

## 📄 License

ISC
