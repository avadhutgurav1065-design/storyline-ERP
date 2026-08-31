-- V1.7.2: Migrate Roles to 5 Core Roles

-- 1. Create missing roles
INSERT INTO roles (name, description, is_system_role, created_at, created_by)
VALUES 
('TEAM_MANAGER', 'In-house team managing specific events on ground', TRUE, NOW(), 'system'),
('FREELANCER', 'Hired member for specific events and tasks', TRUE, NOW(), 'system')
ON CONFLICT (name) DO NOTHING;

-- 2. Migrate existing users from old roles to new/existing roles
-- EVENT_HEAD -> EVENT_MANAGER
UPDATE user_roles ur
SET role_id = (SELECT id FROM roles WHERE name = 'EVENT_MANAGER')
WHERE role_id = (SELECT id FROM roles WHERE name = 'EVENT_HEAD');

-- TEAM_HEAD -> TEAM_MANAGER
UPDATE user_roles ur
SET role_id = (SELECT id FROM roles WHERE name = 'TEAM_MANAGER')
WHERE role_id = (SELECT id FROM roles WHERE name = 'TEAM_HEAD');

-- TEAM_MEMBER -> TEAM_MANAGER
UPDATE user_roles ur
SET role_id = (SELECT id FROM roles WHERE name = 'TEAM_MANAGER')
WHERE role_id = (SELECT id FROM roles WHERE name = 'TEAM_MEMBER');

-- INVENTORY_MANAGER -> EVENT_MANAGER
UPDATE user_roles ur
SET role_id = (SELECT id FROM roles WHERE name = 'EVENT_MANAGER')
WHERE role_id = (SELECT id FROM roles WHERE name = 'INVENTORY_MANAGER');

-- VENDOR -> FREELANCER
UPDATE user_roles ur
SET role_id = (SELECT id FROM roles WHERE name = 'FREELANCER')
WHERE role_id = (SELECT id FROM roles WHERE name = 'VENDOR');

-- Remove duplicate user_roles that might have resulted from the migration
-- (e.g. if a user had both EVENT_HEAD and EVENT_MANAGER, they now have two EVENT_MANAGER records)
-- Wait, the primary key of user_roles is just user_id and role_id usually, but let's assume it has an ID or just delete duplicates.
-- Wait, user_roles might not have a primary key named 'id'.
-- Let's just create a temporary table, drop duplicates, and reinsert.
-- Or better, since it's just user_id and role_id, use CTID.
DELETE FROM user_roles
WHERE ctid NOT IN (
    SELECT min(ctid)
    FROM user_roles
    GROUP BY user_id, role_id
);

-- 3. Delete old role permissions
DELETE FROM role_permissions
WHERE role_id IN (
    SELECT id FROM roles WHERE name IN ('EVENT_HEAD', 'TEAM_HEAD', 'TEAM_MEMBER', 'INVENTORY_MANAGER', 'VENDOR')
);

-- 4. Delete old roles
DELETE FROM roles WHERE name IN ('EVENT_HEAD', 'TEAM_HEAD', 'TEAM_MEMBER', 'INVENTORY_MANAGER', 'VENDOR');

-- 5. Clear all current role permissions for the remaining 5 roles to apply fresh
DELETE FROM role_permissions;

-- 6. Re-apply permissions to the 5 core roles
-- ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ADMIN';

-- EVENT_MANAGER
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

-- FINANCE_MANAGER
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

-- TEAM_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'TEAM_MANAGER'
AND (
    (p.module = 'EVENTS' AND p.scope = 'ASSIGNED')
    OR (p.module = 'TEAMS' AND p.scope = 'ASSIGNED')
    OR (p.module = 'VENDORS' AND p.scope = 'ASSIGNED')
    OR (p.module = 'TASKS' AND p.scope = 'ASSIGNED')
);

-- FREELANCER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'FREELANCER'
AND (
    (p.module = 'TASKS' AND p.action IN ('READ', 'UPDATE') AND p.scope = 'ASSIGNED')
    OR (p.module = 'EVENTS' AND p.action = 'READ' AND p.scope = 'ASSIGNED')
    OR (p.module = 'TEAMS' AND p.action = 'READ' AND p.scope = 'ASSIGNED')
);
