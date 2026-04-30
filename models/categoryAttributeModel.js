const db = require('../config/db');
const crypto = require('crypto');

const CategoryAttribute = {
    // ดึง Attributes ทั้งหมดของหมวดหมู่ พร้อม Values (ถ้า input_type = select)
    getByCategoryId: async (categoryId) => {
        const [attributes] = await db.query(
            'SELECT * FROM category_attributes WHERE category_id = ? ORDER BY sort_order ASC, name ASC',
            [categoryId]
        );

        if (attributes.length === 0) return [];

        // ดึง Values สำหรับ Attributes ที่เป็น select
        const selectAttrIds = attributes.filter(a => a.input_type === 'select').map(a => a.id);

        let valuesMap = {};
        if (selectAttrIds.length > 0) {
            const [values] = await db.query(
                'SELECT * FROM category_attribute_values WHERE attribute_id IN (?) ORDER BY sort_order ASC',
                [selectAttrIds]
            );
            values.forEach(v => {
                if (!valuesMap[v.attribute_id]) valuesMap[v.attribute_id] = [];
                valuesMap[v.attribute_id].push({
                    id: v.uuid,
                    value: v.value
                });
            });
        }

        return attributes.map(attr => ({
            id: attr.uuid,
            name: attr.name,
            input_type: attr.input_type,
            is_required: !!attr.is_required,
            sort_order: attr.sort_order,
            values: valuesMap[attr.id] || []
        }));
    },

    findByUuid: async (uuid) => {
        const [rows] = await db.query('SELECT * FROM category_attributes WHERE uuid = ?', [uuid]);
        return rows[0];
    },

    // หา Attribute ด้วยชื่อ (สำหรับ search filter)
    findByName: async (name, categoryId = null) => {
        let sql = 'SELECT * FROM category_attributes WHERE name = ?';
        const params = [name];
        if (categoryId) {
            sql += ' AND category_id = ?';
            params.push(categoryId);
        }
        sql += ' LIMIT 1';
        const [rows] = await db.query(sql, params);
        return rows[0];
    },

    create: async (data) => {
        const { category_id, name, input_type, is_required, sort_order } = data;
        const uuid = crypto.randomUUID();
        const [result] = await db.query(
            'INSERT INTO category_attributes (uuid, category_id, name, input_type, is_required, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [uuid, category_id, name, input_type || 'text', is_required || false, sort_order || 0]
        );
        return { insertId: result.insertId, uuid };
    },

    update: async (id, data) => {
        const { name, input_type, is_required, sort_order } = data;
        const [result] = await db.query(
            'UPDATE category_attributes SET name = ?, input_type = ?, is_required = ?, sort_order = ? WHERE id = ?',
            [name, input_type || 'text', is_required || false, sort_order || 0, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM category_attributes WHERE id = ?', [id]);
        return result.affectedRows;
    },

    // จัดการ Values ของ Attribute (สำหรับ select)
    addValue: async (attributeId, value, sortOrder) => {
        const uuid = crypto.randomUUID();
        const [result] = await db.query(
            'INSERT INTO category_attribute_values (uuid, attribute_id, value, sort_order) VALUES (?, ?, ?, ?)',
            [uuid, attributeId, value, sortOrder || 0]
        );
        return { insertId: result.insertId, uuid };
    },

    removeValue: async (valueUuid) => {
        const [result] = await db.query('DELETE FROM category_attribute_values WHERE uuid = ?', [valueUuid]);
        return result.affectedRows;
    },

    // บันทึกค่า Attributes ของสินค้า (bulk upsert)
    saveProductAttributes: async (productId, attributesArray, connection = null) => {
        const conn = connection || db;

        // ลบค่าเก่าทั้งหมดก่อน
        await conn.query('DELETE FROM product_attribute_values WHERE product_id = ?', [productId]);

        if (!attributesArray || attributesArray.length === 0) return;

        for (const attr of attributesArray) {
            // attr.attribute_id เป็น UUID → ต้องแปลงเป็น internal id
            const [rows] = await conn.query('SELECT id FROM category_attributes WHERE uuid = ?', [attr.attribute_id]);
            if (rows.length === 0) continue;

            await conn.query(
                'INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES (?, ?, ?)',
                [productId, rows[0].id, attr.value]
            );
        }
    },

    // ดึงค่า Attributes ของสินค้า
    getProductAttributes: async (productIds) => {
        if (productIds.length === 0) return {};

        const [rows] = await db.query(`
            SELECT pav.product_id, ca.name as attribute_name, ca.uuid as attribute_uuid, pav.value
            FROM product_attribute_values pav
            JOIN category_attributes ca ON pav.attribute_id = ca.id
            WHERE pav.product_id IN (?)
            ORDER BY ca.sort_order ASC
        `, [productIds]);

        const map = {};
        rows.forEach(row => {
            if (!map[row.product_id]) map[row.product_id] = [];
            map[row.product_id].push({
                id: row.attribute_uuid,
                name: row.attribute_name,
                value: row.value
            });
        });

        return map;
    }
};

module.exports = CategoryAttribute;
