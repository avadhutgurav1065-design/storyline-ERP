-- =====================================================
-- V1.16.0: Upgrade Expenses for Vendor Billing & POs
-- =====================================================

ALTER TABLE expenses
ADD COLUMN po_number VARCHAR(50) UNIQUE,
ADD COLUMN tax_amount DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN amount_paid DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN approval_notes TEXT;
