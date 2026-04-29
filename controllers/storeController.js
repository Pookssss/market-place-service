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

        const { insertId, uuid } = await Store.create({ seller_id: sellerId, name, description });

        res.status(201).json({
            success: true,
            message: 'Store created successfully',
            data: { id: uuid, name, description }
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
                status: store.status
            } 
        });
    } catch (error) {
        console.error('Error fetching store:', error);
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

        await Store.update(store.id, { name, description, status }); // use internal ID to update

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
    updateStore
};
