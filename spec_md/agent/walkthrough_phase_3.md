# สรุปผลการสร้างระบบ Phase 3: Cart + Order

ใน Phase 3 นี้ ระบบได้รับการขยายความสามารถให้รองรับการสั่งซื้อสินค้าอย่างเต็มรูปแบบ โดยมีระบบตะกร้าสินค้า (Cart) สำหรับพักสินค้า และระบบคำสั่งซื้อ (Order) ที่แยกตามร้านค้า (Store) 

## ไฟล์ที่ถูกสร้าง / แก้ไขใน Phase 3

1. **Database Migration:** 
   - `database/phase3_cart_order.sql`
     - สร้างตาราง `carts` (1 Buyer มี 1 ตะกร้าที่ทำงานอยู่)
     - สร้างตาราง `cart_items` (เก็บรายการสินค้าพร้อมจำนวน โดยเชื่อมกับตะกร้าและสินค้า)
     - สร้างตาราง `orders` (เก็บคำสั่งซื้อ ซึ่งผูกกับ 1 ร้านค้า และเก็บยอดรวม รวมถึงที่อยู่จัดส่ง)
     - สร้างตาราง `order_items` (เก็บรายละเอียดสินค้าในคำสั่งซื้อ **โดยจดจำชื่อและราคา ณ ตอนที่ซื้อ** ป้องกันปัญหาร้านค้าเปลี่ยนราคาทีหลัง)
2. **Models:** 
   - `models/cartModel.js` (จัดการตะกร้าสินค้า เพิ่ม/ลบ/แก้ไขจำนวน และล้างตะกร้าหลังสั่งซื้อ)
   - `models/orderModel.js` (จัดการคำสั่งซื้อ พิเศษตรงที่มีการใช้ **Transaction** ในการตัด Stock และบันทึกคำสั่งซื้อไปพร้อมๆ กันเพื่อป้องกันข้อผิดพลาด)
3. **Controllers:** 
   - `controllers/cartController.js` (เพิ่มสินค้าลงตะกร้าแบบเช็ค Stock ล่วงหน้า, แก้ไขจำนวน, ลบรายการสินค้า)
   - `controllers/orderController.js` 
     - ดึงสินค้าจากตะกร้ามาแบ่งสร้างเป็น Order แยกตามร้านค้าให้โดยอัตโนมัติ
     - Seller สามารถดู Order ของร้านตัวเอง และปรับสถานะ (เช่น processing, shipped) ได้
     - Buyer สามารถดู Order ของตัวเองได้
4. **Routes:**
   - `routes/cartRoutes.js` (ล็อกสิทธิ์ให้ผู้ใช้ที่ Login แล้วใช้งานตะกร้าได้)
   - `routes/orderRoutes.js` (ตรวจสอบ Permission แบบยืดหยุ่น เช่น คนสั่งต้องมีสิทธิ์ `order.create` ส่วนคนจัดการต้องมี `order.manage.seller`)
5. **App:**
   - อัปเดต `app.js` เพิ่ม Endpoint `/api/cart` และ `/api/orders`

---

## วิธีการทดสอบ

> [!WARNING]
> รบกวนนำโค้ดใน `e:\freelance\e-commerge\database\phase3_cart_order.sql` ไป Run ใน phpMyAdmin ก่อนนะครับ เพื่อสร้างตารางที่เกี่ยวข้องกับการสั่งซื้อทั้งหมด

**1. ระบบตะกร้าสินค้า (ในฐานะ Buyer)**
- **ดูตะกร้า:** `GET /api/cart`
- **เพิ่มสินค้าลงตะกร้า:** `POST /api/cart/items`
  ```json
  {
      "product_id": 1,
      "quantity": 2
  }
  ```
- **ปรับจำนวน:** `PUT /api/cart/items/:cart_item_id`
- **ลบสินค้าออก:** `DELETE /api/cart/items/:cart_item_id`

**2. ระบบคำสั่งซื้อ (สร้าง Order)**
- **Checkout ตะกร้า:** `POST /api/orders`
  ```json
  {
      "shipping_address": "123 ถนน A กรุงเทพฯ 10110"
  }
  ```
  *(ระบบจะดึงของในตะกร้าคุณมาสร้าง Order และตัด Stock ทันที ถ้าในตะกร้ามีของจาก 2 ร้านค้า ระบบจะแยกเป็น 2 Order ให้)*

**3. จัดการคำสั่งซื้อ (ในฐานะ Seller)**
- **ดู Order ที่คนสั่งร้านตัวเอง:** `GET /api/orders/seller`
- **เปลี่ยนสถานะ Order:** `PATCH /api/orders/seller/:order_id/status`
  ```json
  {
      "status": "shipped"
  }
  ```

---

> [!TIP]
> ตอนนี้คุณมีระบบ E-commerce ที่เกือบสมบูรณ์แล้วในเชิง Core Logic (Auth -> Store -> Product -> Cart -> Order) 
> หากทดสอบผ่านแล้ว แจ้งผมได้เลยครับ เราจะไปต่อกันที่ **Phase 4: Admin Dashboard** เพื่อให้แอดมินจัดการทุกอย่างได้จากศูนย์กลางครับ
