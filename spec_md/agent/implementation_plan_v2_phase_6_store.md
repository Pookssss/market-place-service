# 🏪 แผนการพัฒนาระบบ Store Profile (Public & Seller)

เป้าหมายคือการเพิ่ม API สำหรับดึงข้อมูลร้านค้าเพื่อแสดงผลในหน้า Public (สำหรับให้ผู้ซื้อดู) และเพิ่มความสามารถในการอัปโหลด "รูปโปรไฟล์ร้าน" (Logo) และ "รูปปก" (Cover) ให้กับร้านค้า

## ⚠️ User Review Required

> [!IMPORTANT]
> - จะมีการเพิ่มคอลัมน์ใหม่ในฐานข้อมูล `stores`
> - รูปแบบการส่งข้อมูลสร้าง/อัปเดตร้านค้า จะต้องเปลี่ยนจาก JSON เป็น `multipart/form-data` เพื่อให้รองรับการอัปโหลดไฟล์ (เหมือนตอนสร้างสินค้า)

## 📋 Proposed Changes

### 1. Database Schema
สร้างไฟล์ `database/phase7_store_profiles.sql` เพื่อเพิ่มคอลัมน์เก็บรูปภาพ
#### [NEW] `database/phase7_store_profiles.sql`
- เพิ่ม `profile_image_url VARCHAR(500) NULL`
- เพิ่ม `cover_image_url VARCHAR(500) NULL`

---

### 2. Middleware (File Upload)
ต้องสร้างออปชันสำหรับอัปโหลดรูปร้านค้าโดยเฉพาะแยกจากรูปสินค้า
#### [NEW] `middleware/storeUpload.js`
- สร้าง Multer config ให้เก็บไฟล์ที่โฟลเดอร์ `public/images/stores`

---

### 3. Store Model
อัปเดตโมเดลให้รองรับการบันทึกภาพ
#### [MODIFY] `models/storeModel.js`
- **`create`**: เพิ่มพารามิเตอร์ `profile_image_url`, `cover_image_url` ลงใน INSERT query
- **`update`**: เพิ่มการอัปเดตคอลัมน์รูปภาพใน UPDATE query

---

### 4. Store Controller
เพิ่ม API ใหม่และอัปเดตของเดิม
#### [MODIFY] `controllers/storeController.js`
- **[NEW] `getPublicStore`**: ดึงข้อมูลร้านค้าจาก UUID สำหรับหน้า Public (ส่งรูปร้านค้ากลับไปด้วย)
- **[UPDATE] `createStore`**: รับและจัดการไฟล์ `req.files.profile_image` และ `req.files.cover_image`
- **[UPDATE] `updateStore`**: รับและจัดการไฟล์กรณีมีการเปลี่ยนรูปร้าน
- **[UPDATE] `getMyStore`**: คืนค่ารูปโปรไฟล์และรูปปกไปด้วย

---

### 5. Store Routes
เพิ่ม Route สาธารณะและผูก Multer
#### [MODIFY] `routes/storeRoutes.js`
- **[NEW]** `GET /:id` (Public) → ชี้ไปที่ `storeController.getPublicStore`
- **[UPDATE]** `POST /` → ใช้ middleware `storeUpload.fields([{ name: 'profile_image', maxCount: 1 }, { name: 'cover_image', maxCount: 1 }])`
- **[UPDATE]** `PUT /:id` → ใช้ middleware `storeUpload` เหมือน POST

---

## ✅ Verification Plan

### Automated Tests
1. ใช้ Postman ยิง `GET /api/stores/:uuid` โดยไม่ต้องใส่ Token ต้องได้ข้อมูลร้านและ URL รูป
2. ใช้ Postman ยิง `PUT /api/stores/:uuid` พร้อมแนบรูปเพื่อดูว่าอัปเดตรูปสำเร็จหรือไม่

### Manual Verification
1. เช็คในโฟลเดอร์ `public/images/stores/` ว่ามีไฟล์รูปสร้างขึ้นจริง
2. รบกวนให้ User นำ API ไปประกอบหน้าเว็บ Frontend (Seller Profile & Public Store Profile)
