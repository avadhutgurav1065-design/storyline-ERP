-- =====================================================
-- V1.8.0: Add Product Inventory fields
-- =====================================================

ALTER TABLE products ADD COLUMN current_stock DECIMAL(10,3) NOT NULL DEFAULT 0.000;

ALTER TABLE stock_transactions ADD COLUMN product_id BIGINT REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE stock_transactions ALTER COLUMN raw_material_id DROP NOT NULL;

-- A transaction must reference EITHER a raw material OR a product
ALTER TABLE stock_transactions ADD CONSTRAINT chk_stock_tx_target 
CHECK ((raw_material_id IS NOT NULL AND product_id IS NULL) OR (raw_material_id IS NULL AND product_id IS NOT NULL));
