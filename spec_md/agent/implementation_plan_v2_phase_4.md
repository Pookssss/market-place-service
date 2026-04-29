# แผนการอัปเกรดระบบตัวเลือกสินค้า (Dynamic Product Variants)

เพื่อรองรับสินค้ายุคใหม่ที่มีตัวเลือกหลากหลาย (เช่น สี, ขนาด, ความจุ) เราจะเพิ่มระบบ Variant ให้มีความยืดหยุ่นสูงแบบ Dynamic (ไม่จำกัดว่าต้องมีแค่สีหรือไซส์)

## 1. Database Design (Schema)

เราจะยึดหลักการ **Dual-ID (BIGINT + UUID)** เช่นเดิม และจะเพิ่มตารางใหม่ 2 ตารางดังนี้:

### 1.1 `product_variants` (เก็บข้อมูลสต็อกและราคาของแต่ละรูปแบบ)
- `id` (BIGINT UNSIGNED)
- `uuid` (CHAR(36) UNIQUE)
- `product_id` (BIGINT UNSIGNED) - อ้างอิงตาราง products
- `sku` (VARCHAR) - รหัสสินค้าเฉพาะ (Optional)
- `price` (DECIMAL) - ราคาของตัวเลือกนี้ (เผื่อตัวเลือกพรีเมียมราคาแพงกว่า)
- `stock` (INT) - จำนวนสต็อกของตัวเลือกนี้

### 1.2 `product_variant_options` (เก็บรายละเอียดว่าตัวเลือกนี้ประกอบด้วยอะไรบ้าง)
- `id` (BIGINT UNSIGNED)
- `variant_id` (BIGINT UNSIGNED) - อ้างอิงตาราง product_variants
- `option_name` (VARCHAR) - ชื่อกลุ่มตัวเลือก เช่น "Color", "Size", "Storage"
- `option_value` (VARCHAR) - ค่าตัวเลือก เช่น "Red", "XL", "256GB"

*(ตัวอย่าง: สินค้าเสื้อ 1 ตัว มี Variant A -> Option1: Color=Red, Option2: Size=M)*

### 1.3 สิ่งที่ต้องปรับเพิ่มในระบบเดิม
- **`cart_items`**: เพิ่มคอลัมน์ `variant_id` (NULL ได้ ถ้าสินค้านั้นไม่มีตัวเลือก) เพื่อให้รู้ว่าตะกร้านี้เลือกสี/ไซส์อะไรมา
- **`order_items`**: เพิ่มคอลัมน์ `variant_id` และปรับปรุง `product_name` ให้บันทึกข้อมูลตัวเลือกต่อท้ายด้วย (เช่น `"iPhone 15 (Color: Black, Storage: 256GB)"`) เพื่อเป็นหลักฐานใบเสร็จ

---

## 2. API และ Logic ที่ต้องแก้ไข

1. **Product API (`POST /api/products`)**
   - รองรับการรับ Request Body ที่มี Array ของ `variants` เข้ามาพร้อมกันตอนสร้างสินค้า
   - ตัวอย่าง Request:
     ```json
     {
       "name": "T-Shirt",
       "price": 100, // ราคาพื้นฐาน
       "variants": [
         {
           "price": 120, "stock": 50,
           "options": { "Color": "Red", "Size": "M" }
         },
         {
           "price": 120, "stock": 30,
           "options": { "Color": "Blue", "Size": "M" }
         }
       ]
     }
     ```
2. **Product API (`GET /api/products/:uuid`)**
   - ดึงข้อมูล Product และ JOIN หา Variants ทั้งหมดของสินค้านั้นมาแสดงผลให้หน้าบ้านสร้าง Dropdown/Button กดเลือกได้

3. **Cart API (`POST /api/cart/items`)**
   - ต้องรับค่า `variant_id` (UUID) มาด้วย 
   - ก่อนเพิ่มลงตะกร้า ต้องเช็ค Stock ของ Variant นั้นๆ แยกกัน แทนที่จะเช็คจาก Stock รวมของสินค้าหลัก

4. **Order API (`POST /api/orders`)**
   - ปรับระบบตัด Stock ให้ไปตัดที่ตาราง `product_variants` หากรายการสินค้านั้นมี `variant_id`

---

## User Review Required

> [!IMPORTANT]
> **มีคำถามเพื่อยืนยันก่อนเริ่มเขียนโค้ดครับ:**
> 1. **การรวมตาราง:** โครงสร้าง `product_variants` และ `product_variant_options` ตามที่ออกแบบนี้ยืดหยุ่นมากพอและตรงตามที่คุณคิดไว้ไหมครับ?
> 2. **Stock สินค้าหลัก:** สำหรับสินค้าที่มี Variants เราจะยังคงสน `stock` หลักที่ตาราง `products` อยู่ไหมครับ? (ปกติถ้าระบบมี Variants เรามักจะข้าม Stock หลักไปใช้ Stock ย่อยแทน)
> 
> หากยืนยัน (Approve) ผมจะสร้างไฟล์ `.sql` สำหรับอัปเดต (Alter) ตาราง Cart/Order และสร้างตาราง Variants ใหม่ และลงมือแก้ไข API Products, Cart, Order ทันทีครับ
