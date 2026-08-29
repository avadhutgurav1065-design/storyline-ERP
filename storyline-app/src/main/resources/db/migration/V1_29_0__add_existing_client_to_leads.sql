-- =====================================================
-- V1.29.0: Add existing client ID to leads to support Repeat Business
-- =====================================================

ALTER TABLE leads
ADD COLUMN existing_client_id BIGINT;

ALTER TABLE leads
ADD CONSTRAINT fk_leads_existing_client
FOREIGN KEY (existing_client_id)
REFERENCES clients(id)
ON DELETE SET NULL;
