-- =====================================================
-- V1.0.1: Seed Default Roles
-- =====================================================

INSERT INTO roles (name, description, is_system_role, created_at, created_by) VALUES
('ADMIN',             'Full system access',                              TRUE, NOW(), 'system'),
('EVENT_MANAGER',     'Manages events, teams, and vendors',              TRUE, NOW(), 'system'),
('EVENT_HEAD',        'Leads assigned events',                           TRUE, NOW(), 'system'),
('TEAM_HEAD',         'Manages own team and tasks',                      TRUE, NOW(), 'system'),
('TEAM_MEMBER',       'Executes assigned tasks',                         TRUE, NOW(), 'system'),
('FINANCE_MANAGER',   'Manages invoices, payments, expenses, and P&L',   TRUE, NOW(), 'system'),
('INVENTORY_MANAGER', 'Manages hamper inventory and manufacturing',      TRUE, NOW(), 'system'),
('VENDOR',            'External vendor with limited portal access',      TRUE, NOW(), 'system');
