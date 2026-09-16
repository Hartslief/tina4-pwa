-- Migration: create_users
-- Created: 2026-09-16 16:15:29

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) DEFAULT '',
    password VARCHAR(255) DEFAULT '',
    role VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- tina4:edit  add columns beyond id + created_at
);
