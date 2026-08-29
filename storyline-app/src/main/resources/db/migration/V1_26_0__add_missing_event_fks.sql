-- =====================================================
-- V1.26.0: Add Missing Foreign Keys to Events Table
-- =====================================================

ALTER TABLE events
    ADD CONSTRAINT fk_events_client FOREIGN KEY (client_id) REFERENCES clients(id),
    ADD CONSTRAINT fk_events_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id);
