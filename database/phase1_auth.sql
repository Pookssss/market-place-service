-- 1. สร้างตาราง users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. สร้างตาราง roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL
);

-- 3. สร้างตาราง permissions
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL
);

-- 4. สร้างตารางเชื่อม user_roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 5. สร้างตารางเชื่อม role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Seed Data (ข้อมูลพื้นฐาน)

-- Roles
INSERT IGNORE INTO roles (name, description) VALUES 
('buyer', 'General user who can buy products'),
('seller', 'User who can manage their own store and products'),
('admin', 'Administrator who can manage users, products, and see dashboard'),
('super_admin', 'Super Administrator with full access');

-- Permissions
INSERT IGNORE INTO permissions (name, description) VALUES 
('product.read', 'Can read active products'),
('product.create', 'Can create products in their own store'),
('product.update.own', 'Can update their own products'),
('product.delete.own', 'Can delete their own products'),
('product.manage.all', 'Can manage all products (Admin)'),
('order.create', 'Can place an order'),
('order.read.own', 'Can view their own orders'),
('order.manage.seller', 'Can manage orders for their store'),
('user.manage', 'Can manage users (Admin)'),
('role.manage', 'Can manage roles and permissions (Super Admin)'),
('admin.dashboard', 'Can view admin dashboard');

-- Assign Permissions to Roles (ตัวอย่าง)
-- สมมติให้ role 'buyer' (id=1)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'buyer' AND p.name IN ('product.read', 'order.create', 'order.read.own');

-- สมมติให้ role 'seller' (id=2)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'seller' AND p.name IN ('product.read', 'product.create', 'product.update.own', 'product.delete.own', 'order.create', 'order.read.own', 'order.manage.seller');

-- สมมติให้ role 'admin' (id=3)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.name IN ('product.read', 'product.manage.all', 'user.manage', 'admin.dashboard');

-- Super Admin ได้ทุกสิทธิ์
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'super_admin';
