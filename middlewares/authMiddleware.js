const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const User = require('../models/userModel');

const verifyToken = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        token = token.split(' ')[1];
        
        const decoded = jwt.verify(token, jwtConfig.secret);
        req.user = decoded; // { id: 1, email: '...' }

        // Optional: โหลด roles/permissions เก็บไว้ใน req เพื่อใช้ใน middleware ถัดไป (หรือจะเก็บใน JWT เลยก็ได้ แต่ดึงสดจาก DB ชัวร์กว่าเมื่อเปลี่ยนสิทธิ์)
        const userRolesPerms = await User.getUserRolesAndPermissions(req.user.id);
        req.user.roles = userRolesPerms.roles;
        req.user.permissions = userRolesPerms.permissions;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

module.exports = { verifyToken };
