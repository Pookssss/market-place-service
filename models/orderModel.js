const db = require('../config/db');
const crypto = require('crypto');

const Order = {
    createOrderWithItems: async (buyerId, storeId, items, shippingAddress) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            let totalAmount = 0;
            for (const item of items) {
                // Determine price to use (Variant price overrides base price)
                const priceToUse = item.internal_variant_id ? item.variant_price : item.base_price;
                totalAmount += priceToUse * item.quantity;
                
                // Deduct Stock
                if (item.internal_variant_id) {
                    const [updateResult] = await connection.query(
                        'UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?',
                        [item.quantity, item.internal_variant_id, item.quantity]
                    );
                    if (updateResult.affectedRows === 0) {
                        throw new Error(`Product ${item.product_name} (Variant) is out of stock or insufficient quantity.`);
                    }
                } else {
                    const [updateResult] = await connection.query(
                        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
                        [item.quantity, item.product_id, item.quantity]
                    );
                    if (updateResult.affectedRows === 0) {
                        throw new Error(`Product ${item.product_name} is out of stock or insufficient quantity.`);
                    }
                }
            }

            const orderUuid = crypto.randomUUID();
            const [orderResult] = await connection.query(
                'INSERT INTO orders (uuid, buyer_id, store_id, total_amount, shipping_address) VALUES (?, ?, ?, ?, ?)',
                [orderUuid, buyerId, storeId, totalAmount, shippingAddress]
            );
            const orderId = orderResult.insertId;

            for (const item of items) {
                const itemUuid = crypto.randomUUID();
                const priceToUse = item.internal_variant_id ? item.variant_price : item.base_price;
                
                let variantDetailsStr = null;
                if (item.variant_options && item.variant_options.length > 0) {
                    // Convert [{option_name: 'Color', option_value: 'Red'}] -> "Color: Red, Size: M"
                    variantDetailsStr = item.variant_options.map(o => `${o.option_name}: ${o.option_value}`).join(', ');
                }

                await connection.query(
                    'INSERT INTO order_items (uuid, order_id, product_id, variant_id, product_name, variant_details, price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [itemUuid, orderId, item.product_id, item.internal_variant_id || null, item.product_name, variantDetailsStr, priceToUse, item.quantity]
                );
            }

            await connection.commit();
            return { insertId: orderId, uuid: orderUuid };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    findByBuyerId: async (buyerId) => {
        const [orders] = await db.query('SELECT uuid, total_amount, status, shipping_address, created_at FROM orders WHERE buyer_id = ? ORDER BY created_at DESC', [buyerId]);
        return orders;
    },

    findByStoreId: async (storeId) => {
        const [orders] = await db.query('SELECT uuid, total_amount, status, shipping_address, created_at FROM orders WHERE store_id = ? ORDER BY created_at DESC', [storeId]);
        return orders;
    },

    getAll: async () => {
        const [orders] = await db.query('SELECT uuid, total_amount, status, shipping_address, created_at FROM orders ORDER BY created_at DESC');
        return orders;
    },

    findByUuid: async (uuid) => {
        const [orders] = await db.query('SELECT * FROM orders WHERE uuid = ?', [uuid]);
        if (orders.length === 0) return null;

        const order = orders[0];
        const [items] = await db.query('SELECT uuid, product_name, variant_details, price, quantity FROM order_items WHERE order_id = ?', [order.id]);
        order.items = items;
        
        return order;
    },

    updateStatusByUuid: async (uuid, status) => {
        const [result] = await db.query('UPDATE orders SET status = ? WHERE uuid = ?', [status, uuid]);
        return result.affectedRows;
    }
};

module.exports = Order;
