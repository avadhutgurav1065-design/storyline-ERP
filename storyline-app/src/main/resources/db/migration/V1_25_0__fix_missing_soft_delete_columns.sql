-- =====================================================
-- V1.25.0: Fix missing soft delete columns
-- =====================================================

-- Add missing soft delete columns to dispatch_logs
ALTER TABLE dispatch_logs 
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE, 
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP, 
    ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100);

-- Add missing soft delete columns to petty_cash_transactions
ALTER TABLE petty_cash_transactions 
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE, 
    ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100);

-- Note: petty_cash_transactions already had deleted_at from V1_19_0
