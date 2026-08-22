-- =====================================================
-- V1.1.0: CRM Module — Leads, Clients, FollowUps
-- =====================================================

CREATE TABLE leads (
    id                    BIGSERIAL PRIMARY KEY,
    name                  VARCHAR(100) NOT NULL,
    email                 VARCHAR(100),
    phone                 VARCHAR(20)  NOT NULL,
    company               VARCHAR(100),
    event_type            VARCHAR(50),
    event_date            DATE,
    budget                DECIMAL(12,2),
    status                VARCHAR(20)  NOT NULL DEFAULT 'NEW',
    source                VARCHAR(50),
    assigned_to_user_id   BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP,
    created_by            VARCHAR(100),
    updated_by            VARCHAR(100)
);

CREATE TABLE clients (
    id                    BIGSERIAL PRIMARY KEY,
    name                  VARCHAR(100) NOT NULL,
    email                 VARCHAR(100),
    phone                 VARCHAR(20)  NOT NULL,
    company               VARCHAR(100),
    address               TEXT,
    gst_number            VARCHAR(50),
    converted_from_lead_id BIGINT      REFERENCES leads(id) ON DELETE SET NULL,
    created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP,
    created_by            VARCHAR(100),
    updated_by            VARCHAR(100)
);

CREATE TABLE follow_ups (
    id                   BIGSERIAL PRIMARY KEY,
    lead_id              BIGINT       REFERENCES leads(id) ON DELETE CASCADE,
    client_id            BIGINT       REFERENCES clients(id) ON DELETE CASCADE,
    interaction_type     VARCHAR(20)  NOT NULL,
    notes                TEXT,
    interaction_date     TIMESTAMP    NOT NULL DEFAULT NOW(),
    next_follow_up_date  TIMESTAMP,
    performed_by_user_id BIGINT       NOT NULL REFERENCES users(id),
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100),
    CONSTRAINT chk_follow_up_target CHECK (
        (lead_id IS NOT NULL AND client_id IS NULL) OR 
        (lead_id IS NULL AND client_id IS NOT NULL)
    )
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned ON leads(assigned_to_user_id);
CREATE INDEX idx_follow_ups_next_date ON follow_ups(next_follow_up_date);
