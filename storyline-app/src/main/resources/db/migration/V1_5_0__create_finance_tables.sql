-- =====================================================
-- V1.5.0: Finance Module — Invoices, Payments, Expenses
-- =====================================================

CREATE TABLE invoices (
    id                   BIGSERIAL PRIMARY KEY,
    invoice_number       VARCHAR(50)  NOT NULL UNIQUE,
    client_id            BIGINT       NOT NULL REFERENCES clients(id),
    event_id             BIGINT       REFERENCES events(id),
    quotation_id         BIGINT       REFERENCES quotations(id),
    issue_date           DATE         NOT NULL,
    due_date             DATE,
    status               VARCHAR(30)  NOT NULL DEFAULT 'DRAFT',
    total_amount         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_amount           DECIMAL(12,2) DEFAULT 0.00,
    grand_total          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    amount_paid          DECIMAL(12,2) DEFAULT 0.00,
    notes                TEXT,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE TABLE payments (
    id                   BIGSERIAL PRIMARY KEY,
    payment_reference    VARCHAR(100) UNIQUE,
    invoice_id           BIGINT       REFERENCES invoices(id),
    client_id            BIGINT       NOT NULL REFERENCES clients(id),
    amount               DECIMAL(12,2) NOT NULL,
    payment_date         DATE         NOT NULL,
    payment_method       VARCHAR(50),
    transaction_id       VARCHAR(100),
    notes                TEXT,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE TABLE expenses (
    id                   BIGSERIAL PRIMARY KEY,
    category             VARCHAR(50)  NOT NULL,
    description          VARCHAR(255) NOT NULL,
    amount               DECIMAL(12,2) NOT NULL,
    expense_date         DATE         NOT NULL,
    event_id             BIGINT       REFERENCES events(id),
    vendor_id            BIGINT       REFERENCES vendors(id),
    payment_method       VARCHAR(50),
    status               VARCHAR(30)  NOT NULL DEFAULT 'PAID',
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_event ON invoices(event_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_expenses_event ON expenses(event_id);
