# E-Commerce API Specification

**Base URL:** `http://localhost:3000/api/products`

---

## 1. ดึงข้อมูลสินค้าทั้งหมด (Get All Products)
- **Method:** `GET`
- **Endpoint:** `/`
- **Description:** ดึงรายการสินค้าทั้งหมดเรียงจากใหม่ไปเก่า

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
      "image_url": "url_to_image",
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
    "image_url": "url_to_image",
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
- **Description:** เพิ่มสินค้าใหม่ลงในฐานข้อมูล

**Request Body (`multipart/form-data`):**
- `name` (Text): "Product Name" (Required)
- `description` (Text): "Description" (Optional)
- `price` (Number): 1500.00 (Required, >= 0)
- `stock` (Number): 50 (Optional, >= 0, Default: 0)
- `image` (File): ไฟล์รูปภาพ (jpeg, jpg, png, webp, gif) (Optional)

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
    "image_url": "http://image.jpg"
  }
}
```
**Error Response (400 Bad Request - Validation Failed):**
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
- **Description:** อัปเดตข้อมูลสินค้าที่มีอยู่ตาม ID

**Request Body (`multipart/form-data`):**
- `name` (Text): "Updated Product Name" (Required)
- `description` (Text): "Updated Desc" (Optional)
- `price` (Number): 1600.00 (Required, >= 0)
- `stock` (Number): 40 (Optional, >= 0)
- `image` (File): ไฟล์รูปภาพใหม่ (jpeg, jpg, png, webp, gif) (Optional)

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
    "image_url": "http://image.jpg"
  }
}
```

---

## 5. ลบสินค้า (Delete Product)
- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Description:** ลบข้อมูลสินค้าตาม ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```
