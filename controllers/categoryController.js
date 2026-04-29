const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const CategoryAttribute = require('../models/categoryAttributeModel');

const formatCategoryResponse = (cat) => {
    if (!cat) return null;
    return {
        id: cat.uuid,
        name: cat.name,
        description: cat.description,
        image_url: cat.image_url
    };
};

// GET /api/categories — ดึงหมวดหมู่ทั้งหมดแบบ Tree
const getAllCategories = async (req, res) => {
    try {
        const tree = await Category.getTree();
        res.status(200).json({ success: true, data: tree });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/categories/:id — ดึงหมวดหมู่เดียว + สินค้าในหมวด
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params; // UUID
        const category = await Category.findByUuid(id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // ดึงสินค้าในหมวดนี้
        const products = await Product.getAll(); // ใช้ getAll แล้ว filter ฝั่ง JS (เพราะ getAll ดึง variants+images มาด้วย)
        const filteredProducts = products.filter(p => p.category_id === category.id);

        // ดึงหมวดหมู่ย่อย
        const children = await Category.getChildren(category.id);

        res.status(200).json({
            success: true,
            data: {
                ...formatCategoryResponse(category),
                children: children.map(c => formatCategoryResponse(c)),
                products: filteredProducts.map(p => ({
                    id: p.uuid,
                    name: p.name,
                    price: p.price,
                    image_url: p.image_url,
                    images: p.images || []
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/categories — สร้างหมวดหมู่ (Admin only)
const createCategory = async (req, res) => {
    try {
        const { name, description, parent_id, image_url } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        // ถ้ามี parent_id (UUID) ให้หา internal id
        let internalParentId = null;
        if (parent_id) {
            const parent = await Category.findByUuid(parent_id);
            if (!parent) {
                return res.status(404).json({ success: false, message: 'Parent category not found' });
            }
            internalParentId = parent.id;
        }

        const { insertId, uuid } = await Category.create({ name, description, parent_id: internalParentId, image_url });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: { id: uuid, name, description }
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PUT /api/categories/:id — อัปเดตหมวดหมู่ (Admin only)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params; // UUID
        const { name, description, parent_id, image_url } = req.body;

        const category = await Category.findByUuid(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        // ถ้ามี parent_id (UUID) ให้หา internal id
        let internalParentId = null;
        if (parent_id) {
            const parent = await Category.findByUuid(parent_id);
            if (!parent) {
                return res.status(404).json({ success: false, message: 'Parent category not found' });
            }
            // ป้องกันการอ้างอิงตัวเอง
            if (parent.id === category.id) {
                return res.status(400).json({ success: false, message: 'Category cannot be its own parent' });
            }
            internalParentId = parent.id;
        }

        await Category.update(category.id, { name, description, parent_id: internalParentId, image_url });

        res.status(200).json({ success: true, message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// DELETE /api/categories/:id — ลบหมวดหมู่ (Admin only)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params; // UUID

        const category = await Category.findByUuid(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        await Category.delete(category.id);
        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/categories/:id/attributes — ดึง Attributes ของหมวดหมู่
const getCategoryAttributes = async (req, res) => {
    try {
        const { id } = req.params; // UUID
        const category = await Category.findByUuid(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const attributes = await CategoryAttribute.getByCategoryId(category.id);
        res.status(200).json({ success: true, data: attributes });
    } catch (error) {
        console.error('Error fetching category attributes:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/categories/:id/attributes — เพิ่ม Attribute ให้หมวดหมู่ (Admin)
const createCategoryAttribute = async (req, res) => {
    try {
        const { id } = req.params; // category UUID
        const { name, input_type, is_required, sort_order, values } = req.body;

        const category = await Category.findByUuid(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        if (!name) {
            return res.status(400).json({ success: false, message: 'Attribute name is required' });
        }

        const { insertId, uuid } = await CategoryAttribute.create({
            category_id: category.id, name, input_type, is_required, sort_order
        });

        // ถ้าส่ง values มาด้วย (สำหรับ select) ให้เพิ่มเข้าไปเลย
        if (values && Array.isArray(values) && input_type === 'select') {
            for (let i = 0; i < values.length; i++) {
                await CategoryAttribute.addValue(insertId, values[i], i + 1);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Attribute created successfully',
            data: { id: uuid, name, input_type }
        });
    } catch (error) {
        console.error('Error creating attribute:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PUT /api/categories/attributes/:id — อัปเดต Attribute (Admin)
const updateCategoryAttribute = async (req, res) => {
    try {
        const { id } = req.params; // attribute UUID
        const { name, input_type, is_required, sort_order } = req.body;

        const attribute = await CategoryAttribute.findByUuid(id);
        if (!attribute) {
            return res.status(404).json({ success: false, message: 'Attribute not found' });
        }
        if (!name) {
            return res.status(400).json({ success: false, message: 'Attribute name is required' });
        }

        await CategoryAttribute.update(attribute.id, { name, input_type, is_required, sort_order });
        res.status(200).json({ success: true, message: 'Attribute updated successfully' });
    } catch (error) {
        console.error('Error updating attribute:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// DELETE /api/categories/attributes/:id — ลบ Attribute (Admin)
const deleteCategoryAttribute = async (req, res) => {
    try {
        const { id } = req.params; // attribute UUID

        const attribute = await CategoryAttribute.findByUuid(id);
        if (!attribute) {
            return res.status(404).json({ success: false, message: 'Attribute not found' });
        }

        await CategoryAttribute.delete(attribute.id);
        res.status(200).json({ success: true, message: 'Attribute deleted successfully' });
    } catch (error) {
        console.error('Error deleting attribute:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/categories/attributes/:id/values — เพิ่ม Value ให้ Attribute (Admin)
const addAttributeValue = async (req, res) => {
    try {
        const { id } = req.params; // attribute UUID
        const { value, sort_order } = req.body;

        const attribute = await CategoryAttribute.findByUuid(id);
        if (!attribute) {
            return res.status(404).json({ success: false, message: 'Attribute not found' });
        }
        if (!value) {
            return res.status(400).json({ success: false, message: 'Value is required' });
        }

        const result = await CategoryAttribute.addValue(attribute.id, value, sort_order);
        res.status(201).json({ success: true, message: 'Value added', data: { id: result.uuid, value } });
    } catch (error) {
        console.error('Error adding attribute value:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// DELETE /api/categories/attributes/values/:id — ลบ Value (Admin)
const removeAttributeValue = async (req, res) => {
    try {
        const { id } = req.params; // value UUID
        const affectedRows = await CategoryAttribute.removeValue(id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Value not found' });
        }
        res.status(200).json({ success: true, message: 'Value removed' });
    } catch (error) {
        console.error('Error removing attribute value:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryAttributes,
    createCategoryAttribute,
    updateCategoryAttribute,
    deleteCategoryAttribute,
    addAttributeValue,
    removeAttributeValue
};
