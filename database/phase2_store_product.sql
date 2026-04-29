-- 1. สร้างตาราง stores (ร้านค้า)
CREATE TABLE IF NOT EXISTS stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. สร้างตาราง product_categories (หมวดหมู่สินค้า)
CREATE TABLE IF NOT EXISTS product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL
);

-- Seed Categories
INSERT IGNORE INTO product_categories (name, description) VALUES 
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Fashion and clothing'),
('Home & Garden', 'Home appliances and garden tools');

-- 3. ปรับโครงสร้างตาราง products เดิม
-- เนื่องจากมีข้อมูล products อยู่แล้ว เราจะเพิ่ม Column ที่จำเป็น
ALTER TABLE products
ADD COLUMN store_id INT NOT NULL AFTER id,
ADD COLUMN category_id INT NULL AFTER store_id,
ADD COLUMN status ENUM('draft', 'active', 'inactive', 'out_of_stock', 'banned') DEFAULT 'active' AFTER stock;

-- เพิ่ม Foreign Key ให้ products (ถ้ามีข้อมูล existing ใน products การแอด FK อาจจะพังถ้าไม่มี store_id มารองรับ)
-- คำแนะนำ: ก่อนนำไปใช้จริงควรลบข้อมูลเก่าในตาราง products ทิ้ง (หรือสร้าง store หลอกขึ้นมาแล้วอัปเดต store_id)
-- TRUNCATE TABLE products; 
-- เราจะถือว่าลบข้อมูลเก่าทิ้งเพื่อให้สร้าง FK ได้
ALTER TABLE products
ADD CONSTRAINT fk_product_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL;

-- 4. สร้างตาราง product_images (รูปภาพสินค้า)
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
