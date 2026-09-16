-- Migration: create_cart_item
-- Created: 2026-09-16 16:15:51

CREATE TABLE IF NOT EXISTS cart_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id INTEGER DEFAULT 0,
    product_id INTEGER DEFAULT 0,
    quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES cart(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);
