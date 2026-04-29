const db = require('../config/db');
const crypto = require('crypto');

const User = {
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    findByUuid: async (uuid) => {
        const [rows] = await db.query('SELECT * FROM users WHERE uuid = ?', [uuid]);
        return rows[0];
    },

    create: async (userData) => {
        const { email, password_hash, full_name } = userData;
        const uuid = crypto.randomUUID();
        const [result] = await db.query(
            'INSERT INTO users (uuid, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
            [uuid, email, password_hash, full_name]
        );
        return { insertId: result.insertId, uuid };
    },

    assignRole: async (userId, roleId) => {
        await db.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
            [userId, roleId]
        );
    },

    getUserRolesAndPermissions: async (userId) => {
        const [roles] = await db.query(`
            SELECT r.id, r.name 
            FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = ?
        `, [userId]);

        const [permissions] = await db.query(`
            SELECT DISTINCT p.name 
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN user_roles ur ON rp.role_id = ur.role_id
            WHERE ur.user_id = ?
        `, [userId]);

        return {
            roles: roles.map(r => r.name),
            permissions: permissions.map(p => p.name)
        };
    }
};

module.exports = User;
