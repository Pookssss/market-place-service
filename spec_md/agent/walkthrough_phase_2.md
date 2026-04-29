# สรุปผลการสร้างระบบ Phase 2: Store + Seller Product

ใน Phase 2 นี้ ระบบได้รับการอัปเกรดให้รองรับรูปแบบ Marketplace เรียบร้อยแล้ว โดยสินค้า (Product) จะต้องถูกผูกติดกับร้านค้า (Store) และร้านค้าจะถูกผูกกับผู้ขาย (Seller)

## ไฟล์ที่ถูกสร้าง / แก้ไขใน Phase 2

1. **Database Migration:** 
   - `database/phase2_store_product.sql` 
     - สร้างตาราง `stores`, `product_categories`, `product_images`
     - นำข้อมูลตั้งต้น (Seed) หมวดหมู่สินค้าเข้าสู่ระบบ
     - เพิ่มคอลัมน์ `store_id`, `category_id`, และปรับ `status` ในตาราง `products` พร้อมทั้งเชื่อม Foreign Key ไปที่ `stores` และ `product_categories`
2. **Models:** 
   - สร้าง `models/storeModel.js` (สำหรับจัดการร้านค้า เช่น สร้างร้านค้า ค้นหาร้านค้าของตัวเอง)
   - อัปเดต `models/productModel.js` (เพิ่ม `store_id`, `category_id`, และปรับ Query ให้ค้นหาแบบระบุ store หรือดูเฉพาะสินค้า active ได้)
3. **Controllers:** 
   - สร้าง `controllers/storeController.js` (API สำหรับให้ Seller สร้างและดูข้อมูลร้านของตัวเอง)
   - อัปเดต `controllers/productController.js` 
     - `getAllProducts`: ตอนนี้จะแสดงเฉพาะสินค้าที่มีสถานะเป็น `active` (สำหรับ Public View)
     - `getMyProducts`: สร้างใหม่สำหรับ Seller เพื่อดูรายการสินค้าทั้งหมดของร้านตัวเอง
     - `createProduct`/`updateProduct`/`deleteProduct`: เพิ่มระบบตรวจสอบความเป็นเจ้าของสินค้าผ่าน `store_id` โดยอัตโนมัติ (Seller แก้ไขสินค้าของคนอื่นไม่ได้ ยกเว้น Admin)
4. **Routes:**
   - สร้าง `routes/storeRoutes.js` (ผูก Controller ร้านค้า และล็อกสิทธิ์ต้องมี Role `seller` หรือ `admin` เท่านั้น)
   - อัปเดต `routes/productRoutes.js` (เพิ่ม Route สำหรับดึงสินค้าของตัวเอง และใส่ Middleware ตรวจสอบสิทธิ์และการเป็นเจ้าของลงในแต่ละ Endpoint)
5. **App:**
   - อัปเดต `app.js` เพิ่ม Endpoint `/api/stores` ให้ระบบรู้จัก

---

## วิธีการทดสอบ

> [!WARNING]
> **สิ่งที่ต้องทำก่อนทดสอบ:**
> 1. หากคุณมีข้อมูลในตาราง `products` เก่าที่เคยสร้างตอนแรก ข้อมูลนั้นจะไม่มี `store_id` ซึ่งจะทำให้ Error ตอนเพิ่ม Foreign Key 
> 2. แนะนำให้ **"เคลียร์ข้อมูลในตาราง products เดิมทิ้ง"** ก่อน แล้วค่อยนำคำสั่งในไฟล์ `database/phase2_store_product.sql` ไป Run ใน phpMyAdmin ครับ

**1. ทดสอบสร้างร้านค้า (สำหรับ Seller)**
- **Endpoint:** `POST http://localhost:3000/api/stores`
- **Headers:** `Authorization: Bearer <token_ของ_seller>`
- **Body (JSON):**
  ```json
  {
      "name": "My Awesome Store",
      "description": "ร้านขายของจิปาถะ"
  }
  ```

**2. ทดสอบดูร้านค้าของตัวเอง**
- **Endpoint:** `GET http://localhost:3000/api/stores/me`
- **Headers:** `Authorization: Bearer <token_ของ_seller>`

**3. ทดสอบสร้างสินค้า (ลงร้านของ Seller)**
- **Endpoint:** `POST http://localhost:3000/api/products`
- **Headers:** `Authorization: Bearer <token_ของ_seller>`
- **Body (multipart/form-data):**
  - `name`: "Gaming Mouse"
  - `price`: 890
  - `stock`: 20
  - `category_id`: 1
  - `image`: *(แนบไฟล์รูปภาพ)*

**4. ทดสอบดูสินค้า (แบ่ง 2 มุมมอง)**
- **มุมมองคนทั่วไป (Public):** `GET http://localhost:3000/api/products` (จะเห็นเฉพาะสินค้าของทุกร้านที่เปิดสถานะ `active`)
- **มุมมองผู้ขาย (Seller):** `GET http://localhost:3000/api/products/seller/me` (จะเห็นเฉพาะสินค้าของร้านตัวเองเท่านั้น ทั้งที่ active และ draft)

---

> [!TIP]
> ตอนนี้คุณมีระบบร้านค้าและการจัดการสินค้าตามสิทธิ์แบบ Marketplace ย่อมๆ แล้ว ลองสร้าง User 2 คน (Seller 1 และ Seller 2) สร้างร้านค้าของตัวเอง และลองให้ Seller 1 แอบไปลบสินค้าของ Seller 2 ดูครับ (ระบบจะตอบกลับว่า Forbidden เพราะป้องกันไว้ให้แล้ว)
