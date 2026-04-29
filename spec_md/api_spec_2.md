# E-Commerce API Specification (Updated)

**Base URL:** `http://localhost:3000/api/products`
**Static Files URL (Images):** `http://localhost:3000/images/products/{filename}`

---

## 1. ดึงข้อมูลสินค้าทั้งหมด (Get All Products)
- **Method:** `GET`
- **Endpoint:** `/`
- **Description:** ดึงรายการสินค้าทั้งหมดในฐานข้อมูลเรียงจากใหม่สุดไปเก่าสุด

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product Description",
      "price": "100.00",
      "stock": 10,
      "image_url": "product-1695420000000-123456789.jpg",
      "created_at": "2024-05-10T12:00:00.000Z",
      "updated_at": "2024-05-10T12:00:00.000Z"
    }
  ]
}
```

---

## 2. ดึงข้อมูลสินค้าตาม ID (Get Product by ID)
- **Method:** `GET`
- **Endpoint:** `/:id`
- **Description:** ดึงข้อมูลสินค้าเจาะจง 1 ชิ้นตาม ID ที่ระบุ

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product Name",
    "description": "Product Description",
    "price": "100.00",
    "stock": 10,
    "image_url": "product-1695420000000-123456789.jpg",
    "created_at": "2024-05-10T12:00:00.000Z",
    "updated_at": "2024-05-10T12:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## 3. เพิ่มสินค้าใหม่ (Create Product)
- **Method:** `POST`
- **Endpoint:** `/`
- **Description:** เพิ่มสินค้าใหม่ลงในฐานข้อมูล รองรับการอัปโหลดรูปภาพ
- **Content-Type:** `multipart/form-data`

**Request Body (`multipart/form-data`):**
- `name` (Text): ชื่อสินค้า **(Required)**
- `description` (Text): รายละเอียดสินค้า (Optional)
- `price` (Number): ราคาสินค้า ตัวเลข >= 0 **(Required)**
- `stock` (Number): จำนวนสินค้า ตัวเลข >= 0 (Optional, Default: 0)
- `image` (File): ไฟล์รูปภาพ (jpeg, jpg, png, webp, gif) ขนาดไม่เกิน 5MB (Optional)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 2,
    "name": "Product Name",
    "description": "Description",
    "price": 1500.00,
    "stock": 50,
    "image_url": "product-1695420000000-123456789.jpg"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Name and price are required" 
}
```

---

## 4. แก้ไขข้อมูลสินค้า (Update Product)
- **Method:** `PUT`
- **Endpoint:** `/:id`
- **Description:** อัปเดตข้อมูลสินค้าที่มีอยู่ตาม ID รองรับการเปลี่ยนรูปภาพใหม่
- **Content-Type:** `multipart/form-data`

**Request Body (`multipart/form-data`):**
- `name` (Text): ชื่อสินค้า **(Required)**
- `description` (Text): รายละเอียดสินค้า (Optional)
- `price` (Number): ราคาสินค้า ตัวเลข >= 0 **(Required)**
- `stock` (Number): จำนวนสินค้า ตัวเลข >= 0 (Optional)
- `image` (File): ไฟล์รูปภาพใหม่ (jpeg, jpg, png, webp, gif) ขนาดไม่เกิน 5MB (Optional)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Product Name",
    "description": "Updated Desc",
    "price": 1600.00,
    "stock": 40,
    "image_url": "product-1695420000000-123456789.jpg"
  }
}
```

---

## 5. ลบสินค้า (Delete Product)
- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Description:** ลบข้อมูลสินค้าตาม ID ออกจากฐานข้อมูล

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```
