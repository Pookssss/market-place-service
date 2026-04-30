-- Phase 5.3: เพิ่มค่าตัวเลือก Screen Size สำหรับ Smartphones

-- เปลี่ยน Screen Size จาก text → select
UPDATE category_attributes SET input_type = 'select' 
WHERE name = 'Screen Size' AND category_id = (SELECT id FROM product_categories WHERE name = 'Smartphones' LIMIT 1);

-- เพิ่มค่าตัวเลือก
SET @sm_screen = (SELECT id FROM category_attributes WHERE name = 'Screen Size' AND category_id = (SELECT id FROM product_categories WHERE name = 'Smartphones' LIMIT 1) LIMIT 1);

INSERT INTO category_attribute_values (uuid, attribute_id, value, sort_order) VALUES
(UUID(), @sm_screen, '5.0 inch', 1),
(UUID(), @sm_screen, '5.5 inch', 2),
(UUID(), @sm_screen, '6.1 inch', 3),
(UUID(), @sm_screen, '6.4 inch', 4),
(UUID(), @sm_screen, '6.7 inch', 5),
(UUID(), @sm_screen, '6.8 inch', 6),
(UUID(), @sm_screen, '6.9 inch', 7);
