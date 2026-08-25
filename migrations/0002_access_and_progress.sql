ALTER TABLE Users ADD COLUMN must_change_password INTEGER DEFAULT 1;
ALTER TABLE Users ADD COLUMN stripe_id TEXT;
ALTER TABLE Users ADD COLUMN last_lesson_id TEXT;

ALTER TABLE Progress ADD COLUMN playback_time REAL DEFAULT 0;
ALTER TABLE Progress ADD COLUMN notes TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_id ON Users(stripe_id);
