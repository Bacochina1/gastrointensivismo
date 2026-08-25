-- Schema SQL para o banco de dados Cloudflare D1 (Gastrointensivismo)

CREATE TABLE IF NOT EXISTS Users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    has_access INTEGER DEFAULT 1,
    must_change_password INTEGER DEFAULT 1,
    stripe_id TEXT,
    last_lesson_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_id ON Users(stripe_id);

CREATE TABLE IF NOT EXISTS Progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    playback_time REAL DEFAULT 0,
    notes TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE(user_id, lesson_id)
);

-- Usuários de teste para desenvolvimento (Senha padrão: 123456)
-- Hash SHA-256 da senha '123456': 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92

INSERT OR IGNORE INTO Users (id, name, email, password_hash, has_access)
VALUES ('dev-user-01', 'Aluno Elite Dev', 'aluno@gastro.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 1);

INSERT OR IGNORE INTO Users (id, name, email, password_hash, has_access)
VALUES ('dev-user-02', 'Dr. Aluno Medcof', 'aluno@medcof.com.br', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 1);
