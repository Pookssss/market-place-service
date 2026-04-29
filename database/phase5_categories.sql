-- Phase 5: อัปเกรดระบบหมวดหมู่สินค้า (Product Categories)

-- 1. เพิ่มคอลัมน์ parent_id เพื่อรองรับหมวดหมู่ย่อยแบบลำดับชั้น
ALTER TABLE product_categories 
ADD COLUMN parent_id BIGINT UNSIGNED NULL AFTER uuid,
ADD COLUMN image_url VARCHAR(500) NULL AFTER description,
ADD CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL;

-- 2. Seed Data ตัวอย่างหมวดหมู่ย่อย (ถ้าคุณยังไม่มีข้อมูลก่อนหน้านี้)
-- หมายเหตุ: ข้อมูลหมวดหมู่หลัก (Electronics, Clothing, Home & Garden) ถูก Seed ไว้ใน schema_v2.sql แล้ว
-- คำสั่งด้านล่างจะเพิ่มหมวดหมู่ย่อยตัวอย่าง (สามารถลบหรือแก้ไขได้ตามต้องการ)

-- ดึง id ของหมวดหมู่หลักก่อน
SET @electronics_id = (SELECT id FROM product_categories WHERE name = 'Electronics' LIMIT 1);
SET @clothing_id = (SELECT id FROM product_categories WHERE name = 'Clothing' LIMIT 1);
SET @home_id = (SELECT id FROM product_categories WHERE name = 'Home & Garden' LIMIT 1);

-- เพิ่มหมวดหมู่ย่อย
INSERT IGNORE INTO product_categories (uuid, parent_id, name, description) VALUES 
(UUID(), @electronics_id, 'Smartphones', 'Mobile phones and accessories'),
(UUID(), @electronics_id, 'Laptops', 'Laptops and notebooks'),
(UUID(), @electronics_id, 'Audio', 'Headphones, speakers and audio equipment'),
(UUID(), @clothing_id, 'Men', 'Men clothing and fashion'),
(UUID(), @clothing_id, 'Women', 'Women clothing and fashion'),
(UUID(), @clothing_id, 'Kids', 'Kids clothing and fashion'),
(UUID(), @home_id, 'Kitchen', 'Kitchen appliances and tools'),
(UUID(), @home_id, 'Furniture', 'Home furniture');
