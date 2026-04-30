# 📡 API Reference — Marketplace Service

> Base URL: `http://localhost:3000/api`
> Auth: ส่ง `Authorization: Bearer <token>` ใน Header

---

## 🔐 Auth (`/api/auth`)

### POST `/auth/register` — สมัครสมาชิก
- **Auth:** ไม่ต้อง
- **Body:**
```json
{
    "email": "user@example.com",
    "password": "123456",
    "full_name": "John Doe",
    "role": "buyer"           // "buyer" หรือ "seller"
}
```
- **Response:**
```json
{
    "success": true,
    "data": { "id": "uuid", "email": "...", "full_name": "...", "role": "buyer" }
}
```

---

### POST `/auth/login` — เข้าสู่ระบบ
- **Auth:** ไม่ต้อง
- **Body:**
```json
{ "email": "user@example.com", "password": "123456" }
```
- **Response:**
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": "uuid",
        "email": "user@example.com",
        "full_name": "John Doe",
        "roles": ["buyer"],
        "permissions": ["order.create", "order.read.own"]
    }
}
```

---

### GET `/auth/me` — ดูข้อมูลตัวเอง
- **Auth:** 🔒 Login
- **Response:**
```json
{
    "success": true,
    "user": { "id": "uuid", "email": "...", "full_name": "...", "status": "active", "roles": [...], "permissions": [...] }
}
```

---

## 🏪 Store (`/api/stores`)

### POST `/stores` — สร้างร้านค้า
- **Auth:** 🔒 Seller
- **Body:**
```json
{ "name": "My Shop", "description": "ร้านขายของ" }
```
- **Response:**
```json
{ "success": true, "data": { "id": "uuid", "name": "My Shop" } }
```

---

### GET `/stores/me` — ดูร้านของตัวเอง
- **Auth:** 🔒 Seller
- **Response:**
```json
{
    "success": true,
    "data": { "id": "uuid", "name": "My Shop", "description": "...", "status": "active" }
}
```

---

### PUT `/stores/:uuid` — อัปเดตร้าน
- **Auth:** 🔒 Seller / Admin
- **Body:**
```json
{ "name": "New Name", "description": "New Description" }
```

---

## 📦 Products (`/api/products`)

### GET `/products` — ดูสินค้าทั้งหมด (Active)
- **Auth:** ไม่ต้อง
- **Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "name": "iPhone 15 Pro",
            "description": "...",
            "price": "48900.00",
            "stock": 25,
            "status": "active",
            "image_url": "filename.jpg",
            "created_at": "...",
            "category": { "id": "uuid", "name": "Smartphones" },
            "attributes": [
                { "id": "uuid", "name": "Brand", "value": "Apple" }
            ],
            "images": [
                { "id": "uuid", "url": "file1.jpg", "is_primary": true },
                { "id": "uuid", "url": "file2.jpg", "is_primary": false }
            ],
            "variants": [
                {
                    "id": "uuid",
                    "sku": "IP15-BLK-256",
                    "price": "48900.00",
                    "stock": 10,
                    "image_url": null,
                    "options": [
                        { "name": "Color", "value": "Black" },
                        { "name": "Storage", "value": "256GB" }
                    ]
                }
            ]
        }
    ]
}
```

---

### GET `/products/search` — ค้นหา + กรอง + แบ่งหน้า
- **Auth:** ไม่ต้อง
- **Query Parameters:**

| Param | ตัวอย่าง | คำอธิบาย |
|---|---|---|
| `q` | `?q=iPhone` | ค้นหาจากชื่อ + description |
| `category` | `?category=uuid` | กรองตามหมวดหมู่ (รวมหมวดย่อย) |
| `min_price` | `?min_price=1000` | ราคาต่ำสุด |
| `max_price` | `?max_price=50000` | ราคาสูงสุด |
| `store` | `?store=uuid` | กรองตามร้านค้า |
| `attr_{name}` | `?attr_Brand=Apple` | กรองตาม Attribute |
| `sort` | `?sort=price_asc` | `newest`, `oldest`, `price_asc`, `price_desc`, `name_asc`, `name_desc` |
| `page` | `?page=1` | หน้าที่ (default: 1) |
| `limit` | `?limit=20` | ต่อหน้า (default: 20, max: 100) |

- **Response:**
```json
{
    "success": true,
    "data": [ ...products ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 156,
        "total_pages": 8,
        "has_next": true,
        "has_prev": false
    }
}
```

---

### GET `/products/:uuid` — ดูรายละเอียดสินค้า
- **Auth:** ไม่ต้อง
- **Response:** เหมือน GET `/products` แต่ได้ 1 ชิ้น

---

### GET `/products/seller/me` — ดูสินค้าของร้านตัวเอง
- **Auth:** 🔒 Seller
- **Response:** เหมือน GET `/products` แต่แสดงทุกสถานะ (รวม inactive)

---

### POST `/products` — สร้างสินค้า
- **Auth:** 🔒 Seller (permission: product.create)
- **Content-Type:** `multipart/form-data`
- **Body:**

| Key | Type | Required | คำอธิบาย |
|---|---|---|---|
| `name` | Text | ✅ | ชื่อสินค้า |
| `price` | Text | ✅ | ราคา |
| `stock` | Text | ❌ | สต็อก (default: 0) |
| `status` | Text | ❌ | `active` / `inactive` (default: active) |
| `description` | Text | ❌ | คำอธิบาย |
| `category_id` | Text | ❌ | UUID ของหมวดหมู่ |
| `images` | File | ✅ | ไฟล์รูปภาพ (1-10 รูป) |
| `variants` | Text | ❌ | JSON Array ของ variants |
| `attributes` | Text | ❌ | JSON Array ของ attributes |

**variants format:**
```json
[
    {
        "price": 48900,
        "stock": 10,
        "sku": "IP15-BLK-256",
        "options": { "Color": "Black", "Storage": "256GB" }
    }
]
```

**attributes format:**
```json
[
    { "attribute_id": "uuid-of-attribute", "value": "Apple" }
]
```

- **Response:**
```json
{
    "success": true,
    "data": { "id": "uuid", "name": "...", "price": 48900, "stock": 25, "has_variants": true }
}
```

---

### PUT `/products/:uuid` — อัปเดตสินค้า
- **Auth:** 🔒 Seller (เจ้าของ) / Admin
- **Content-Type:** `multipart/form-data`
- **Body:** เหมือน POST แต่ไม่บังคับ images

---

### DELETE `/products/:uuid` — ลบสินค้า
- **Auth:** 🔒 Seller (เจ้าของ) / Admin

---

## 📂 Categories (`/api/categories`)

### GET `/categories` — ดูหมวดหมู่ทั้งหมด (Tree)
- **Auth:** ไม่ต้อง
- **Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "name": "Electronics",
            "description": "...",
            "image_url": null,
            "level": 0,
            "path": "/1/",
            "children": [
                { "id": "uuid", "name": "Smartphones", "children": [] },
                { "id": "uuid", "name": "Laptops", "children": [] }
            ]
        }
    ]
}
```

---

### GET `/categories/:uuid` — ดูหมวดหมู่ + สินค้า
- **Auth:** ไม่ต้อง
- **Response:**
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "name": "Smartphones",
        "children": [...],
        "products": [{ "id": "uuid", "name": "...", "price": "...", "image_url": "..." }]
    }
}
```

---

### GET `/categories/:uuid/attributes` — ดู Attributes ของหมวดหมู่
- **Auth:** ไม่ต้อง
- **Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "name": "Brand",
            "input_type": "select",
            "is_required": true,
            "sort_order": 1,
            "values": [
                { "id": "uuid", "value": "Apple" },
                { "id": "uuid", "value": "Samsung" }
            ]
        }
    ]
}
```

---

### POST `/categories` — สร้างหมวดหมู่
- **Auth:** 🔒 Admin
- **Body:**
```json
{ "name": "Tablets", "description": "...", "parent_id": "uuid-of-parent", "image_url": "..." }
```

### PUT `/categories/:uuid` — อัปเดตหมวดหมู่
- **Auth:** 🔒 Admin

### DELETE `/categories/:uuid` — ลบหมวดหมู่
- **Auth:** 🔒 Admin

---

### POST `/categories/:uuid/attributes` — เพิ่ม Attribute ให้หมวด
- **Auth:** 🔒 Admin
- **Body:**
```json
{
    "name": "Brand",
    "input_type": "select",
    "is_required": true,
    "sort_order": 1,
    "values": ["Apple", "Samsung", "Xiaomi"]
}
```

### PUT `/categories/attributes/:uuid` — อัปเดต Attribute
- **Auth:** 🔒 Admin

### DELETE `/categories/attributes/:uuid` — ลบ Attribute
- **Auth:** 🔒 Admin

### POST `/categories/attributes/:uuid/values` — เพิ่มค่าตัวเลือก
- **Auth:** 🔒 Admin
- **Body:** `{ "value": "OPPO", "sort_order": 5 }`

### DELETE `/categories/attributes/values/:uuid` — ลบค่าตัวเลือก
- **Auth:** 🔒 Admin

---

## 🛒 Cart (`/api/cart`)

### GET `/cart` — ดูตะกร้า
- **Auth:** 🔒 Login
- **Response:**
```json
{
    "success": true,
    "cartId": "uuid",
    "items": [
        {
            "id": "cart-item-uuid",
            "product": {
                "id": "product-uuid",
                "name": "iPhone 15 Pro",
                "image_url": "file.jpg",
                "price": "48900.00",
                "stock": 10,
                "variant": {
                    "id": "variant-uuid",
                    "sku": "IP15-BLK-256",
                    "options": [{ "option_name": "Color", "option_value": "Black" }]
                }
            },
            "quantity": 2
        }
    ]
}
```

---

### POST `/cart/items` — เพิ่มสินค้าลงตะกร้า
- **Auth:** 🔒 Login
- **Body:**
```json
{
    "product_id": "uuid-of-product",
    "variant_id": "uuid-of-variant",     // ❌ optional ถ้าไม่มี variant
    "quantity": 1
}
```

---

### PUT `/cart/items/:uuid` — อัปเดตจำนวน
- **Auth:** 🔒 Login
- **Body:**
```json
{ "quantity": 3 }
```

---

### DELETE `/cart/items/:uuid` — ลบจากตะกร้า
- **Auth:** 🔒 Login

---

## 📋 Orders (`/api/orders`)

### POST `/orders` — สร้าง Order (จากตะกร้า)
- **Auth:** 🔒 Buyer (permission: order.create)
- **Body:**
```json
{ "shipping_address": "123 ถนนสุขุมวิท กรุงเทพฯ 10110" }
```
- **หมายเหตุ:** ระบบจะแยก Order ตามร้านค้าอัตโนมัติ + ตัด Stock ทันที
- **Response:**
```json
{
    "success": true,
    "data": { "order_ids": ["uuid-order-1", "uuid-order-2"] }
}
```

---

### GET `/orders/me` — ดู Order ของตัวเอง (Buyer)
- **Auth:** 🔒 Buyer
- **Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "total_amount": "48900.00",
            "status": "pending",
            "shipping_address": "123 ...",
            "created_at": "...",
            "items": [
                {
                    "id": "uuid",
                    "product_name": "iPhone 15 Pro",
                    "variant_details": "Color: Black, Storage: 256GB",
                    "price": "48900.00",
                    "quantity": 1
                }
            ]
        }
    ]
}
```

---

### GET `/orders/seller` — ดู Order ของร้าน (Seller)
- **Auth:** 🔒 Seller (permission: order.manage.seller)

---

### PATCH `/orders/seller/:uuid/status` — อัปเดตสถานะ Order
- **Auth:** 🔒 Seller / Admin
- **Body:**
```json
{ "status": "shipped" }
```
- **สถานะที่รองรับ:** `pending` → `paid` → `processing` → `shipped` → `delivered` → `cancelled`

---

### GET `/orders/admin` — ดู Order ทั้งหมด (Admin)
- **Auth:** 🔒 Admin

---

## 🔑 Roles & Permissions

| Role | สิทธิ์หลัก |
|---|---|
| `buyer` | ซื้อสินค้า, จัดการตะกร้า, สร้าง Order, ดู Order ตัวเอง |
| `seller` | ทุกอย่างของ buyer + สร้างร้าน, จัดการสินค้า, จัดการ Order ร้าน |
| `admin` | ทุกอย่าง + จัดการหมวดหมู่, ดู Order ทั้งหมด |
| `super_admin` | ทุกอย่าง |

---

## 📁 Static Files

รูปภาพสินค้าเข้าถึงได้ที่:
```
http://localhost:3000/images/products/<filename>
```
