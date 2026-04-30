const Store = require('../models/storeModel');

const createStore = async (req, res) => {
    try {
        const { name, description } = req.body;
        const sellerId = req.user.id; // Internal ID from JWT

        if (!name) {
            return res.status(400).json({ success: false, message: 'Store name is required' });
        }

        const existingStore = await Store.findBySellerId(sellerId);
        if (existingStore) {
            return res.status(400).json({ success: false, message: 'You already have a store' });
        }

        let profile_image_url = null;
        let cover_image_url = null;

        if (req.files) {
            if (req.files['profile_image'] && req.files['profile_image'].length > 0) {
                profile_image_url = req.files['profile_image'][0].filename;
            }
            if (req.files['cover_image'] && req.files['cover_image'].length > 0) {
                cover_image_url = req.files['cover_image'][0].filename;
            }
        }

        const { insertId, uuid } = await Store.create({ 
            seller_id: sellerId, 
            name, 
            description,
            profile_image_url,
            cover_image_url
        });

        res.status(201).json({
            success: true,
            message: 'Store created successfully',
            data: { id: uuid, name, description, profile_image_url, cover_image_url }
        });
    } catch (error) {
        console.error('Error creating store:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getMyStore = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const store = await Store.findBySellerId(sellerId);

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        res.status(200).json({ 
            success: true, 
            data: {
                id: store.uuid,
                name: store.name,
                description: store.description,
                status: store.status,
                profile_image_url: store.profile_image_url,
                cover_image_url: store.cover_image_url
            } 
        });
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getPublicStore = async (req, res) => {
    try {
        const { id } = req.params; // UUID
        const store = await Store.findByUuid(id);

        if (!store || store.status !== 'active') {
            return res.status(404).json({ success: false, message: 'Store not found or inactive' });
        }

        res.status(200).json({ 
            success: true, 
            data: {
                id: store.uuid,
                name: store.name,
                description: store.description,
                profile_image_url: store.profile_image_url,
                cover_image_url: store.cover_image_url
            } 
        });
    } catch (error) {
        console.error('Error fetching public store:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getPublicStoreWithProducts = async (req, res) => {
    try {
        const { id } = req.params; // UUID
        const store = await Store.findByUuid(id);

        if (!store || store.status !== 'active') {
            return res.status(404).json({ success: false, message: 'Store not found or inactive' });
        }

        // ดึงสินค้าของร้านค้า
        const Product = require('../models/productModel');
        const products = await Product.getByStoreId(store.id);

        // เอาเฉพาะข้อมูลที่จำเป็นสำหรับแสดง Card
        const productCards = products.map(p => ({
            id: p.uuid,
            name: p.name,
            price: p.price,
            image_url: p.image_url,
            category: p.category ? { id: p.category.id, name: p.category.name } : null
        }));

        res.status(200).json({ 
            success: true, 
            data: {
                id: store.uuid,
                name: store.name,
                description: store.description,
                profile_image_url: store.profile_image_url,
                cover_image_url: store.cover_image_url,
                products: productCards
            } 
        });
    } catch (error) {
        console.error('Error fetching public store with products:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateStore = async (req, res) => {
    try {
        const { id } = req.params; // This is actually uuid now
        const { name, description, status } = req.body;
        const sellerId = req.user.id;

        const store = await Store.findByUuid(id);
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const isAdmin = req.user.roles && req.user.roles.includes('admin');
        if (store.seller_id !== sellerId && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Forbidden. You are not the owner of this store.' });
        }

        if (!name) {
            return res.status(400).json({ success: false, message: 'Store name is required' });
        }

        let profile_image_url = undefined;
        let cover_image_url = undefined;

        if (req.files) {
            if (req.files['profile_image'] && req.files['profile_image'].length > 0) {
                profile_image_url = req.files['profile_image'][0].filename;
            }
            if (req.files['cover_image'] && req.files['cover_image'].length > 0) {
                cover_image_url = req.files['cover_image'][0].filename;
            }
        }

        await Store.update(store.id, { 
            name, 
            description, 
            status,
            profile_image_url,
            cover_image_url
        }); // use internal ID to update

        res.status(200).json({
            success: true,
            message: 'Store updated successfully'
        });
    } catch (error) {
        console.error('Error updating store:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    createStore,
    getMyStore,
    getPublicStore,
    getPublicStoreWithProducts,
    updateStore
};
