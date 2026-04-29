-- Phase 5.2: ระบบคุณลักษณะสินค้าตามหมวดหมู่ (Category Attributes)

-- 1. ตาราง category_attributes: กำหนดว่าหมวดหมู่นี้มี Attribute อะไรบ้าง
CREATE TABLE IF NOT EXISTS category_attributes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    category_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,          -- เช่น "แบรนด์", "ขนาด", "วัสดุ"
    input_type ENUM('select', 'text', 'number') DEFAULT 'text',  -- ประเภทการกรอก
    is_required BOOLEAN DEFAULT FALSE,   -- บังคับกรอกหรือไม่
    sort_order INT DEFAULT 0,            -- ลำดับการแสดงผล
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE
);

-- 2. ตาราง category_attribute_values: ค่าตัวเลือกสำเร็จรูป (สำหรับ input_type = 'select')
CREATE TABLE IF NOT EXISTS category_attribute_values (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    attribute_id BIGINT UNSIGNED NOT NULL,
    value VARCHAR(100) NOT NULL,         -- เช่น "S", "M", "L", "XL"
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attribute_id) REFERENCES category_attributes(id) ON DELETE CASCADE
);

-- 3. ตาราง product_attribute_values: เก็บค่าที่ผู้ขายกรอก/เลือกจริงๆ
CREATE TABLE IF NOT EXISTS product_attribute_values (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    attribute_id BIGINT UNSIGNED NOT NULL,
    value VARCHAR(255) NOT NULL,         -- ค่าที่กรอก/เลือก
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES category_attributes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_attribute (product_id, attribute_id)
);

-- INDEX เพื่อความเร็วในการ Filter สินค้าตาม Attribute
ALTER TABLE product_attribute_values ADD INDEX idx_attr_value (attribute_id, value);

-- -------------------------------------------------------------------------
-- Seed Data ตัวอย่าง
-- -------------------------------------------------------------------------

-- ดึง id ของหมวดหมู่ย่อย
SET @smartphones_id = (SELECT id FROM product_categories WHERE name = 'Smartphones' LIMIT 1);
SET @laptops_id = (SELECT id FROM product_categories WHERE name = 'Laptops' LIMIT 1);
SET @men_id = (SELECT id FROM product_categories WHERE name = 'Men' LIMIT 1);
SET @women_id = (SELECT id FROM product_categories WHERE name = 'Women' LIMIT 1);
SET @kids_id = (SELECT id FROM product_categories WHERE name = 'Kids' LIMIT 1);

-- === Smartphones Attributes ===
INSERT INTO category_attributes (uuid, category_id, name, input_type, is_required, sort_order) VALUES
(UUID(), @smartphones_id, 'Brand', 'select', TRUE, 1),
(UUID(), @smartphones_id, 'RAM', 'select', FALSE, 2),
(UUID(), @smartphones_id, 'Storage', 'select', FALSE, 3),
(UUID(), @smartphones_id, 'Screen Size', 'text', FALSE, 4);

SET @sm_brand = (SELECT id FROM category_attributes WHERE category_id = @smartphones_id AND name = 'Brand' LIMIT 1);
SET @sm_ram = (SELECT id FROM category_attributes WHERE category_id = @smartphones_id AND name = 'RAM' LIMIT 1);
SET @sm_storage = (SELECT id FROM category_attributes WHERE category_id = @smartphones_id AND name = 'Storage' LIMIT 1);

INSERT INTO category_attribute_values (uuid, attribute_id, value, sort_order) VALUES
(UUID(), @sm_brand, 'Apple', 1), (UUID(), @sm_brand, 'Samsung', 2), (UUID(), @sm_brand, 'Xiaomi', 3),
(UUID(), @sm_brand, 'OPPO', 4), (UUID(), @sm_brand, 'Vivo', 5), (UUID(), @sm_brand, 'Huawei', 6),
(UUID(), @sm_ram, '4GB', 1), (UUID(), @sm_ram, '6GB', 2), (UUID(), @sm_ram, '8GB', 3),
(UUID(), @sm_ram, '12GB', 4), (UUID(), @sm_ram, '16GB', 5),
(UUID(), @sm_storage, '32GB', 1), (UUID(), @sm_storage, '64GB', 2), (UUID(), @sm_storage, '128GB', 3),
(UUID(), @sm_storage, '256GB', 4), (UUID(), @sm_storage, '512GB', 5), (UUID(), @sm_storage, '1TB', 6);

-- === Men/Women/Kids Clothing Attributes (ใช้ร่วมกัน) ===
INSERT INTO category_attributes (uuid, category_id, name, input_type, is_required, sort_order) VALUES
(UUID(), @men_id, 'Brand', 'text', FALSE, 1),
(UUID(), @men_id, 'Size', 'select', TRUE, 2),
(UUID(), @men_id, 'Material', 'select', FALSE, 3),
(UUID(), @men_id, 'Style', 'text', FALSE, 4);

SET @men_size = (SELECT id FROM category_attributes WHERE category_id = @men_id AND name = 'Size' LIMIT 1);
SET @men_material = (SELECT id FROM category_attributes WHERE category_id = @men_id AND name = 'Material' LIMIT 1);

INSERT INTO category_attribute_values (uuid, attribute_id, value, sort_order) VALUES
(UUID(), @men_size, 'XS', 1), (UUID(), @men_size, 'S', 2), (UUID(), @men_size, 'M', 3),
(UUID(), @men_size, 'L', 4), (UUID(), @men_size, 'XL', 5), (UUID(), @men_size, 'XXL', 6),
(UUID(), @men_material, 'Cotton', 1), (UUID(), @men_material, 'Polyester', 2),
(UUID(), @men_material, 'Linen', 3), (UUID(), @men_material, 'Denim', 4), (UUID(), @men_material, 'Silk', 5);

-- Women (คล้าย Men)
INSERT INTO category_attributes (uuid, category_id, name, input_type, is_required, sort_order) VALUES
(UUID(), @women_id, 'Brand', 'text', FALSE, 1),
(UUID(), @women_id, 'Size', 'select', TRUE, 2),
(UUID(), @women_id, 'Material', 'select', FALSE, 3),
(UUID(), @women_id, 'Style', 'text', FALSE, 4);

SET @women_size = (SELECT id FROM category_attributes WHERE category_id = @women_id AND name = 'Size' LIMIT 1);
SET @women_material = (SELECT id FROM category_attributes WHERE category_id = @women_id AND name = 'Material' LIMIT 1);

INSERT INTO category_attribute_values (uuid, attribute_id, value, sort_order) VALUES
(UUID(), @women_size, 'XS', 1), (UUID(), @women_size, 'S', 2), (UUID(), @women_size, 'M', 3),
(UUID(), @women_size, 'L', 4), (UUID(), @women_size, 'XL', 5),
(UUID(), @women_material, 'Cotton', 1), (UUID(), @women_material, 'Polyester', 2),
(UUID(), @women_material, 'Linen', 3), (UUID(), @women_material, 'Silk', 4), (UUID(), @women_material, 'Chiffon', 5);

-- === Laptops Attributes ===
INSERT INTO category_attributes (uuid, category_id, name, input_type, is_required, sort_order) VALUES
(UUID(), @laptops_id, 'Brand', 'select', TRUE, 1),
(UUID(), @laptops_id, 'Processor', 'text', FALSE, 2),
(UUID(), @laptops_id, 'RAM', 'select', FALSE, 3),
(UUID(), @laptops_id, 'Screen Size', 'select', FALSE, 4);

SET @lp_brand = (SELECT id FROM category_attributes WHERE category_id = @laptops_id AND name = 'Brand' LIMIT 1);
SET @lp_ram = (SELECT id FROM category_attributes WHERE category_id = @laptops_id AND name = 'RAM' LIMIT 1);
SET @lp_screen = (SELECT id FROM category_attributes WHERE category_id = @laptops_id AND name = 'Screen Size' LIMIT 1);

INSERT INTO category_attribute_values (uuid, attribute_id, value, sort_order) VALUES
(UUID(), @lp_brand, 'Apple', 1), (UUID(), @lp_brand, 'ASUS', 2), (UUID(), @lp_brand, 'Lenovo', 3),
(UUID(), @lp_brand, 'HP', 4), (UUID(), @lp_brand, 'Dell', 5), (UUID(), @lp_brand, 'Acer', 6),
(UUID(), @lp_ram, '8GB', 1), (UUID(), @lp_ram, '16GB', 2), (UUID(), @lp_ram, '32GB', 3), (UUID(), @lp_ram, '64GB', 4),
(UUID(), @lp_screen, '13.3"', 1), (UUID(), @lp_screen, '14"', 2), (UUID(), @lp_screen, '15.6"', 3), (UUID(), @lp_screen, '16"', 4), (UUID(), @lp_screen, '17.3"', 5);
