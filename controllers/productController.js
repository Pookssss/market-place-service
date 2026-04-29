const Product = require('../models/productModel');
const Store = require('../models/storeModel');

// แปลงผลลัพธ์จาก DB ให้โชว์ uuid แทน id (และไม่ต้องส่ง store_id ที่เป็น internal)
const formatProductResponse = (product) => {
    if (!product) return null;
    return {
        id: product.uuid,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        status: product.status,
        image_url: product.image_url,
        created_at: product.created_at,
        category: product.category || null,
        attributes: product.attributes || [],
        images: product.images ? product.images : [],
        variants: product.variants ? product.variants.map(v => ({
            id: v.uuid,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            image_url: v.image_url,
            options: v.options
        })) : []
    };
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.getAll();
        res.status(200).json({ success: true, data: products.map(formatProductResponse) });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params; // UUID
        const product = await Product.findByUuidWithVariants(id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        res.status(200).json({ success: true, data: formatProductResponse(product) });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getMyProducts = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const store = await Store.findBySellerId(sellerId);

        if (!store) {
            return res.status(400).json({ success: false, message: 'You need to create a store first' });
        }

        const products = await Product.getByStoreId(store.id);
        res.status(200).json({ success: true, data: products.map(formatProductResponse) });
    } catch (error) {
        console.error('Error fetching my products:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const createProduct = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const store = await Store.findBySellerId(sellerId);

        if (!store) {
            return res.status(400).json({ success: false, message: 'You need to create a store first' });
        }

        const { category_id, name, description, price, stock, status } = req.body;
        let image_url = req.body.image_url;
        let variants = [];

        if (req.body.variants) {
            try {
                variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid variants format' });
            }
        }

        let attributes = [];
        if (req.body.attributes) {
            try {
                attributes = typeof req.body.attributes === 'string' ? JSON.parse(req.body.attributes) : req.body.attributes;
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid attributes format' });
            }
        }
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'At least 1 product image is required' });
        }

        let imagesData = req.files.map(file => file.filename);
        image_url = imagesData[0]; // Set the first image as primary fallback

        if (!name || price === undefined || price === null) {
            return res.status(400).json({ success: false, message: 'Name and price are required' });
        }
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ success: false, message: 'Price must be a valid positive number' });
        }

        // แปลง category_id จาก UUID เป็น Internal ID
        let internalCategoryId = null;
        if (category_id) {
            const Category = require('../models/categoryModel');
            const cat = await Category.findByUuid(category_id);
            if (!cat) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
            internalCategoryId = cat.id;
        }

        const { insertId, uuid } = await Product.createWithVariantsAndImages({ 
            store_id: store.id, 
            category_id: internalCategoryId, 
            name, 
            description, 
            price, 
            stock, 
            status, 
            image_url 
        }, variants, imagesData, attributes);
        
        res.status(201).json({ 
            success: true, 
            message: 'Product created successfully', 
            data: { id: uuid, name, price, stock: stock || 0, has_variants: variants.length > 0 } 
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params; // UUID
        const sellerId = req.user.id;
        
        const existingProduct = await Product.findByUuid(id);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const store = await Store.findBySellerId(sellerId);
        const isAdmin = req.user.roles && req.user.roles.includes('admin');
        
        if (!isAdmin && (!store || existingProduct.store_id !== store.id)) {
            return res.status(403).json({ success: false, message: 'Forbidden. You do not own this product.' });
        }

        const { category_id, name, description, price, stock, status } = req.body;
        let image_url = req.body.image_url || existingProduct.image_url;
        
        if (req.files && req.files.length > 0) {
            image_url = req.files[0].filename; // สำหรับอัปเดตแบบง่ายๆ เราจะเปลี่ยนรูปหลักก่อน
        }

        if (!name || price === undefined || price === null) {
            return res.status(400).json({ success: false, message: 'Name and price are required' });
        }

        // หมายเหตุ: สำหรับการอัปเดต Variant มักจะทำเป็น API แยกต่างหากเพื่อความไม่งง หรือรับ Array มาอัปเดตหมด 
        // ในที่นี้เน้นอัปเดตสินค้าหลักก่อน
        await Product.update(existingProduct.id, { 
            category_id, name, description, price, stock, status, image_url: image_url || existingProduct.image_url 
        });
        
        res.status(200).json({ 
            success: true, 
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params; // UUID
        const sellerId = req.user.id;
        
        const existingProduct = await Product.findByUuid(id);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const store = await Store.findBySellerId(sellerId);
        const isAdmin = req.user.roles && req.user.roles.includes('admin');
        
        if (!isAdmin && (!store || existingProduct.store_id !== store.id)) {
            return res.status(403).json({ success: false, message: 'Forbidden. You do not own this product.' });
        }

        await Product.delete(existingProduct.id);
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    getMyProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
