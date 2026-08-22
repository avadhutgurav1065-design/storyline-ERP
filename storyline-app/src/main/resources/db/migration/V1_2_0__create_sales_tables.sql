-- =====================================================
-- V1.2.0: Sales Module — Quotations
-- =====================================================

CREATE TABLE quotations (
    id                   BIGSERIAL PRIMARY KEY,
    quote_number         VARCHAR(50)  NOT NULL UNIQUE,
    client_id            BIGINT       NOT NULL REFERENCES clients(id),
    event_name           VARCHAR(200) NOT NULL,
    event_date           DATE,
    pax                  INT,
    venue                VARCHAR(200),
    version              INT          NOT NULL DEFAULT 1,
    parent_quotation_id  BIGINT       REFERENCES quotations(id),
    status               VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    total_amount         DECIMAL(12,2) DEFAULT 0.00,
    tax_amount           DECIMAL(12,2) DEFAULT 0.00,
    discount_amount      DECIMAL(12,2) DEFAULT 0.00,
    grand_total          DECIMAL(12,2) DEFAULT 0.00,
    notes                TEXT,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE TABLE quotation_items (
    id            BIGSERIAL PRIMARY KEY,
    quotation_id  BIGINT       NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    group_name    VARCHAR(100),
    description   VARCHAR(500) NOT NULL,
    quantity      DECIMAL(10,2) NOT NULL,
    unit_price    DECIMAL(12,2) NOT NULL,
    tax_percent   DECIMAL(5,2)  DEFAULT 0.00,
    total         DECIMAL(12,2) NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100)
);

CREATE INDEX idx_quotations_client ON quotations(client_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_parent ON quotations(parent_quotation_id);
