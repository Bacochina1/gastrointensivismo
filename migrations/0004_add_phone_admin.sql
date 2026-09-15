-- Migration 0004: add phone, is_admin, created_at fields to Users
ALTER TABLE Users ADD COLUMN phone TEXT;
ALTER TABLE Users ADD COLUMN is_admin INTEGER DEFAULT 0;
ALTER TABLE Users ADD COLUMN created_at TEXT DEFAULT (datetime('now'));
CREATE TABLE IF NOT EXISTS AdminSessions (token TEXT PRIMARY KEY, expires_at INTEGER);
