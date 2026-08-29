-- =====================================================
-- V1.28.0: Add ground level fields to leads
-- =====================================================

ALTER TABLE leads
ADD COLUMN requirements TEXT,
ADD COLUMN event_location VARCHAR(255),
ADD COLUMN lost_reason VARCHAR(255);
