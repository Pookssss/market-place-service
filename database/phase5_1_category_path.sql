-- Phase 5.1: เพิ่มคอลัมน์ level และ path สำหรับ Query ที่เร็วขึ้น

-- 1. เพิ่มคอลัมน์
ALTER TABLE product_categories 
ADD COLUMN level INT NOT NULL DEFAULT 0 AFTER parent_id,
ADD COLUMN path VARCHAR(255) NOT NULL DEFAULT '/' AFTER level;

-- 2. อัปเดต path และ level ของหมวดหมู่หลัก (level 0)
UPDATE product_categories 
SET level = 0, path = CONCAT('/', id, '/') 
WHERE parent_id IS NULL;

-- 3. อัปเดต path และ level ของหมวดหมู่ย่อยระดับ 1
UPDATE product_categories c
JOIN product_categories p ON c.parent_id = p.id
SET c.level = p.level + 1, c.path = CONCAT(p.path, c.id, '/')
WHERE c.parent_id IS NOT NULL AND p.parent_id IS NULL;

-- 4. เพิ่ม INDEX สำหรับ path เพื่อให้ LIKE query เร็วขึ้น
ALTER TABLE product_categories ADD INDEX idx_category_path (path);
ALTER TABLE product_categories ADD INDEX idx_category_level (level);
