const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

const getCart = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const cart = await Cart.getOrCreateCart(buyerId);
        const items = await Cart.getCartItems(cart.id);

        const formattedItems = items.map(item => ({
            id: item.cart_item_uuid,
            product: {
                id: item.product_uuid,
                name: item.product_name,
                image_url: item.image_url,
                price: item.internal_variant_id ? item.variant_price : item.base_price,
                stock: item.internal_variant_id ? item.variant_stock : item.base_stock,
                variant: item.internal_variant_id ? {
                    id: item.variant_uuid,
                    sku: item.variant_sku,
                    options: item.variant_options
                } : null
            },
            quantity: item.quantity
        }));

        res.status(200).json({ success: true, cartId: cart.uuid, items: formattedItems });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const addItemToCart = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const { product_id, variant_id, quantity } = req.body; // UUIDs

        if (!product_id || !quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
        }

        const product = await Product.findByUuid(product_id);
        if (!product || product.status !== 'active') {
            return res.status(404).json({ success: false, message: 'Product not found or inactive' });
        }

        let internalVariantId = null;
        let stockToCheck = product.stock;

        if (variant_id) {
            const variant = await Product.findVariantByUuid(variant_id);
            if (!variant || variant.product_id !== product.id) {
                return res.status(404).json({ success: false, message: 'Variant not found for this product' });
            }
            internalVariantId = variant.id;
            stockToCheck = variant.stock;
        }

        if (stockToCheck < quantity) {
            return res.status(400).json({ success: false, message: 'Not enough stock' });
        }

        const cart = await Cart.getOrCreateCart(buyerId);
        await Cart.addItem(cart.id, product.id, quantity, internalVariantId);

        res.status(200).json({ success: true, message: 'Item added to cart' });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const { id } = req.params; // cart_item_uuid
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Invalid quantity' });
        }

        const cart = await Cart.getOrCreateCart(buyerId);
        const affectedRows = await Cart.updateItemQuantityByUuid(id, cart.id, quantity);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item not found in your cart' });
        }

        res.status(200).json({ success: true, message: 'Cart item updated' });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const removeCartItem = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const { id } = req.params; // cart_item_uuid

        const cart = await Cart.getOrCreateCart(buyerId);
        const affectedRows = await Cart.removeItemByUuid(id, cart.id);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item not found in your cart' });
        }

        res.status(200).json({ success: true, message: 'Cart item removed' });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem
};
