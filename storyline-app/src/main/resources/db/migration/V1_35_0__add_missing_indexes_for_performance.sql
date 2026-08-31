-- =====================================================
-- V1.35.0: Database Optimizations - Adding Missing Indexes
-- =====================================================
-- Purpose: 
-- In an ERP with cross-module reporting (e.g. Finance Dashboard aggregating Events),
-- foreign keys without indexes cause slow sequential scans and table locks on deletes.
-- These indexes optimize the query performance across critical joins.

-- 1. Identity & Permissions
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);

-- 2. CRM & Sales
CREATE INDEX IF NOT EXISTS idx_leads_existing_client ON leads(existing_client_id);
-- (quotation indexes were mostly added in V1.2.0)

-- 3. Events & Operations
CREATE INDEX IF NOT EXISTS idx_events_client ON events(client_id);
CREATE INDEX IF NOT EXISTS idx_events_quotation ON events(quotation_id);
CREATE INDEX IF NOT EXISTS idx_vendor_assignments_event ON vendor_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_vendor_assignments_vendor ON vendor_assignments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_team_assignments_user ON team_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user ON tasks(assigned_user_id);

-- 4. Inventory
CREATE INDEX IF NOT EXISTS idx_bom_raw_material ON bill_of_materials(raw_material_id);

-- 5. Finance
CREATE INDEX IF NOT EXISTS idx_invoices_quotation ON invoices(quotation_id);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON expenses(vendor_id);
