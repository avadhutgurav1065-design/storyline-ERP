-- =====================================================
-- V1.4.0: Inventory Module — Products, Raw Materials, BOM
-- =====================================================

CREATE TABLE products (
    id                   BIGSERIAL PRIMARY KEY,
    sku                  VARCHAR(50)  NOT NULL UNIQUE,
    name                 VARCHAR(150) NOT NULL,
    description          TEXT,
    base_price           DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE TABLE raw_materials (
    id                   BIGSERIAL PRIMARY KEY,
    sku                  VARCHAR(50)  NOT NULL UNIQUE,
    name                 VARCHAR(150) NOT NULL,
    unit_of_measure      VARCHAR(20)  NOT NULL,
    current_stock        DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    minimum_stock        DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE TABLE bill_of_materials (
    id                   BIGSERIAL PRIMARY KEY,
    product_id           BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    raw_material_id      BIGINT       NOT NULL REFERENCES raw_materials(id) ON DELETE RESTRICT,
    quantity             DECIMAL(10,3) NOT NULL,
    UNIQUE(product_id, raw_material_id)
);

CREATE TABLE stock_transactions (
    id                   BIGSERIAL PRIMARY KEY,
    raw_material_id      BIGINT       NOT NULL REFERENCES raw_materials(id) ON DELETE CASCADE,
    transaction_type     VARCHAR(20)  NOT NULL, -- IN, OUT, ADJUSTMENT
    quantity             DECIMAL(10,3) NOT NULL,
    reference            VARCHAR(100),
    notes                TEXT,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE INDEX idx_stock_tx_material ON stock_transactions(raw_material_id);
