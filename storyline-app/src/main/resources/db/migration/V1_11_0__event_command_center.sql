-- =====================================================
-- V1.11.0: Event Command Center Upgrades
-- =====================================================

-- Add department and hierarchy to team_assignments
ALTER TABLE team_assignments 
ADD COLUMN department VARCHAR(100),
ADD COLUMN is_head BOOLEAN DEFAULT FALSE;

-- Create event_documents table for Document Hub
CREATE TABLE event_documents (
    id                   BIGSERIAL PRIMARY KEY,
    event_id             BIGINT       NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name                 VARCHAR(255) NOT NULL,
    file_url             TEXT         NOT NULL,
    document_type        VARCHAR(50), -- e.g., 'GUEST_LIST', 'DECOR', 'OTHER'
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE INDEX idx_event_documents_event ON event_documents(event_id);
