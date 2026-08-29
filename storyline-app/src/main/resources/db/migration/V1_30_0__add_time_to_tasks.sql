-- =====================================================
-- V1.30.0: Add time to tasks for event itineraries
-- =====================================================

ALTER TABLE tasks ADD COLUMN due_time TIME;
