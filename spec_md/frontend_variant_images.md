# 🖼️ การส่งรูปภาพผูกกับ Variant (สำหรับ Frontend)

ตอนนี้ API Backend รองรับการส่ง `image_index` เพื่อผูกรูปภาพที่เพิ่งอัปโหลดเข้ากับ Variant เฉพาะตัวแล้วครับ!

## กลไกการทำงาน

1. Frontend อัปโหลดไฟล์รูปภาพ (File) ใส่ตัวแปร `images` เป็นแบบ Array หรือ Multiple
2. Backend จะเรียงรูปภาพตามลำดับที่ส่งมา (Index 0, 1, 2, ...)
3. Frontend ส่ง JSON `variants` เข้ามา โดยระบุ `image_index` ในแต่ละ Variant ว่าต้องการผูกกับรูปที่เท่าไหร่
4. Backend จะดึงชื่อไฟล์ที่อัปโหลดเสร็จแล้ว ไปบันทึกลงคอลัมน์ `image_url` ของ Variant นั้นๆ ให้โดยอัตโนมัติ

---

## สิ่งที่หน้าบ้านต้องปรับแก้ (React/Vue/JS)

ในส่วนประกอบฟอร์ม เมื่อผู้ขายจัดการ Variant หรือสี ให้เพิ่มการบันทึก Index ของรูปภาพที่อัปโหลดไว้ด้วย

### 1. โครงสร้าง JSON ที่ส่งไปให้ API (`variants`)

ปรับโครงสร้างให้มี `image_index`:

```json
[
  {
    "price": 48900,
    "stock": 10,
    "sku": "IP15PM-BLK-256",
    "options": { "Color": "Black", "Storage": "256GB" },
    "image_index": 0   // <-- เพิ่มตรงนี้ (หมายถึงใช้ไฟล์รูปภาพลำดับแรกสุดใน Array images)
  },
  {
    "price": 52900,
    "stock": 8,
    "sku": "IP15PM-WHT-512",
    "options": { "Color": "White", "Storage": "512GB" },
    "image_index": 1   // <-- ผูกกับไฟล์รูปภาพลำดับที่ 2
  },
  {
    "price": 44900,
    "stock": 7,
    "sku": "IP15PM-WHT-128",
    "options": { "Color": "White", "Storage": "128GB" },
    "image_index": 1   // <-- ถ้าสีขาวเหมือนกัน ก็ใช้รูปเดียวกันได้
  }
]
```

### 2. ตัวอย่างการเขียน FormData ใน Frontend

เวลาส่งผ่าน `axios` หรือ `fetch`:

```javascript
const formData = new FormData();

formData.append('name', 'iPhone 15 Pro');
formData.append('price', '48900');
formData.append('category_id', 'uuid-of-category');

// 1. เพิ่มไฟล์รูปภาพลงไปตามลำดับ
selectedFiles.forEach(file => {
    formData.append('images', file); 
    // ลำดับที่ append จะกลายเป็น Index 0, 1, 2,... ใน Backend
});

// 2. สร้าง Array ของ variants ที่มี image_index อ้างอิง
const variantsArray = [
    {
        price: 48900,
        stock: 10,
        options: { Color: 'Black' },
        image_index: 0 // รูปแรกสุดที่อัปโหลดคือสีดำ
    },
    {
        price: 48900,
        stock: 15,
        options: { Color: 'White' },
        image_index: 1 // รูปที่สองที่อัปโหลดคือสีขาว
    }
];

formData.append('variants', JSON.stringify(variantsArray));

// แล้วส่ง request
axios.post('/api/products', formData, { ... })
```

### 3. กรณีที่ไม่มีรูปผูกกับตัวเลือกบางอัน
ถ้าตัวแปร Variant ตัวไหนไม่มีรูปภาพเฉพาะเจาะจง ก็ไม่ต้องส่ง `image_index` ไป (หรือปล่อยเป็น `null`) ระบบก็จะปล่อยว่างไว้ให้ (และจะไปดึงรูปหลักของสินค้ามาแสดงแทนในฝั่ง Frontend เมื่อใช้งานจริง)
