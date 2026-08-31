-- V1.33.0: Seed Dummy Users for missing roles (TEAM_MANAGER, FREELANCER)

INSERT INTO users (username, email, password_hash, full_name, phone, is_active, created_at, created_by) VALUES 
('team_manager', 'team_manager@storyline.com', '$2a$10$3Z7l6rwxUGrRWVIBOwNCluCVi4JsVOLQAyaaWdJpfTATvpeH1bxKi', 'Team Manager', '8888888888', TRUE, NOW(), 'system'),
('freelancer', 'freelancer@storyline.com', '$2a$10$3Z7l6rwxUGrRWVIBOwNCluCVi4JsVOLQAyaaWdJpfTATvpeH1bxKi', 'Freelancer User', '9999999999', TRUE, NOW(), 'system')
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'team_manager' AND r.name = 'TEAM_MANAGER'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'freelancer' AND r.name = 'FREELANCER'
ON CONFLICT DO NOTHING;
