-- =====================================================
-- V1.0.3: Seed Default Admin User
-- =====================================================
-- Password: Admin@123 (BCrypt encoded)

INSERT INTO users (username, email, password_hash, full_name, phone, is_active, created_at, created_by)
VALUES (
    'admin',
    'admin@storyline.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System Administrator',
    '+91-9999999999',
    TRUE,
    NOW(),
    'system'
);

-- Assign ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ADMIN';
