-- =====================================================
-- V1.15.0: Add Freelancer Role
-- =====================================================

INSERT INTO roles (name, description, is_system_role, created_at, created_by) 
VALUES ('FREELANCER', 'External freelancer hired for specific events', TRUE, NOW(), 'system')
ON CONFLICT (name) DO NOTHING;
