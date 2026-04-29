const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Store = require('../models/storeModel');

const formatOrderResponse = (order) => {
    if (!order) return null;
    return {
        id: order.uuid,
        total_amount: order.total_amount,
        status: order.status,
        shipping_address: order.shipping_address,
        created_at: order.created_at,
        items: order.items ? order.items.map(i => ({
            id: i.uuid,
            product_name: i.product_name,
            variant_details: i.variant_details, // added
            price: i.price,
            quantity: i.quantity
        })) : []
    };
};

const createOrder = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const { shipping_address } = req.body;

        if (!shipping_address) {
            return res.status(400).json({ success: false, message: 'Shipping address is required' });
        }

        const cart = await Cart.getOrCreateCart(buyerId);
        const items = await Cart.getCartItems(cart.id);

        if (items.length === 0) {
            return res.status(400).json({ success: false, message: 'Your cart is empty' });
        }

        const storeGroups = {};
        for (const item of items) {
            if (!storeGroups[item.store_id]) {
                storeGroups[item.store_id] = [];
            }
            storeGroups[item.store_id].push(item);
        }

        const createdOrderIds = [];

        for (const storeId in storeGroups) {
            const storeItems = storeGroups[storeId];
            const result = await Order.createOrderWithItems(buyerId, storeId, storeItems, shipping_address);
            createdOrderIds.push(result.uuid);
        }

        await Cart.clearCart(cart.id);

        res.status(201).json({ 
            success: true, 
            message: 'Orders created successfully', 
            data: { order_ids: createdOrderIds } 
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const orders = await Order.findByBuyerId(buyerId);
        res.status(200).json({ success: true, data: orders.map(formatOrderResponse) });
    } catch (error) {
        console.error('Error fetching my orders:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const store = await Store.findBySellerId(sellerId);

        if (!store) {
            return res.status(400).json({ success: false, message: 'You do not have a store' });
        }

        const orders = await Order.findByStoreId(store.id);
        res.status(200).json({ success: true, data: orders.map(formatOrderResponse) });
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { id } = req.params; // order uuid
        const { status } = req.body;

        const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findByUuid(id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const store = await Store.findBySellerId(sellerId);
        const isAdmin = req.user.roles && req.user.roles.includes('admin');

        if (!isAdmin && (!store || order.store_id !== store.id)) {
            return res.status(403).json({ success: false, message: 'Forbidden. This order does not belong to your store.' });
        }

        await Order.updateStatusByUuid(id, status);

        res.status(200).json({ success: true, message: 'Order status updated' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.status(200).json({ success: true, data: orders.map(formatOrderResponse) });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getSellerOrders,
    updateOrderStatus,
    getAllOrders
};
