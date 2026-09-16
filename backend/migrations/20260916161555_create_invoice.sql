-- Migration: create_invoice
-- Created: 2026-09-16 16:15:55

CREATE TABLE IF NOT EXISTS invoice (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 0,
    cart_id INTEGER DEFAULT 0,
    total REAL DEFAULT 0,
    status VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (cart_id) REFERENCES cart(id)
);
