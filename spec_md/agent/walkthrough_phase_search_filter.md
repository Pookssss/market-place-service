# สรุประบบ Search & Filter + Pagination

## Endpoint ใหม่

```
GET /api/products/search
```

## Query Parameters ที่รองรับ

| Parameter | ตัวอย่าง | คำอธิบาย |
|---|---|---|
| `q` | `?q=iPhone` | ค้นหาจากชื่อ + description (FULLTEXT + LIKE fallback) |
| `category` | `?category=uuid` | กรองตามหมวดหมู่ (**รวมหมวดย่อยทั้งหมดด้วย path LIKE**) |
| `min_price` | `?min_price=100` | ราคาต่ำสุด |
| `max_price` | `?max_price=5000` | ราคาสูงสุด |
| `store` | `?store=uuid` | กรองตามร้านค้า |
| `attr_{name}` | `?attr_Brand=Nike` | กรองตาม Attribute (Dynamic — ใช้ชื่อ Attribute) |
| `sort` | `?sort=price_asc` | เรียงลำดับ: `newest`, `oldest`, `price_asc`, `price_desc`, `name_asc`, `name_desc` |
| `page` | `?page=1` | หน้าที่ (default: 1) |
| `limit` | `?limit=20` | จำนวนต่อหน้า (default: 20, max: 100) |

## ตัวอย่างการยิง API

### ค้นหาง่ายๆ
```
GET /api/products/search?q=shirt&page=1&limit=10
```

### กรองตามหมวดหมู่ + ราคา
```
GET /api/products/search?category=uuid-electronics&min_price=1000&max_price=50000&sort=price_asc
```

### กรองตาม Attribute
```
GET /api/products/search?category=uuid-smartphones&attr_Brand=Apple&attr_RAM=8GB&sort=newest
```

### รวมหลาย Filter
```
GET /api/products/search?q=iPhone&category=uuid-smartphones&min_price=10000&attr_Storage=256GB&sort=price_desc&page=1&limit=20
```

## Response Format

```json
{
    "success": true,
    "data": [
        {
            "id": "uuid-product",
            "name": "iPhone 15 Pro",
            "price": "39900.00",
            "category": { "id": "uuid", "name": "Smartphones" },
            "attributes": [
                { "name": "Brand", "value": "Apple" },
                { "name": "Storage", "value": "256GB" }
            ],
            "images": [...],
            "variants": [...]
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 156,
        "total_pages": 8,
        "has_next": true,
        "has_prev": false
    }
}
```

## ไฟล์ที่แก้ไข

| ไฟล์ | สถานะ |
|---|---|
| `database/phase6_search_indexes.sql` | **[NEW]** FULLTEXT + price indexes |
| `models/productModel.js` | **[MODIFIED]** เพิ่ม `search()` — Dynamic SQL builder |
| `models/categoryAttributeModel.js` | **[MODIFIED]** เพิ่ม `findByName()` |
| `controllers/productController.js` | **[MODIFIED]** เพิ่ม `searchProducts` |
| `routes/productRoutes.js` | **[MODIFIED]** เพิ่ม `GET /search` |

## ขั้นตอนการติดตั้ง

1. **รัน SQL** → `database/phase6_search_indexes.sql` ใน phpMyAdmin
2. **Restart Server** → `Ctrl + C` แล้ว `node server.js`
3. **ทดสอบ** → ยิง `GET /api/products/search?q=test&page=1&limit=5`
