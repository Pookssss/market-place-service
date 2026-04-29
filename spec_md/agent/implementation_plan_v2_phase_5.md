# แผนการพัฒนาระบบคุณลักษณะสินค้าตามหมวดหมู่ (Category Attributes)

ระบบนี้จะทำให้เมื่อผู้ขายเลือกหมวดหมู่ย่อยสุดท้าย (Leaf Category) ระบบจะบอกว่าต้องกรอกข้อมูลอะไรเพิ่มบ้าง เหมือนกับ Shopee

## ตัวอย่างการทำงาน

```
เสื้อผ้า > ผู้หญิง > กระโปรง
  → แบรนด์ (เลือก: Nike, Adidas, Uniqlo, ...)
  → ขนาด (เลือก: S, M, L, XL)
  → วัสดุ (เลือก: ผ้าฝ้าย, โพลีเอสเตอร์, ...)
  → ทรง (พิมพ์เอง)

อิเล็กทรอนิกส์ > มือถือ
  → แบรนด์ (เลือก: Apple, Samsung, ...)
  → RAM (เลือก: 4GB, 8GB, 16GB)
  → ความจุ (เลือก: 64GB, 128GB, 256GB)
```

---

## Database Design (3 ตารางใหม่)

### 1. `category_attributes` — กำหนดว่าหมวดหมู่นี้มี Attribute อะไรบ้าง

| Column | Type | คำอธิบาย |
|---|---|---|
| id | BIGINT PK | Internal |
| uuid | CHAR(36) | Public |
| category_id | BIGINT FK | ผูกกับ product_categories |
| name | VARCHAR(100) | ชื่อ Attribute เช่น "แบรนด์", "ขนาด" |
| input_type | ENUM | `select` (เลือกจาก list), `text` (พิมพ์เอง), `number` |
| is_required | BOOLEAN | บังคับกรอกหรือไม่ |
| sort_order | INT | ลำดับการแสดงผล |

### 2. `category_attribute_values` — ค่าตัวเลือกสำเร็จรูป (ใช้กับ input_type = select)

| Column | Type | คำอธิบาย |
|---|---|---|
| id | BIGINT PK | Internal |
| uuid | CHAR(36) | Public |
| attribute_id | BIGINT FK | ผูกกับ category_attributes |
| value | VARCHAR(100) | ค่าตัวเลือก เช่น "S", "M", "L" |
| sort_order | INT | ลำดับ |

### 3. `product_attribute_values` — เก็บค่าที่ผู้ขายเลือก/กรอกจริงๆ

| Column | Type | คำอธิบาย |
|---|---|---|
| id | BIGINT PK | Internal |
| product_id | BIGINT FK | สินค้าตัวไหน |
| attribute_id | BIGINT FK | คุณลักษณะตัวไหน |
| value | VARCHAR(255) | ค่าที่กรอก/เลือก |

---

## API Endpoints

### สำหรับ Admin (จัดการ Attributes ของหมวดหมู่)
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| `GET` | `/api/categories/:id/attributes` | ดึง Attributes ทั้งหมดของหมวดหมู่นี้ (พร้อมค่าตัวเลือก) |
| `POST` | `/api/categories/:id/attributes` | เพิ่ม Attribute ใหม่ให้หมวดหมู่ |
| `PUT` | `/api/categories/attributes/:id` | อัปเดต Attribute |
| `DELETE` | `/api/categories/attributes/:id` | ลบ Attribute |

### สำหรับ Seller (ตอนสร้างสินค้า)
- `POST /api/products` → รับ `attributes` เป็น Array เพิ่มเข้ามา:
```json
{
    "name": "กระโปรงสั้น",
    "category_id": "uuid-of-skirt-category",
    "price": 590,
    "attributes": [
        { "attribute_id": "uuid-brand", "value": "Uniqlo" },
        { "attribute_id": "uuid-size", "value": "M" },
        { "attribute_id": "uuid-material", "value": "ผ้าฝ้าย" }
    ],
    ...
}
```

### สำหรับ Buyer (ดูสินค้า)
- `GET /api/products/:id` → Response จะมี `attributes` แนบมา:
```json
{
    "name": "กระโปรงสั้น",
    "category": { "id": "uuid", "name": "กระโปรง" },
    "attributes": [
        { "name": "แบรนด์", "value": "Uniqlo" },
        { "name": "ขนาด", "value": "M" },
        { "name": "วัสดุ", "value": "ผ้าฝ้าย" }
    ]
}
```

---

## ไฟล์ที่ต้องสร้าง/แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `database/phase5_2_category_attributes.sql` | **[NEW]** สร้าง 3 ตาราง + Seed ตัวอย่าง |
| `models/categoryAttributeModel.js` | **[NEW]** CRUD Attributes + Values |
| `controllers/categoryController.js` | **[MODIFY]** เพิ่ม Endpoint จัดการ Attributes |
| `routes/categoryRoutes.js` | **[MODIFY]** เพิ่ม Route ใหม่ |
| `models/productModel.js` | **[MODIFY]** บันทึก/ดึง product_attribute_values |
| `controllers/productController.js` | **[MODIFY]** รับ attributes array + แสดงใน response |

---

> [!IMPORTANT]
> **ยืนยัน (Approve) ได้เลยครับ** ผมจะสร้าง SQL, Model, Controller ให้ครบทั้งหมด พร้อม Seed Data ตัวอย่าง (เช่น เสื้อผ้า → แบรนด์/ขนาด/วัสดุ) ให้ทดสอบได้ทันทีครับ
