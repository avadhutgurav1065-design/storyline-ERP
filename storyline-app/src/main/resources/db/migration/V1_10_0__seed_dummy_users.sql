-- =====================================================
-- V1.10.0: Seed Dummy Users for Testing Roles
-- =====================================================
-- Password for all: Admin@123 (BCrypt encoded)

-- 1. Insert Users
INSERT INTO users (username, email, password_hash, full_name, phone, is_active, created_at, created_by) VALUES 
('event_manager', 'event_manager@storyline.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Event Manager', '1111111111', TRUE, NOW(), 'system'),
('event_head', 'event_head@storyline.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Event Head', '2222222222', TRUE, NOW(), 'system'),
('team_head', 'team_head@storyline.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Team Head', '3333333333', TRUE, NOW(), 'system'),
('team_member', 'team_member@storyline.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Team Member', '4444444444', TRUE, NOW(), 'system'),
('finance_manager', 'finance_manager@storyline.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Finance Manager', '5555555555', TRUE, NOW(), 'system'),
('inventory_manager', 'inventory_manager@storyline.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Inventory Manager', '6666666666', TRUE, NOW(), 'system'),
('vendor_user', 'vendor@storyline.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Vendor User', '7777777777', TRUE, NOW(), 'system')
ON CONFLICT (username) DO NOTHING;

-- 2. Assign Roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'event_manager' AND r.name = 'EVENT_MANAGER'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'event_head' AND r.name = 'EVENT_HEAD'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'team_head' AND r.name = 'TEAM_HEAD'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'team_member' AND r.name = 'TEAM_MEMBER'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'finance_manager' AND r.name = 'FINANCE_MANAGER'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'inventory_manager' AND r.name = 'INVENTORY_MANAGER'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'vendor_user' AND r.name = 'VENDOR'
ON CONFLICT DO NOTHING;
