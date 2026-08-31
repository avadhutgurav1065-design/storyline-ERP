-- =====================================================
-- V1.0.2: Seed Default Permissions
-- =====================================================
-- Permission format: MODULE | ACTION | SCOPE
-- Modules: CRM, SALES, EVENTS, TEAMS, VENDORS, TASKS, HAMPERS, INVENTORY, FINANCE, REPORTS
-- Actions: CREATE, READ, UPDATE, DELETE, EXPORT, APPROVE
-- Scopes:  ALL, OWN, ASSIGNED

-- CRM Permissions
INSERT INTO permissions (module, action, scope, description, created_at, created_by) VALUES
('CRM', 'CREATE', 'ALL', 'Create leads and clients', NOW(), 'system'),
('CRM', 'READ',   'ALL', 'View all leads and clients', NOW(), 'system'),
('CRM', 'UPDATE', 'ALL', 'Update leads and clients', NOW(), 'system'),
('CRM', 'DELETE', 'ALL', 'Delete leads and clients', NOW(), 'system'),
('CRM', 'READ',   'ASSIGNED', 'View assigned leads only', NOW(), 'system');

-- Sales/Quotation Permissions
INSERT INTO permissions (module, action, scope, description, created_at, created_by) VALUES
('SALES', 'CREATE', 'ALL', 'Create quotations', NOW(), 'system'),
('SALES', 'READ',   'ALL', 'View all quotations', NOW(), 'system'),
('SALES', 'UPDATE', 'ALL', 'Update quotations', NOW(), 'system'),
('SALES', 'DELETE', 'ALL', 'Delete quotations', NOW(), 'system'),
('SALES', 'APPROVE','ALL', 'Approve quotations', NOW(), 'system'),
('SALES', 'EXPORT', 'ALL', 'Export quotation PDFs', NOW(), 'system'),
('SALES', 'READ',   'OWN', 'View own quotations only', NOW(), 'system');

-- Events Permissions
INSERT INTO permissions (module, action, scope, description, created_at, created_by) VALUES
('EVENTS', 'CREATE', 'ALL', 'Create events', NOW(), 'system'),
('EVENTS', 'READ',   'ALL', 'View all events', NOW(), 'system'),
('EVENTS', 'UPDATE', 'ALL', 'Update events', NOW(), 'system'),
('EVENTS', 'DELETE', 'ALL', 'Delete events', NOW(), 'system'),
('EVENTS', 'READ',   'ASSIGNED', 'View assigned events only', NOW(), 'system'),
('EVENTS', 'UPDATE', 'ASSIGNED', 'Update assigned events only', NOW(), 'system');

-- Teams Permissions
INSERT INTO permissions (module, action, scope, description, created_at, created_by) VALUES
('TEAMS', 'CREATE', 'ALL', 'Create teams', NOW(), 'system'),
('TEAMS', 'READ',   'ALL', 'View all teams', NOW(), 'system'),
('TEAMS', 'UPDATE', 'ALL', 'Update teams', NOW(), 'system'),
('TEAMS', 'DELETE', 'ALL', 'Delete teams', NOW(), 'system'),
('TEAMS', 'READ',   'ASSIGNED', 'View assigned team only', NOW(), 'system'),
('TEAMS', 'UPDATE', 'ASSIGNED', 'Update assigned team only', NOW(), 'system');

-- Vendors Permissions
INSERT INTO permissions (module, action, scope, description, created_at, created_by) VALUES
('VENDORS', 'CREATE', 'ALL', 'Create vendors', NOW(), 'system'),
('VENDORS', 'READ',   'ALL', 'View all vendors', NOW(), 'system'),
('VENDORS', 'UPDATE', 'ALL', 'Update vendors', NOW(), 'system'),
('VENDORS', 'DELETE', 'ALL', 'Delete vendors', NOW(), 'system'),
('VENDORS', 'READ',   'ASSIGNED', 'View assigned vendors only', NOW(), 'system');

-- Tasks Permissions
INSERT INTO permissions (module, action, scope, description, created_at, created_by) VALUES
('TASKS', 'CREATE', 'ALL', 'Create tasks', NOW(), 'system'),
('TASKS', 'READ',   'ALL', 'View all tasks', NOW(), 'system'),
('TASKS', 'UPDATE', 'ALL', 'Update tasks', NOW(), 'system'),
('TASKS', 'DELETE', 'ALL', 'Delete tasks', NOW(), 'system'),
('TASKS', 'READ',   'ASSIGNED', 'View assigned tasks only', NOW(), 'system'),
('TASKS', 'UPDATE', 'ASSIGNED', 'Update assigned tasks only', NOW(), 'system');

-- Hampers Permissions
INSERT INTO permissions (module, action, scope, description, created_at, created_by) VALUES
('HAMPERS', 'CREATE', 'ALL', 'Create hamper products', NOW(), 'system'),
('HAMPERS', 'READ',   'ALL', 'View hamper products and BOM', NOW(), 'system'),
('HAMPERS', 'UPDATE', 'ALL', 'Update hamper products', NOW(), 'system'),
('HAMPERS', 'DELETE', 'ALL', 'Delete hamper products', NOW(), 'system');

-- Inventory Permissions
INSERT INTO permissions (module, action, scope, description, created_at, created_by) VALUES
('INVENTORY', 'CREATE', 'ALL', 'Create inventory records', NOW(), 'system'),
('INVENTORY', 'READ',   'ALL', 'View inventory', NOW(), 'system'),
('INVENTORY', 'UPDATE', 'ALL', 'Update inventory', NOW(), 'system'),
('INVENTORY', 'DELETE', 'ALL', 'Delete inventory records', NOW(), 'system');

-- Finance Permissions
INSERT INTO permissions (module, action, scope, description, created_at, created_by) VALUES
('FINANCE', 'CREATE',  'ALL', 'Create invoices and payments', NOW(), 'system'),
('FINANCE', 'READ',    'ALL', 'View all financial data', NOW(), 'system'),
('FINANCE', 'UPDATE',  'ALL', 'Update financial records', NOW(), 'system'),
('FINANCE', 'DELETE',  'ALL', 'Delete financial records', NOW(), 'system'),
('FINANCE', 'APPROVE', 'ALL', 'Approve expenses', NOW(), 'system'),
('FINANCE', 'EXPORT',  'ALL', 'Export financial reports', NOW(), 'system');

-- Reports Permissions
INSERT INTO permissions (module, action, scope, description, created_at, created_by) VALUES
('REPORTS', 'READ',   'ALL', 'View all reports', NOW(), 'system'),
('REPORTS', 'EXPORT', 'ALL', 'Export reports', NOW(), 'system');

-- =====================================================
-- Assign permissions to ADMIN role (all permissions)
-- =====================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ADMIN';

-- =====================================================
-- Assign permissions to EVENT_MANAGER
-- =====================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'EVENT_MANAGER'
AND (
    (p.module = 'CRM' AND p.scope = 'ALL')
    OR (p.module = 'SALES' AND p.scope = 'ALL')
    OR (p.module = 'EVENTS' AND p.scope = 'ALL')
    OR (p.module = 'TEAMS' AND p.scope = 'ALL')
    OR (p.module = 'VENDORS' AND p.scope = 'ALL')
    OR (p.module = 'TASKS' AND p.scope = 'ALL')
    OR (p.module = 'HAMPERS' AND p.scope = 'ALL')
    OR (p.module = 'INVENTORY' AND p.scope = 'ALL')
    OR (p.module = 'REPORTS')
);

-- =====================================================
-- Assign permissions to FINANCE_MANAGER
-- =====================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'FINANCE_MANAGER'
AND (
    (p.module = 'FINANCE')
    OR (p.module = 'SALES' AND p.action IN ('READ', 'EXPORT') AND p.scope = 'ALL')
    OR (p.module = 'EVENTS' AND p.action = 'READ' AND p.scope = 'ALL')
    OR (p.module = 'VENDORS' AND p.scope = 'ALL')
    OR (p.module = 'HAMPERS' AND p.action = 'READ')
    OR (p.module = 'CRM' AND p.action = 'READ' AND p.scope = 'ALL')
    OR (p.module = 'REPORTS')
);

-- =====================================================
-- Assign permissions to TEAM_MANAGER
-- =====================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'TEAM_MANAGER'
AND (
    (p.module = 'EVENTS' AND p.scope = 'ASSIGNED')
    OR (p.module = 'TEAMS' AND p.scope = 'ASSIGNED')
    OR (p.module = 'VENDORS' AND p.scope = 'ASSIGNED')
    OR (p.module = 'TASKS' AND p.scope = 'ASSIGNED')
);

-- =====================================================
-- Assign permissions to FREELANCER
-- =====================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'FREELANCER'
AND (
    (p.module = 'TASKS' AND p.action IN ('READ', 'UPDATE') AND p.scope = 'ASSIGNED')
    OR (p.module = 'EVENTS' AND p.action = 'READ' AND p.scope = 'ASSIGNED')
    OR (p.module = 'TEAMS' AND p.action = 'READ' AND p.scope = 'ASSIGNED')
);
