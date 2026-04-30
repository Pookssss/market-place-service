const db = require('../config/db');
const crypto = require('crypto');

const Store = {
    create: async (storeData) => {
        const { seller_id, name, description, profile_image_url, cover_image_url } = storeData;
        const uuid = crypto.randomUUID();
        const [result] = await db.query(
            'INSERT INTO stores (uuid, seller_id, name, description, profile_image_url, cover_image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [uuid, seller_id, name, description || null, profile_image_url || null, cover_image_url || null]
        );
        return { insertId: result.insertId, uuid };
    },

    findBySellerId: async (sellerId) => {
        const [rows] = await db.query('SELECT * FROM stores WHERE seller_id = ?', [sellerId]);
        return rows[0]; 
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM stores WHERE id = ?', [id]);
        return rows[0];
    },

    findByUuid: async (uuid) => {
        const [rows] = await db.query('SELECT * FROM stores WHERE uuid = ?', [uuid]);
        return rows[0];
    },

    update: async (id, storeData) => {
        const { name, description, status, profile_image_url, cover_image_url } = storeData;
        
        let query = 'UPDATE stores SET name = ?, description = ?';
        let params = [name, description || null];

        if (status) {
            query += ', status = ?';
            params.push(status);
        }

        if (profile_image_url !== undefined) {
            query += ', profile_image_url = ?';
            params.push(profile_image_url);
        }

        if (cover_image_url !== undefined) {
            query += ', cover_image_url = ?';
            params.push(cover_image_url);
        }

        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await db.query(query, params);
        return result.affectedRows;
    }
};

module.exports = Store;
