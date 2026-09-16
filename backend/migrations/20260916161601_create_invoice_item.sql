-- Migration: create_invoice_item
-- Created: 2026-09-16 16:16:01

CREATE TABLE IF NOT EXISTS invoice_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER DEFAULT 0,
    product_id INTEGER DEFAULT 0,
    product_name VARCHAR(255) DEFAULT '',
    price REAL DEFAULT 0,
    quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoice(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);