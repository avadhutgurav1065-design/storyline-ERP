-- =====================================================
-- V1.27.0: Add assigned_to_user_id to Clients
-- =====================================================

ALTER TABLE clients
ADD COLUMN assigned_to_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_clients_assigned ON clients(assigned_to_user_id);
