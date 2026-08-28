-- =====================================================
-- V1.18.0: Finance 2.0 Sub-Phase A - Billing Upgrades
-- =====================================================

-- Clear existing dummy finance data to prevent conflicts
DELETE FROM payments;
DELETE FROM expenses;
DELETE FROM invoices;

-- Add title/schedule descriptor to Invoices (e.g., "Booking Advance", "Final Payment")
ALTER TABLE invoices ADD COLUMN title VARCHAR(100);

-- Make sure payments can link directly to an event and track who received it
ALTER TABLE payments ADD COLUMN event_id BIGINT REFERENCES events(id);
ALTER TABLE payments ADD COLUMN received_by VARCHAR(100);

-- Drop unique constraint on payment_reference if it exists so we can reuse generic names like 'CASH'
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_reference_key;

-- We don't need a separate InvoiceSchedule table if a schedule just means creating multiple Invoices with different titles and due dates.
