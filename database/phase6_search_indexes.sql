-- Phase 6: เพิ่ม Index สำหรับ Search & Filter

-- 1. Full-Text Index สำหรับค้นหาชื่อ + description
ALTER TABLE products ADD FULLTEXT INDEX ft_product_search (name, description);

-- 2. Index สำหรับ Filter ราคา
ALTER TABLE products ADD INDEX idx_product_price (price);

-- 3. Composite Index สำหรับ status + price (ใช้บ่อยมากตอน Filter)
ALTER TABLE products ADD INDEX idx_product_status_price (status, price);

-- 4. Index สำหรับ category_id (ถ้ายังไม่มี)
-- ALTER TABLE products ADD INDEX idx_product_category (category_id);
-- หมายเหตุ: FK จะสร้าง index ให้อัตโนมัติแล้ว

-- 5. Index สำหรับ store_id (ถ้ายังไม่มี)
-- ALTER TABLE products ADD INDEX idx_product_store (store_id);
-- หมายเหตุ: FK จะสร้าง index ให้อัตโนมัติแล้ว
