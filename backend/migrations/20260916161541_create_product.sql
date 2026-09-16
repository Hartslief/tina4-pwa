-- Migration: create_product
-- Created: 2026-09-16 16:15:41

CREATE TABLE IF NOT EXISTS product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) DEFAULT '',
    description TEXT DEFAULT '',
    price REAL DEFAULT 0,
    in_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- tina4:edit  add columns beyond id + created_at
);
