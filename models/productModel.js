const db = require('../config/db');
const crypto = require('crypto');

const attachImagesToProducts = async (products) => {
    if (products.length === 0) return products;
    const productIds = products.map(p => p.id);
    const [images] = await db.query('SELECT * FROM product_images WHERE product_id IN (?) ORDER BY is_primary DESC, created_at ASC', [productIds]);
    
    products.forEach(product => {
        product.images = images.filter(img => img.product_id === product.id).map(img => ({
            id: img.uuid,
            url: img.image_url,
            is_primary: !!img.is_primary
        }));
    });
    return products;
};

const attachVariantsToProducts = async (products) => {
    if (products.length === 0) return products;
    const productIds = products.map(p => p.id);
    const [variants] = await db.query('SELECT * FROM product_variants WHERE product_id IN (?)', [productIds]);
    
    if (variants.length > 0) {
        const variantIds = variants.map(v => v.id);
        const [options] = await db.query('SELECT * FROM product_variant_options WHERE variant_id IN (?)', [variantIds]);
        variants.forEach(variant => {
            variant.options = options
                .filter(opt => opt.variant_id === variant.id)
                .map(opt => ({ name: opt.option_name, value: opt.option_value }));
        });
    }
    
    products.forEach(product => {
        product.variants = variants.filter(v => v.product_id === product.id);
    });
    return products;
};

const attachCategoryToProducts = async (products) => {
    if (products.length === 0) return products;
    const categoryIds = [...new Set(products.map(p => p.category_id).filter(Boolean))];
    if (categoryIds.length === 0) {
        products.forEach(p => { p.category = null; });
        return products;
    }
    const [categories] = await db.query('SELECT * FROM product_categories WHERE id IN (?)', [categoryIds]);
    const catMap = {};
    categories.forEach(c => { catMap[c.id] = { id: c.uuid, name: c.name }; });
    products.forEach(product => {
        product.category = product.category_id ? (catMap[product.category_id] || null) : null;
    });
    return products;
};

const attachAttributesToProducts = async (products) => {
    if (products.length === 0) return products;
    const productIds = products.map(p => p.id);
    const CategoryAttribute = require('./categoryAttributeModel');
    const attrMap = await CategoryAttribute.getProductAttributes(productIds);
    products.forEach(product => {
        product.attributes = attrMap[product.id] || [];
    });
    return products;
};

const getProductsWithExtras = async (rows) => {
    if (rows.length === 0) return rows;
    let products = await attachVariantsToProducts(rows);
    products = await attachImagesToProducts(products);
    products = await attachCategoryToProducts(products);
    products = await attachAttributesToProducts(products);
    return products;
};

const Product = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM products WHERE status = "active" ORDER BY id DESC');
        return await getProductsWithExtras(rows);
    },

    getAllForAdmin: async () => {
        const [rows] = await db.query('SELECT * FROM products ORDER BY id DESC');
        return await getProductsWithExtras(rows);
    },

    getByStoreId: async (storeId) => {
        const [rows] = await db.query('SELECT * FROM products WHERE store_id = ? ORDER BY id DESC', [storeId]);
        return await getProductsWithExtras(rows);
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        const products = await getProductsWithExtras(rows);
        return products[0];
    },

    findByUuid: async (uuid) => {
        const [rows] = await db.query('SELECT * FROM products WHERE uuid = ?', [uuid]);
        return rows[0];
    },

    findByUuidWithVariants: async (uuid) => {
        const [rows] = await db.query('SELECT * FROM products WHERE uuid = ?', [uuid]);
        if (rows.length === 0) return null;
        const products = await getProductsWithExtras(rows);
        return products[0];
    },

    // รองรับการสร้าง Product พร้อม Variants, Images และ Attributes ด้วย Transaction
    createWithVariantsAndImages: async (productData, variantsData, imagesData, attributesData) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { store_id, category_id, name, description, price, stock, status, image_url } = productData;
            const productUuid = crypto.randomUUID();
            
            const [productResult] = await connection.query(
                'INSERT INTO products (uuid, store_id, category_id, name, description, price, stock, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [productUuid, store_id, category_id || null, name, description || null, price, stock || 0, status || 'active', image_url || null]
            );
            const productId = productResult.insertId;

            if (variantsData && variantsData.length > 0) {
                for (const variant of variantsData) {
                    const variantUuid = crypto.randomUUID();
                    const [variantResult] = await connection.query(
                        'INSERT INTO product_variants (uuid, product_id, sku, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
                        [variantUuid, productId, variant.sku || null, variant.price || price, variant.stock || 0, variant.image_url || null]
                    );
                    const variantId = variantResult.insertId;

                    if (variant.options) {
                        for (const [optName, optValue] of Object.entries(variant.options)) {
                            const optUuid = crypto.randomUUID();
                            await connection.query(
                                'INSERT INTO product_variant_options (uuid, variant_id, option_name, option_value) VALUES (?, ?, ?, ?)',
                                [optUuid, variantId, optName, optValue]
                            );
                        }
                    }
                }
            }

            if (imagesData && imagesData.length > 0) {
                for (let i = 0; i < imagesData.length; i++) {
                    const imgUuid = crypto.randomUUID();
                    const isPrimary = i === 0 ? true : false;
                    await connection.query(
                        'INSERT INTO product_images (uuid, product_id, image_url, is_primary) VALUES (?, ?, ?, ?)',
                        [imgUuid, productId, imagesData[i], isPrimary]
                    );
                }
            }

            // Save product attributes
            if (attributesData && attributesData.length > 0) {
                const CategoryAttribute = require('./categoryAttributeModel');
                await CategoryAttribute.saveProductAttributes(productId, attributesData, connection);
            }

            await connection.commit();
            return { insertId: productId, uuid: productUuid };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    update: async (id, productData) => {
        const { category_id, name, description, price, stock, status, image_url } = productData;
        const [result] = await db.query(
            'UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, status = ?, image_url = ? WHERE id = ?',
            [category_id || null, name, description || null, price, stock || 0, status || 'active', image_url || null, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows;
    },

    // หา Variant ด้วย UUID
    findVariantByUuid: async (uuid) => {
        const [rows] = await db.query('SELECT * FROM product_variants WHERE uuid = ?', [uuid]);
        if (rows.length === 0) return null;
        
        const variant = rows[0];
        
        // แนบข้อมูล options มาด้วย
        const [options] = await db.query('SELECT option_name, option_value FROM product_variant_options WHERE variant_id = ?', [variant.id]);
        variant.options = options;
        
        return variant;
    }
};

module.exports = Product;
