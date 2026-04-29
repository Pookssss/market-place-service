const db = require('../config/db');
const crypto = require('crypto');

const Category = {
    // ดึงหมวดหมู่ทั้งหมดแบบ Flat list
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM product_categories ORDER BY level ASC, name ASC');
        return rows;
    },

    // ดึงหมวดหมู่ทั้งหมดแล้วจัดเป็น Tree (parent → children)
    getTree: async () => {
        const [rows] = await db.query('SELECT * FROM product_categories ORDER BY level ASC, name ASC');

        // สร้าง Map สำหรับ lookup
        const map = {};
        rows.forEach(row => {
            map[row.id] = {
                id: row.uuid,
                name: row.name,
                description: row.description,
                image_url: row.image_url,
                level: row.level,
                path: row.path,
                children: []
            };
        });

        // จัดลำดับชั้น
        const tree = [];
        rows.forEach(row => {
            if (row.parent_id && map[row.parent_id]) {
                map[row.parent_id].children.push(map[row.id]);
            } else {
                tree.push(map[row.id]);
            }
        });

        return tree;
    },

    findByUuid: async (uuid) => {
        const [rows] = await db.query('SELECT * FROM product_categories WHERE uuid = ?', [uuid]);
        return rows[0];
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM product_categories WHERE id = ?', [id]);
        return rows[0];
    },

    // ดึงลูกหลานทั้งหมดของหมวดหมู่นี้ด้วย path LIKE (เร็วมาก)
    getDescendants: async (path) => {
        const [rows] = await db.query('SELECT * FROM product_categories WHERE path LIKE ? AND path != ? ORDER BY level ASC, name ASC', [`${path}%`, path]);
        return rows;
    },

    create: async (data) => {
        const { name, description, parent_id, image_url } = data;
        const uuid = crypto.randomUUID();

        // คำนวณ level และ path
        let level = 0;
        let parentPath = '/';

        if (parent_id) {
            const [parents] = await db.query('SELECT level, path FROM product_categories WHERE id = ?', [parent_id]);
            if (parents.length > 0) {
                level = parents[0].level + 1;
                parentPath = parents[0].path;
            }
        }

        const [result] = await db.query(
            'INSERT INTO product_categories (uuid, parent_id, level, path, name, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uuid, parent_id || null, level, '/', name, description || null, image_url || null]
        );

        // อัปเดต path หลัง insert (เพราะต้องใช้ insertId)
        const newPath = `${parentPath}${result.insertId}/`;
        await db.query('UPDATE product_categories SET path = ? WHERE id = ?', [newPath, result.insertId]);

        return { insertId: result.insertId, uuid };
    },

    update: async (id, data) => {
        const { name, description, parent_id, image_url } = data;

        // ดึงข้อมูลเดิมก่อน
        const [current] = await db.query('SELECT path FROM product_categories WHERE id = ?', [id]);
        const oldPath = current[0].path;

        // คำนวณ level และ path ใหม่
        let level = 0;
        let newPath = `/${id}/`;

        if (parent_id) {
            const [parents] = await db.query('SELECT level, path FROM product_categories WHERE id = ?', [parent_id]);
            if (parents.length > 0) {
                level = parents[0].level + 1;
                newPath = `${parents[0].path}${id}/`;
            }
        }

        // อัปเดตตัวเอง
        await db.query(
            'UPDATE product_categories SET name = ?, description = ?, parent_id = ?, image_url = ?, level = ?, path = ? WHERE id = ?',
            [name, description || null, parent_id || null, image_url || null, level, newPath, id]
        );

        // อัปเดต path ของลูกหลานทั้งหมด (เปลี่ยน prefix เก่าเป็นใหม่)
        if (oldPath !== newPath) {
            await db.query(
                'UPDATE product_categories SET path = REPLACE(path, ?, ?), level = level + ? WHERE path LIKE ? AND id != ?',
                [oldPath, newPath, level - (current[0].level || 0), `${oldPath}%`, id]
            );
        }

        return 1;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM product_categories WHERE id = ?', [id]);
        return result.affectedRows;
    },

    // ดึงหมวดหมู่ย่อยทั้งหมดของ parent (direct children only)
    getChildren: async (parentId) => {
        const [rows] = await db.query('SELECT * FROM product_categories WHERE parent_id = ? ORDER BY name ASC', [parentId]);
        return rows;
    }
};

module.exports = Category;
