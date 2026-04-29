-- 1. สร้างตาราง product_variants (จัดการสต็อกและราคาของแต่ละ SKU)
CREATE TABLE IF NOT EXISTS product_variants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    product_id BIGINT UNSIGNED NOT NULL,
    sku VARCHAR(100) NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 2. สร้างตาราง product_variant_options (เก็บรายละเอียดของตัวเลือก)
CREATE TABLE IF NOT EXISTS product_variant_options (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    variant_id BIGINT UNSIGNED NOT NULL,
    option_name VARCHAR(100) NOT NULL,  -- เช่น "Color", "Size"
    option_value VARCHAR(100) NOT NULL, -- เช่น "Red", "XL"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

-- 3. อัปเดตตาราง cart_items ให้รองรับ variant_id
-- เนื่องจาก MySQL มีข้อจำกัดเรื่องการ Drop Index ที่ติด Foreign Key 
-- และตารางตะกร้าสินค้าสามารถลบสร้างใหม่ได้โดยไม่กระทบข้อมูลหลัก 
-- จึงใช้วิธี Drop และ Recreate เพื่อความสะอาดของ Schema
DROP TABLE IF EXISTS cart_items;

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    cart_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    variant_id BIGINT UNSIGNED NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    -- เปลี่ยน UNIQUE ให้ครอบคลุม variant_id
    UNIQUE KEY unique_cart_item (cart_id, product_id, variant_id) 
);

-- 4. อัปเดตตาราง order_items ให้รองรับ variant_id และการเก็บข้อมูลตัวเลือก
-- ในกรณีที่คุณเคยรันไฟล์นี้ไปแล้วบางส่วน แล้ว Error ก่อนถึงบรรทัดนี้
-- เราจะใช้เทคนิค Try-Catch (ด้วย Procedure) หรือให้คุณรันแบบแยกทีละคำสั่งถ้าเกิด Error
-- แต่ปกติคำสั่งนี้จะรันผ่านได้เลยครับ
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS variant_id BIGINT UNSIGNED NULL AFTER product_id,
ADD COLUMN IF NOT EXISTS variant_details VARCHAR(255) NULL AFTER product_name;

-- เช็คก่อนว่ามี Constraint หรือไม่ (ถ้า Error แสดงว่าอาจจะรันไปแล้ว ให้ข้ามบรรทัดนี้ไปได้)
ALTER TABLE order_items
ADD CONSTRAINT fk_order_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;
