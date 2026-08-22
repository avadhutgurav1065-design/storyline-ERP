-- =====================================================
-- V1.3.0: Events Module — Events, Vendors, Teams, Tasks
-- =====================================================

CREATE TABLE events (
    id                   BIGSERIAL PRIMARY KEY,
    name                 VARCHAR(200) NOT NULL,
    start_date           DATE,
    end_date             DATE,
    venue                VARCHAR(200),
    pax                  INT,
    quotation_id         BIGINT,
    client_id            BIGINT,
    status               VARCHAR(50)  NOT NULL DEFAULT 'PLANNING',
    progress             INT          NOT NULL DEFAULT 0,
    notes                TEXT,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE TABLE vendors (
    id                   BIGSERIAL PRIMARY KEY,
    name                 VARCHAR(150) NOT NULL,
    service_type         VARCHAR(100),
    phone                VARCHAR(20)  NOT NULL,
    email                VARCHAR(100),
    gst_number           VARCHAR(50),
    address              TEXT,
    is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE TABLE vendor_assignments (
    id                   BIGSERIAL PRIMARY KEY,
    event_id             BIGINT       NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    vendor_id            BIGINT       NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    task                 VARCHAR(255) NOT NULL,
    agreed_amount        DECIMAL(12,2) DEFAULT 0.00,
    status               VARCHAR(50)  NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE team_assignments (
    id                   BIGSERIAL PRIMARY KEY,
    event_id             BIGINT       NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id              BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role                 VARCHAR(50)  NOT NULL
);

CREATE TABLE tasks (
    id                   BIGSERIAL PRIMARY KEY,
    event_id             BIGINT       NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title                VARCHAR(255) NOT NULL,
    description          TEXT,
    assigned_user_id     BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    due_date             DATE,
    priority             VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    status               VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_tasks_event ON tasks(event_id);
CREATE INDEX idx_team_assignments_event ON team_assignments(event_id);
