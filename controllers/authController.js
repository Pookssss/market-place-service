const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const jwtConfig = require('../config/jwt');

const register = async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const { insertId: userId, uuid } = await User.create({ email, password_hash, full_name });

        let roleName = 'buyer';
        if (role === 'seller') {
            roleName = 'seller';
        }
        
        const roleData = await Role.findByName(roleName);
        if (roleData) {
            await User.assignRole(userId, roleData.id);
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { id: uuid, email, full_name, role: roleName }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ success: false, message: 'Account is not active' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Payload เก็บ internal ID ไว้เพื่อให้ query เร็ว แต่ไม่ควรส่งไปให้ Client ใช้ทำอะไร
        const payload = {
            id: user.id,
            uuid: user.uuid,
            email: user.email,
            full_name: user.full_name
        };

        const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
        const userRolesPerms = await User.getUserRolesAndPermissions(user.id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.uuid,
                email: user.email,
                full_name: user.full_name,
                roles: userRolesPerms.roles,
                permissions: userRolesPerms.permissions
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.uuid,
                email: user.email,
                full_name: user.full_name,
                status: user.status,
                roles: req.user.roles,
                permissions: req.user.permissions
            }
        });
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    register,
    login,
    getMe
};
