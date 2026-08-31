-- =====================================================
-- V1.0.1: Seed Default Roles
-- =====================================================

INSERT INTO roles (name, description, is_system_role, created_at, created_by) VALUES
('ADMIN',             'Super Admin with full system access',             TRUE, NOW(), 'system'),
('EVENT_MANAGER',     'Manages events, teams, inventory, and vendors',   TRUE, NOW(), 'system'),
('TEAM_MANAGER',      'In-house team managing specific events on ground',TRUE, NOW(), 'system'),
('FREELANCER',        'Hired member for specific events and tasks',      TRUE, NOW(), 'system'),
('FINANCE_MANAGER',   'Manages invoices, payments, expenses, and P&L',   TRUE, NOW(), 'system');
