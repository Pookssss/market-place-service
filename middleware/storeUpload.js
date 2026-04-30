const multer = require('multer');
const path = require('path');
const fs = require('fs');

// สร้างโฟลเดอร์สำหรับเก็บรูปร้านค้าถ้ายังไม่มี
const uploadDir = path.join(__dirname, '../public/images/stores');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ตั้งค่าที่เก็บไฟล์และชื่อไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // ใช้เวลาปัจจุบันต่อด้วยนามสกุลไฟล์เดิม
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const prefix = file.fieldname === 'profile_image' ? 'store-profile-' : 'store-cover-';
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
});

// กรองชนิดของไฟล์ที่อนุญาต
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, jpg, png, webp, gif) are allowed!'));
    }
};

const storeUpload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาด 5MB
    fileFilter: fileFilter
});

module.exports = storeUpload;
