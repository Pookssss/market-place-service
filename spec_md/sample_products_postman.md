# 📋 ตัวอย่าง Postman Params สำหรับสร้างสินค้า

> ⚠️ **ก่อนใช้:** ต้องแทน `{category-uuid}` และ `{attribute-uuid}` ด้วย UUID จริงจากระบบ  
> ดึงได้จาก `GET /api/categories` → เอา `id` ของหมวดย่อย  
> ดึง Attributes จาก `GET /api/categories/{category-uuid}/attributes` → เอา `id` ของ attribute

---

## สินค้าที่ 1: iPhone 15 Pro (หมวด Smartphones)

| Key           | Type | Value                     |
| ------------- | ---- | ------------------------- |
| `name`        | Text | `iPhone 15 Pro Max 256GB` |
| `price`       | Text | `48900`                   |
| `stock`       | Text | `25`                      |
| `status`      | Text | `active`                  |
| `category_id` | Text | `{uuid-of-Smartphones}`   |
| `images`      | File | _เลือกเอง_                |
| `variants`    | Text | _(ด้านล่าง)_              |
| `attributes`  | Text | _(ด้านล่าง)_              |

**variants:**

```json
[
  {
    "price": 48900,
    "stock": 10,
    "sku": "IP15PM-BLK-256",
    "options": { "Color": "Black", "Storage": "256GB" }
  },
  {
    "price": 52900,
    "stock": 8,
    "sku": "IP15PM-BLU-512",
    "options": { "Color": "Blue", "Storage": "512GB" }
  },
  {
    "price": 44900,
    "stock": 7,
    "sku": "IP15PM-WHT-128",
    "options": { "Color": "White", "Storage": "128GB" }
  }
]
```

**attributes:**

```json
[{"attribute_id":"{uuid-Brand}","value":"Apple"},{"attribute_id":"{uuid-RAM}","value":"8GB"},{"attribute_id":"{uuid-Storage}","value":"256GB"},{"attribute_id":"{uuid-Screen Size}","value":"6.7 inch"}]

[{"key":"attributes","value":"[{\"attribute_id\":\"b4d97269-4408-11f1-affa-7085c2ddd5e6\",\"value\":\"Apple\"},{\"attribute_id\":\"b4ede6ca-4408-11f1-affa-7085c2ddd5e6\",\"value\":\"8GB\"},{\"attribute_id\":\"b4edef15-4408-11f1-affa-7085c2ddd5e6\",\"value\":\"256GB\"},{\"attribute_id\":\"6a10e9ab-448e-11f1-afd8-7085c2ddd5e6}\",\"value\":\"6.7 inch\"}]","type":"text","uuid":"b97a1542-49d7-4a90-a9bd-c2a40ee1a2ca","enabled":true}]


```

---

## สินค้าที่ 2: Samsung Galaxy S24 Ultra (หมวด Smartphones)

| Key           | Type | Value                      |
| ------------- | ---- | -------------------------- |
| `name`        | Text | `Samsung Galaxy S24 Ultra` |
| `price`       | Text | `44900`                    |
| `stock`       | Text | `30`                       |
| `status`      | Text | `active`                   |
| `category_id` | Text | `{uuid-of-Smartphones}`    |
| `images`      | File | _เลือกเอง_                 |
| `variants`    | Text | _(ด้านล่าง)_               |
| `attributes`  | Text | _(ด้านล่าง)_               |

**variants:**

```json
[
  {
    "price": 44900,
    "stock": 15,
    "sku": "S24U-BLK-256",
    "options": { "Color": "Black", "Storage": "256GB" }
  },
  {
    "price": 49900,
    "stock": 10,
    "sku": "S24U-GRY-512",
    "options": { "Color": "Gray", "Storage": "512GB" }
  }
]
```

**attributes:**

```json
[
  { "attribute_id": "{uuid-Brand}", "value": "Samsung" },
  { "attribute_id": "{uuid-RAM}", "value": "12GB" },
  { "attribute_id": "{uuid-Storage}", "value": "256GB" },
  { "attribute_id": "{uuid-Screen Size}", "value": "6.8 inch" }
]
```

---

## สินค้าที่ 3: Xiaomi 14 (หมวด Smartphones — ราคาต่ำกว่า)

| Key           | Type | Value                   |
| ------------- | ---- | ----------------------- |
| `name`        | Text | `Xiaomi 14 5G`          |
| `price`       | Text | `19900`                 |
| `stock`       | Text | `50`                    |
| `status`      | Text | `active`                |
| `category_id` | Text | `{uuid-of-Smartphones}` |
| `images`      | File | _เลือกเอง_              |
| `variants`    | Text | _(ด้านล่าง)_            |
| `attributes`  | Text | _(ด้านล่าง)_            |

**variants:**

```json
[
  {
    "price": 19900,
    "stock": 25,
    "sku": "XI14-BLK-256",
    "options": { "Color": "Black", "Storage": "256GB" }
  },
  {
    "price": 22900,
    "stock": 15,
    "sku": "XI14-GRN-512",
    "options": { "Color": "Green", "Storage": "512GB" }
  }
]
```

**attributes:**

```json
[
  { "attribute_id": "{uuid-Brand}", "value": "Xiaomi" },
  { "attribute_id": "{uuid-RAM}", "value": "12GB" },
  { "attribute_id": "{uuid-Storage}", "value": "256GB" },
  { "attribute_id": "{uuid-Screen Size}", "value": "6.36 inch" }
]
```

---

## สินค้าที่ 4: MacBook Pro 14 (หมวด Laptops)

| Key           | Type | Value                   |
| ------------- | ---- | ----------------------- |
| `name`        | Text | `MacBook Pro 14 M3 Pro` |
| `price`       | Text | `69900`                 |
| `stock`       | Text | `12`                    |
| `status`      | Text | `active`                |
| `category_id` | Text | `{uuid-of-Laptops}`     |
| `images`      | File | _เลือกเอง_              |
| `variants`    | Text | _(ด้านล่าง)_            |
| `attributes`  | Text | _(ด้านล่าง)_            |

**variants:**

```json
[
  {
    "price": 69900,
    "stock": 5,
    "sku": "MBP14-SLV-16",
    "options": { "Color": "Silver", "RAM": "16GB" }
  },
  {
    "price": 79900,
    "stock": 4,
    "sku": "MBP14-BLK-32",
    "options": { "Color": "Space Black", "RAM": "32GB" }
  }
]
```

**attributes:** _(ใช้ UUID จาก Laptops attributes)_

```json
[
  { "attribute_id": "{uuid-LaptopBrand}", "value": "Apple" },
  { "attribute_id": "{uuid-Processor}", "value": "M3 Pro" },
  { "attribute_id": "{uuid-LaptopRAM}", "value": "16GB" },
  { "attribute_id": "{uuid-LaptopScreen}", "value": "14\"" }
]
```

---

## สินค้าที่ 5: ASUS ROG Zephyrus (หมวด Laptops)

| Key           | Type | Value                        |
| ------------- | ---- | ---------------------------- |
| `name`        | Text | `ASUS ROG Zephyrus G14 2024` |
| `price`       | Text | `54900`                      |
| `stock`       | Text | `8`                          |
| `status`      | Text | `active`                     |
| `category_id` | Text | `{uuid-of-Laptops}`          |
| `images`      | File | _เลือกเอง_                   |
| `variants`    | Text | _(ด้านล่าง)_                 |
| `attributes`  | Text | _(ด้านล่าง)_                 |

**variants:**

```json
[
  {
    "price": 54900,
    "stock": 4,
    "sku": "ROG-G14-16",
    "options": { "RAM": "16GB" }
  },
  {
    "price": 64900,
    "stock": 4,
    "sku": "ROG-G14-32",
    "options": { "RAM": "32GB" }
  }
]
```

**attributes:**

```json
[
  { "attribute_id": "{uuid-LaptopBrand}", "value": "ASUS" },
  { "attribute_id": "{uuid-Processor}", "value": "AMD Ryzen 9 8945HS" },
  { "attribute_id": "{uuid-LaptopRAM}", "value": "16GB" },
  { "attribute_id": "{uuid-LaptopScreen}", "value": "14\"" }
]
```

---

## สินค้าที่ 6: เสื้อยืด Nike Dri-FIT (หมวด Men)

| Key           | Type | Value                          |
| ------------- | ---- | ------------------------------ |
| `name`        | Text | `Nike Dri-FIT Running T-Shirt` |
| `price`       | Text | `990`                          |
| `stock`       | Text | `100`                          |
| `status`      | Text | `active`                       |
| `category_id` | Text | `{uuid-of-Men}`                |
| `images`      | File | _เลือกเอง_                     |
| `variants`    | Text | _(ด้านล่าง)_                   |
| `attributes`  | Text | _(ด้านล่าง)_                   |

**variants:**

```json
[
  {
    "price": 990,
    "stock": 20,
    "sku": "NK-DRFT-BLK-M",
    "options": { "Color": "Black", "Size": "M" }
  },
  {
    "price": 990,
    "stock": 20,
    "sku": "NK-DRFT-BLK-L",
    "options": { "Color": "Black", "Size": "L" }
  },
  {
    "price": 990,
    "stock": 15,
    "sku": "NK-DRFT-WHT-M",
    "options": { "Color": "White", "Size": "M" }
  },
  {
    "price": 990,
    "stock": 15,
    "sku": "NK-DRFT-WHT-L",
    "options": { "Color": "White", "Size": "L" }
  }
]
```

**attributes:**

```json
[
  { "attribute_id": "{uuid-MenBrand}", "value": "Nike" },
  { "attribute_id": "{uuid-MenSize}", "value": "M" },
  { "attribute_id": "{uuid-MenMaterial}", "value": "Polyester" },
  { "attribute_id": "{uuid-MenStyle}", "value": "Sport" }
]
```

---

## สินค้าที่ 7: กางเกงยีนส์ Levi's (หมวด Men)

| Key           | Type | Value                           |
| ------------- | ---- | ------------------------------- |
| `name`        | Text | `Levi's 501 Original Fit Jeans` |
| `price`       | Text | `2990`                          |
| `stock`       | Text | `40`                            |
| `status`      | Text | `active`                        |
| `category_id` | Text | `{uuid-of-Men}`                 |
| `images`      | File | _เลือกเอง_                      |
| `variants`    | Text | _(ด้านล่าง)_                    |
| `attributes`  | Text | _(ด้านล่าง)_                    |

**variants:**

```json
[
  {
    "price": 2990,
    "stock": 10,
    "sku": "LV501-BLU-30",
    "options": { "Color": "Blue", "Size": "30" }
  },
  {
    "price": 2990,
    "stock": 10,
    "sku": "LV501-BLU-32",
    "options": { "Color": "Blue", "Size": "32" }
  },
  {
    "price": 2990,
    "stock": 10,
    "sku": "LV501-BLK-32",
    "options": { "Color": "Black", "Size": "32" }
  }
]
```

**attributes:**

```json
[
  { "attribute_id": "{uuid-MenBrand}", "value": "Levi's" },
  { "attribute_id": "{uuid-MenSize}", "value": "L" },
  { "attribute_id": "{uuid-MenMaterial}", "value": "Denim" },
  { "attribute_id": "{uuid-MenStyle}", "value": "Casual" }
]
```

---

## สินค้าที่ 8: ชุดเดรส Zara (หมวด Women)

| Key           | Type | Value                    |
| ------------- | ---- | ------------------------ |
| `name`        | Text | `Zara Floral Midi Dress` |
| `price`       | Text | `1990`                   |
| `stock`       | Text | `35`                     |
| `status`      | Text | `active`                 |
| `category_id` | Text | `{uuid-of-Women}`        |
| `images`      | File | _เลือกเอง_               |
| `variants`    | Text | _(ด้านล่าง)_             |
| `attributes`  | Text | _(ด้านล่าง)_             |

**variants:**

```json
[
  {
    "price": 1990,
    "stock": 10,
    "sku": "ZR-FLRL-S",
    "options": { "Size": "S" }
  },
  {
    "price": 1990,
    "stock": 10,
    "sku": "ZR-FLRL-M",
    "options": { "Size": "M" }
  },
  { "price": 1990, "stock": 8, "sku": "ZR-FLRL-L", "options": { "Size": "L" } }
]
```

**attributes:**

```json
[
  { "attribute_id": "{uuid-WomenBrand}", "value": "Zara" },
  { "attribute_id": "{uuid-WomenSize}", "value": "M" },
  { "attribute_id": "{uuid-WomenMaterial}", "value": "Chiffon" },
  { "attribute_id": "{uuid-WomenStyle}", "value": "Casual" }
]
```

---

## 🔍 หลังสร้างสินค้าทั้งหมด ทดสอบ Search ด้วย URL เหล่านี้:

```
# ค้นหาจากชื่อ
GET /api/products/search?q=iPhone

# กรองตามหมวดหมู่ Smartphones ทั้งหมด
GET /api/products/search?category={uuid-Smartphones}

# กรองราคา 10,000 - 50,000
GET /api/products/search?min_price=10000&max_price=50000

# กรองตาม Attribute (Brand = Apple)
GET /api/products/search?attr_Brand=Apple

# รวม Filter + Sort + Pagination
GET /api/products/search?category={uuid-Smartphones}&attr_Brand=Apple&sort=price_asc&page=1&limit=5

# ค้นหาเสื้อผ้า
GET /api/products/search?q=Nike&category={uuid-Men}&sort=price_desc
```
