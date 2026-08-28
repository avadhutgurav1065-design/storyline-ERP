-- Add unit_cost to raw_materials
ALTER TABLE raw_materials ADD COLUMN unit_cost NUMERIC(19, 2) DEFAULT 0 NOT NULL;
