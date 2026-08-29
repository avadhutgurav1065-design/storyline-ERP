-- =====================================================
-- V1.22.0: Seed Dummy Data for CRM, Sales, Events, etc.
-- =====================================================

-- Seed Leads
INSERT INTO leads (id, name, email, phone, company, event_type, event_date, budget, status) VALUES
(1, 'Acme Corp Events', 'events@acme.com', '123-456-7890', 'Acme Corp', 'CORPORATE', '2026-10-15', 50000.00, 'NEW'),
(2, 'TechStars Conference', 'hello@techstars.com', '987-654-3210', 'TechStars', 'CONFERENCE', '2026-11-20', 120000.00, 'QUALIFIED')
ON CONFLICT DO NOTHING;

-- Seed Clients
INSERT INTO clients (id, name, email, phone, company, event_type, address) VALUES
(1, 'Global Innovations', 'admin@globalinv.com', '555-123-4567', 'Global Innovations Ltd', 'CORPORATE', '123 Business Rd, Tech City'),
(2, 'Sarah Jenkins Wedding', 'sarah.j@email.com', '555-987-6543', '', 'WEDDING', '456 Rose Blvd, Love Town')
ON CONFLICT DO NOTHING;

-- Seed Quotations
INSERT INTO quotations (id, quote_number, client_id, event_name, event_date, pax, venue, status, total_amount, tax_amount, grand_total) VALUES
(1, 'QT-2026-001', 1, 'Annual Global Summit', '2026-12-05', 500, 'Grand Plaza Hotel', 'APPROVED', 75000.00, 7500.00, 82500.00),
(2, 'QT-2026-002', 2, 'Sarah & John Wedding', '2026-09-15', 150, 'Sunset Gardens', 'SENT', 25000.00, 2500.00, 27500.00)
ON CONFLICT DO NOTHING;

-- Seed Events
INSERT INTO events (id, name, start_date, end_date, venue, pax, status, progress, budget) VALUES
(1, 'Annual Global Summit 2026', '2026-12-05', '2026-12-06', 'Grand Plaza Hotel', 500, 'PLANNING', 15, 75000.00),
(2, 'Tech Innovators Gala', '2026-10-22', '2026-10-22', 'Downtown Convention Center', 300, 'CONFIRMED', 45, 45000.00)
ON CONFLICT DO NOTHING;

-- Seed Products
INSERT INTO products (id, sku, name, description, base_price, is_active) VALUES
(1, 'HAMP-CORP-01', 'Premium Corporate Hamper', 'Luxury chocolates, wine, and branded merch', 150.00, true),
(2, 'HAMP-WED-01', 'Wedding Welcome Hamper', 'Snacks, water, and local treats', 50.00, true)
ON CONFLICT DO NOTHING;

-- Seed Invoices
INSERT INTO invoices (id, invoice_number, client_id, quotation_id, issue_date, due_date, status, total_amount, tax_amount, grand_total, amount_paid) VALUES
(1, 'INV-2026-001', 1, 1, '2026-08-01', '2026-08-15', 'PAID', 75000.00, 7500.00, 82500.00, 82500.00),
(2, 'INV-2026-002', 2, 2, '2026-08-25', '2026-09-08', 'SENT', 25000.00, 2500.00, 27500.00, 0.00)
ON CONFLICT DO NOTHING;

-- Reset Sequences (Postgres specific)
SELECT setval('leads_id_seq', (SELECT MAX(id) FROM leads));
SELECT setval('clients_id_seq', (SELECT MAX(id) FROM clients));
SELECT setval('quotations_id_seq', (SELECT MAX(id) FROM quotations));
SELECT setval('events_id_seq', (SELECT MAX(id) FROM events));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('invoices_id_seq', (SELECT MAX(id) FROM invoices));
