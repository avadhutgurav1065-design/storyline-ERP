-- =====================================================
-- V1.21.0: Add Dispatch Logs for Event tracking
-- =====================================================

CREATE TABLE dispatch_logs (
    id                   BIGSERIAL PRIMARY KEY,
    event_id             BIGINT       NOT NULL,
    product_id           BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity             DECIMAL(10,3) NOT NULL,
    notes                TEXT,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE INDEX idx_dispatch_logs_event ON dispatch_logs(event_id);
