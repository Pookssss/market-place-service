# แผนการพัฒนาระบบหมวดหมู่สินค้า (Product Categories)

ตอนนี้ตาราง `product_categories` มีอยู่ใน Database แล้ว แต่ **ยังไม่มี API สำหรับจัดการ** และตารางยังเป็นแบบ Flat (ไม่มีลำดับชั้น) อีกทั้งยังไม่มี Model/Controller/Route ให้ใช้งานเลย

## สิ่งที่มีอยู่แล้ว
- ตาราง `product_categories` (id, uuid, name, description) — มีอยู่ใน `schema_v2.sql`
- Seed Data ตัวอย่าง 3 หมวด: Electronics, Clothing, Home & Garden
- ตาราง `products` มี `category_id` พร้อม FK อ้างอิงไปแล้ว

## สิ่งที่ขาด
- ❌ ไม่มี Model (`categoryModel.js`)
- ❌ ไม่มี Controller (`categoryController.js`)  
- ❌ ไม่มี Route (`categoryRoutes.js`)
- ❌ ไม่รองรับหมวดหมู่ย่อย (Sub-Category) แบบลำดับชั้น

---

## Proposed Changes

### 1. Database — ALTER ตาราง `product_categories`

เพิ่มคอลัมน์ `parent_id` เพื่อรองรับ **หมวดหมู่ย่อยแบบลำดับชั้น** (เช่น Electronics → Smartphones → Android)

```sql
ALTER TABLE product_categories 
ADD COLUMN parent_id BIGINT UNSIGNED NULL AFTER uuid,
ADD COLUMN image_url VARCHAR(500) NULL AFTER description,
ADD CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL;
```

### 2. [NEW] `models/categoryModel.js`

| Method | หน้าที่ |
|---|---|
| `getAll()` | ดึงหมวดหมู่ทั้งหมด (Flat list) |
| `getTree()` | ดึงหมวดหมู่แบบ Tree (ซ้อนลำดับชั้น parent → children) |
| `findByUuid(uuid)` | ค้นหาด้วย UUID |
| `create(data)` | สร้างหมวดหมู่ใหม่ |
| `update(id, data)` | อัปเดต |
| `delete(id)` | ลบ |

### 3. [NEW] `controllers/categoryController.js`

| Endpoint | สิทธิ์ | คำอธิบาย |
|---|---|---|
| `GET /api/categories` | Public | ดึงหมวดหมู่ทั้งหมดแบบ Tree |
| `GET /api/categories/:id` | Public | ดึงหมวดหมู่เดียว + สินค้าในหมวด |
| `POST /api/categories` | Admin | สร้างหมวดหมู่ใหม่ |
| `PUT /api/categories/:id` | Admin | อัปเดตหมวดหมู่ |
| `DELETE /api/categories/:id` | Admin | ลบหมวดหมู่ |

### 4. [NEW] `routes/categoryRoutes.js`

เพิ่ม Route ใหม่ + ลงทะเบียนใน `server.js`

### 5. อัปเดต Product Response

เพิ่มข้อมูลหมวดหมู่แนบมากับ Product Response:
```json
{
    "id": "uuid-product",
    "name": "iPhone 15",
    "category": {
        "id": "uuid-category",
        "name": "Smartphones"
    },
    ...
}
```

---

## ตัวอย่าง Category Tree Response

```json
[
    {
        "id": "uuid-1",
        "name": "Electronics",
        "children": [
            { "id": "uuid-4", "name": "Smartphones", "children": [] },
            { "id": "uuid-5", "name": "Laptops", "children": [] }
        ]
    },
    {
        "id": "uuid-2",
        "name": "Clothing",
        "children": [
            { "id": "uuid-6", "name": "Men", "children": [] },
            { "id": "uuid-7", "name": "Women", "children": [] }
        ]
    }
]
```

---

## Verification Plan

### Automated Tests
- ยิง `POST /api/categories` สร้างหมวดหมู่หลักและหมวดหมู่ย่อย
- ยิง `GET /api/categories` ดู Tree ว่าซ้อนลำดับชั้นถูกต้อง
- สร้าง Product พร้อม `category_id` แล้วยิง `GET /api/products` ดูว่ามีข้อมูล `category` แนบมาด้วย

> [!IMPORTANT]
> **ยืนยัน (Approve) ได้เลยครับถ้าตรงตามที่ต้องการ** ผมจะลงมือสร้างไฟล์ SQL, Model, Controller, Route และอัปเดต Product Response ให้ครบทั้งหมดครับ
