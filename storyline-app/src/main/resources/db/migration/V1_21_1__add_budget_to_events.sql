-- V1.21.1: Add budget to events table
ALTER TABLE events ADD COLUMN budget DECIMAL(12, 2);
