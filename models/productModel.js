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

    // ค้นหา + กรอง + เรียงลำดับ + แบ่งหน้า
    search: async (filters = {}) => {
        const {
            q,              // keyword search
            category_id,    // internal category id (ถูกแปลงจาก UUID แล้ว)
            category_path,  // path ของ category (สำหรับดึงลูกหลาน)
            min_price,
            max_price,
            store_id,       // internal store id (ถูกแปลงจาก UUID แล้ว)
            attributes,     // { attributeInternalId: value, ... }
            sort = 'newest',
            page = 1,
            limit = 20
        } = filters;

        // Sanitize pagination
        const safePage = Math.max(1, parseInt(page) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const offset = (safePage - 1) * safeLimit;

        // Build WHERE clauses
        const conditions = ['p.status = ?'];
        const params = ['active'];

        // Keyword search — ลอง FULLTEXT ก่อน, ถ้า table ไม่มี index จะ fallback เป็น LIKE
        let useFullText = false;
        if (q && q.trim()) {
            const keyword = q.trim();
            try {
                // ทดสอบว่ามี FULLTEXT index หรือไม่
                await db.query('SELECT 1 FROM products WHERE MATCH(name, description) AGAINST(? IN BOOLEAN MODE) LIMIT 1', [`${keyword}*`]);
                conditions.push('MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE)');
                params.push(`${keyword}*`);
                useFullText = true;
            } catch (e) {
                // Fallback เป็น LIKE
                conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
                params.push(`%${keyword}%`, `%${keyword}%`);
            }
        }

        // Category filter — ใช้ path LIKE เพื่อรวมลูกหลานทั้งหมด
        if (category_path) {
            const [catIds] = await db.query(
                'SELECT id FROM product_categories WHERE path LIKE ? OR id = ?',
                [`${category_path}%`, category_id]
            );
            if (catIds.length > 0) {
                const ids = catIds.map(c => c.id);
                conditions.push(`p.category_id IN (${ids.map(() => '?').join(',')})`);
                params.push(...ids);
            }
        } else if (category_id) {
            conditions.push('p.category_id = ?');
            params.push(category_id);
        }

        // Price range
        if (min_price !== undefined && min_price !== null && min_price !== '') {
            conditions.push('p.price >= ?');
            params.push(parseFloat(min_price));
        }
        if (max_price !== undefined && max_price !== null && max_price !== '') {
            conditions.push('p.price <= ?');
            params.push(parseFloat(max_price));
        }

        // Store filter
        if (store_id) {
            conditions.push('p.store_id = ?');
            params.push(store_id);
        }

        // Attribute filter — JOIN product_attribute_values สำหรับแต่ละ attribute
        let attrJoins = '';
        let attrIndex = 0;
        if (attributes && Object.keys(attributes).length > 0) {
            for (const [attrId, attrValue] of Object.entries(attributes)) {
                const alias = `pav${attrIndex}`;
                attrJoins += ` INNER JOIN product_attribute_values ${alias} ON p.id = ${alias}.product_id AND ${alias}.attribute_id = ? AND ${alias}.value = ?`;
                params.push(parseInt(attrId), attrValue);
                attrIndex++;
            }
        }

        // Sorting
        let orderBy;
        switch (sort) {
            case 'price_asc': orderBy = 'p.price ASC'; break;
            case 'price_desc': orderBy = 'p.price DESC'; break;
            case 'name_asc': orderBy = 'p.name ASC'; break;
            case 'name_desc': orderBy = 'p.name DESC'; break;
            case 'oldest': orderBy = 'p.id ASC'; break;
            case 'newest':
            default: orderBy = 'p.id DESC'; break;
        }

        const whereClause = conditions.join(' AND ');

        // Count total (สำหรับ pagination)
        const countSql = `SELECT COUNT(DISTINCT p.id) as total FROM products p${attrJoins} WHERE ${whereClause}`;
        // ต้อง clone params เพราะ attrJoins params อยู่ตรงกลาง
        // สร้าง params ใหม่สำหรับ count query
        const countParams = [...params];

        const [countResult] = await db.query(countSql, countParams);
        const total = countResult[0].total;

        // Fetch products
        const dataSql = `SELECT DISTINCT p.* FROM products p${attrJoins} WHERE ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
        const dataParams = [...params, safeLimit, offset];

        const [rows] = await db.query(dataSql, dataParams);

        // Attach extras (variants, images, category, attributes)
        const products = await getProductsWithExtras(rows);

        const totalPages = Math.ceil(total / safeLimit);

        return {
            products,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                total_pages: totalPages,
                has_next: safePage < totalPages,
                has_prev: safePage > 1
            }
        };
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
