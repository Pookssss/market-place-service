-- 1. สร้างตาราง carts (ตะกร้าสินค้า)
-- 1 buyer มี 1 ตะกร้าที่ active ได้
CREATE TABLE IF NOT EXISTS carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. สร้างตาราง cart_items (รายการสินค้าในตะกร้า)
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_product (cart_id, product_id)
);

-- 3. สร้างตาราง orders (คำสั่งซื้อ)
-- รองรับการแบ่ง order ตามร้านค้า (1 order มี 1 store_id)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    store_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- 4. สร้างตาราง order_items (รายการสินค้าในคำสั่งซื้อ)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL, -- เก็บชื่อ ณ เวลาที่ซื้อ เผื่อร้านแก้ชื่อทีหลัง
    price DECIMAL(10,2) NOT NULL,       -- เก็บราคา ณ เวลาที่ซื้อ
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    -- ถ้าลบสินค้าทิ้ง จะเซ็ตเป็น NULL แต่ข้อมูลราคากับชื่อจะยังอยู่
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- CREATE TABLE IF NOT EXISTS order_items (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     order_id INT NOT NULL,
--     product_id VARCHAR(255),
--     product_name VARCHAR(255) NOT NULL,
--     price DECIMAL(10,2) NOT NULL,
--     quantity INT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
--     CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
-- ) ENGINE=InnoDB;


-- CREATE TABLE IF NOT EXISTS order_items (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     order_id INT NOT NULL,
--     product_id INT, -- ลบ NOT NULL ออก เพื่อให้ SET NULL ทำงานได้
--     product_name VARCHAR(255) NOT NULL,
--     price DECIMAL(10,2) NOT NULL,
--     quantity INT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
--     FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
-- );