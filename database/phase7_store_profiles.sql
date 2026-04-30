-- Phase 7: เพิ่มรูปภาพประจำร้านและรูปปกให้กับตาราง stores
-- รันโค้ดนี้ใน phpMyAdmin 

-- เพิ่มคอลัมน์ profile_image_url สำหรับรูป Logo/Profile ของร้าน
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500) NULL AFTER description;

-- เพิ่มคอลัมน์ cover_image_url สำหรับรูปปก (Cover/Banner) ของร้าน
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500) NULL AFTER profile_image_url;
