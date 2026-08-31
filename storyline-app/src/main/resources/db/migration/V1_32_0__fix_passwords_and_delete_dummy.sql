-- V1.32.0: Fix Passwords and Delete Dummy Users
-- Delete dummy users with no roles (or specific deprecated ones)
DELETE FROM users WHERE username IN ('event_head', 'team_head', 'team_member', 'inventory_manager', 'vendor_user');

-- Update passwords for all remaining users to Admin@123 (Hash 2)
UPDATE users SET password_hash = '$2a$10$3Z7l6rwxUGrRWVIBOwNCluCVi4JsVOLQAyaaWdJpfTATvpeH1bxKi';
