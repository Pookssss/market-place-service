# Database Schema Specification

**Database Name:** `ecommerce_db`

## Table: `products`

ตารางสำหรับเก็บข้อมูลสินค้าทั้งหมดในระบบ

| Column Name | Data Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | รหัสสินค้า (Running Number) |
| `name` | VARCHAR(255) | NOT NULL | ชื่อสินค้า |
| `description` | TEXT | NULL | รายละเอียดสินค้า |
| `price` | DECIMAL(10,2) | NOT NULL | ราคาสินค้า (ทศนิยม 2 ตำแหน่ง) |
| `stock` | INT | NOT NULL, DEFAULT 0 | จำนวนสินค้าคงเหลือในสต๊อก |
| `image_url` | VARCHAR(500) | NULL | ชื่อไฟล์รูปภาพ หรือ URL ของรูปภาพ |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | วันและเวลาที่สร้างรายการ (อัตโนมัติ) |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | วันและเวลาที่มีการแก้ไขรายการล่าสุด (อัตโนมัติ) |
