const db = require('../config/db');
const crypto = require('crypto');

const Cart = {
    getOrCreateCart: async (buyerId) => {
        let [rows] = await db.query('SELECT * FROM carts WHERE buyer_id = ?', [buyerId]);
        
        if (rows.length === 0) {
            const uuid = crypto.randomUUID();
            const [result] = await db.query('INSERT INTO carts (uuid, buyer_id) VALUES (?, ?)', [uuid, buyerId]);
            return { id: result.insertId, uuid, buyer_id: buyerId };
        }
        
        return rows[0];
    },

    getCartItems: async (cartId) => {
        const [rows] = await db.query(`
            SELECT ci.uuid as cart_item_uuid, ci.quantity, ci.variant_id as internal_variant_id,
                   p.id as product_id, p.uuid as product_uuid, p.name as product_name, p.price as base_price, p.image_url, p.store_id, p.stock as base_stock,
                   v.uuid as variant_uuid, v.sku as variant_sku, v.price as variant_price, v.stock as variant_stock
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            LEFT JOIN product_variants v ON ci.variant_id = v.id
            WHERE ci.cart_id = ?
            ORDER BY ci.created_at DESC
        `, [cartId]);

        // แนบข้อมูล Option (Color, Size) ของ Variant ถ้ารายการนั้นมี Variant
        for (let item of rows) {
            if (item.internal_variant_id) {
                const [options] = await db.query('SELECT option_name, option_value FROM product_variant_options WHERE variant_id = ?', [item.internal_variant_id]);
                item.variant_options = options;
            } else {
                item.variant_options = [];
            }
        }

        return rows;
    },

    addItem: async (cartId, productId, quantity, variantId = null) => {
        // เช็คว่ามีสินค้าชิ้นนี้ (และตัวเลือกนี้) ในตะกร้าหรือยัง
        let query = 'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?';
        let params = [cartId, productId];

        if (variantId) {
            query += ' AND variant_id = ?';
            params.push(variantId);
        } else {
            query += ' AND variant_id IS NULL';
        }

        const [existing] = await db.query(query, params);
        
        if (existing.length > 0) {
            const newQty = existing[0].quantity + quantity;
            await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
            return existing[0].id;
        } else {
            const uuid = crypto.randomUUID();
            const [result] = await db.query(
                'INSERT INTO cart_items (uuid, cart_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?, ?)', 
                [uuid, cartId, productId, variantId, quantity]
            );
            return result.insertId;
        }
    },

    updateItemQuantityByUuid: async (cartItemUuid, cartId, quantity) => {
        const [result] = await db.query('UPDATE cart_items SET quantity = ? WHERE uuid = ? AND cart_id = ?', [quantity, cartItemUuid, cartId]);
        return result.affectedRows;
    },

    removeItemByUuid: async (cartItemUuid, cartId) => {
        const [result] = await db.query('DELETE FROM cart_items WHERE uuid = ? AND cart_id = ?', [cartItemUuid, cartId]);
        return result.affectedRows;
    },

    clearCart: async (cartId) => {
        await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    }
};

module.exports = Cart;
