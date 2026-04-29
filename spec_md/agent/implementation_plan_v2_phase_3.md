# แผนการอัปเกรดระบบ Database ID (Dual-ID System)

เป้าหมายคือการปรับปรุงระบบ ID ของตารางใน Database เพื่อเพิ่มความปลอดภัย (ป้องกัน ID Enumeration/Scraping) โดยยังคงรักษาประสิทธิภาพการทำงาน (Performance & Indexing) ของฐานข้อมูลไว้

## 1. หลักการออกแบบ (Architecture Design)

เราจะใช้รูปแบบ **Dual-ID** สำหรับตารางหลัก (เช่น `users`, `stores`, `products`, `orders`) ดังนี้:

- **Internal ID (`id`):** 
  - ใช้ประเภท `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`
  - **หน้าที่:** ใช้สำหรับการเชื่อมโยงความสัมพันธ์ภายใน Database (Foreign Keys) และการสร้าง Index เพื่อความเร็วในการ Query แบบ JOIN
  - **ข้อห้าม:** จะ **ไม่ส่ง** ID นี้ออกไปให้ผู้ใช้งานเห็นผ่าน API (API Response จะไม่คืนค่า `id` นี้)

- **Public ID (`uuid`):** 
  - ใช้ประเภท `CHAR(36) NOT NULL UNIQUE` 
  - **หน้าที่:** ใช้สำหรับ URL Parameters (เช่น `/api/products/123e4567-e89b-12d3...`) และเป็น ID ที่ส่งกลับไปใน API Response
  - **การสร้าง:** จะใช้ Node.js Library (เช่น `crypto.randomUUID()` ซึ่งได้ UUID v4) ในการสร้างก่อน Insert ลง Database เพื่อความง่ายและเป็นมาตรฐาน

## 2. โครงสร้าง Database ใหม่ (SQL)

โครงสร้างมาตรฐานของทุกตารางหลักจะเปลี่ยนเป็นรูปแบบนี้:

```sql
CREATE TABLE IF NOT EXISTS products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, -- Internal ID
    uuid CHAR(36) NOT NULL UNIQUE,                 -- Public ID สำหรับ API
    store_id BIGINT UNSIGNED NOT NULL,             -- Foreign Key อ้างอิง internal id ของ stores
    category_id BIGINT UNSIGNED NULL,
    name VARCHAR(255) NOT NULL,
    -- ... (ฟิลด์อื่นๆ)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);
```

> **หมายเหตุ:** สำหรับตารางที่ไม่ได้ถูกอ้างอิงผ่าน API โดยตรง หรือเป็นตารางเชื่อม (Mapping Tables) เช่น `user_roles`, `role_permissions`, `cart_items` อาจไม่จำเป็นต้องมี `uuid` ก็ได้

## 3. ผลกระทบต่อโค้ด (Backend Code Refactoring)

การเปลี่ยนแปลงนี้จะกระทบกับโค้ดที่เราเขียนไปแล้วใน Phase 1-3 ดังนี้:

### 3.1 Route Parameters
- **เดิม:** `/api/products/:id` (id = 1, 2, 3)
- **ใหม่:** `/api/products/:uuid` (uuid = '...')

### 3.2 Models (การ Query)
- **เดิม:** `Product.getById(1)`
- **ใหม่:** `Product.getByUuid('...')`
- เมื่อมีการบันทึกข้อมูล (Insert) ต้องมีการสร้าง UUID แนบไปด้วย เช่น `INSERT INTO products (uuid, ...) VALUES (UUID(), ...)` หรือใช้ `crypto.randomUUID()` จาก Node.js

### 3.3 Controllers & Responses
- เมื่อดึงข้อมูลเพื่อส่งกลับ (Response) เราจะตัด `id` ทิ้ง และเปลี่ยน `uuid` เป็น `id` เพื่อให้ Frontend ใช้งานง่าย หรือส่งชื่อฟิลด์เป็น `id: row.uuid` เลย

---

## User Review Required

> [!IMPORTANT]
> **การตัดสินใจที่ต้องการจากคุณ:**
> 1. **เริ่มปรับแก้ทั้งหมดเลยไหม?** - การทำ Dual-ID ควรทำกับทุกตารางหลัก (Users, Stores, Products, Orders) เพื่อให้เป็นมาตรฐานเดียวกันทั้งหมด 
> 2. **ล้างฐานข้อมูลเดิม:** เนื่องจากมีการเปลี่ยนประเภทคอลัมน์ `id` จาก `INT` เป็น `BIGINT UNSIGNED` และต้องเพิ่ม `uuid` ซึ่งกระทบ Foreign Keys ทั้งหมด **เราจำเป็นต้อง Drop ตารางเก่าทิ้งทั้งหมด** แล้วสร้างใหม่จากไฟล์ `.sql` ชุดใหม่
> 
> หากคุณ **Approve (ยืนยัน)** ผมจะดำเนินการดังนี้:
> 1. รวบรวม SQL ของ Phase 1-3 มาเขียนใหม่รวมกันเป็นไฟล์เดียว (เช่น `database/schema_v2.sql`) ที่รองรับ `BIGINT` และ `UUID` ทั้งหมด
> 2. แก้ไข Models, Controllers, และ Routes เพื่อรองรับระบบ UUID ตามแผน
