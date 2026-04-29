# สรุปผลการสร้างระบบหมวดหมู่สินค้า (Product Categories)

ระบบหมวดหมู่สินค้าพร้อมใช้งานแล้ว รองรับ **หมวดหมู่ย่อยแบบลำดับชั้น** (เช่น Electronics → Smartphones → Android)

## ไฟล์ที่สร้าง/แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `database/phase5_categories.sql` | **[NEW]** SQL เพิ่ม `parent_id`, `image_url` และ Seed หมวดย่อย |
| `models/categoryModel.js` | **[NEW]** CRUD + Tree structure |
| `controllers/categoryController.js` | **[NEW]** จัดการ API ทั้งหมด |
| `routes/categoryRoutes.js` | **[NEW]** เส้นทาง API |
| `app.js` | **[MODIFIED]** ลงทะเบียน `/api/categories` |
| `models/productModel.js` | **[MODIFIED]** เพิ่ม `attachCategoryToProducts` |
| `controllers/productController.js` | **[MODIFIED]** เพิ่ม `category` ใน response + แปลง UUID |

## API Endpoints

| Method | Endpoint | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| `GET` | `/api/categories` | Public | ดึงหมวดหมู่ทั้งหมดแบบ **Tree** (ซ้อนลำดับชั้น) |
| `GET` | `/api/categories/:uuid` | Public | ดึงหมวดหมู่เดียว + สินค้าในหมวด + หมวดย่อย |
| `POST` | `/api/categories` | Admin | สร้างหมวดหมู่ (ส่ง `parent_id` เป็น UUID ถ้าเป็นหมวดย่อย) |
| `PUT` | `/api/categories/:uuid` | Admin | อัปเดตหมวดหมู่ |
| `DELETE` | `/api/categories/:uuid` | Admin | ลบหมวดหมู่ |

## ขั้นตอนการติดตั้ง

1. **รัน SQL** — เอาไฟล์ `database/phase5_categories.sql` ไปรันใน phpMyAdmin
2. **Restart Server** — `Ctrl + C` แล้วสั่ง `node server.js` ใหม่
3. **ทดสอบ** — ยิง `GET /api/categories` ดู Tree + ยิง `GET /api/products` ดูว่ามี `category` แนบมาด้วย

## ตัวอย่าง: สร้างสินค้าพร้อมหมวดหมู่

ตอนนี้ฟิลด์ `category_id` ใน `POST /api/products` ต้องส่งเป็น **UUID ของหมวดหมู่** (ไม่ใช่ตัวเลข) ระบบจะแปลงเป็น Internal ID ให้อัตโนมัติครับ
