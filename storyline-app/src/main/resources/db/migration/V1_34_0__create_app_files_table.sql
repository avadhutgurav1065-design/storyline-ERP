CREATE TABLE app_files (
    id VARCHAR(255) PRIMARY KEY,
    original_filename VARCHAR(255),
    content_type VARCHAR(100),
    data BYTEA,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
