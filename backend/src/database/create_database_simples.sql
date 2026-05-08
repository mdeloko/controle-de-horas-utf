-- ============================================================
-- Sistema de Controle de Horas — Meninas Digitais UTFPR
-- Versão simplificada — primeira entrega
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- Tabela: usuario
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        VARCHAR(150) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    senha_hash  VARCHAR(255) NOT NULL,
    perfil      TEXT NOT NULL DEFAULT 'participante'
                    CHECK (perfil IN ('diretor', 'participante')),
    ativo       INTEGER NOT NULL DEFAULT 1,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Tabela: tipo_atividade
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tipo_atividade (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        VARCHAR(100) NOT NULL UNIQUE,
    ativo       INTEGER NOT NULL DEFAULT 1,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Tabela: registro_horas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registro_horas (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id          INTEGER NOT NULL,
    tipo_atividade_id   INTEGER NOT NULL,
    data_atividade      DATE NOT NULL,
    horas               DECIMAL(5, 2) NOT NULL
                            CHECK (horas >= 0.5 AND horas <= 24),
    descricao           TEXT NULL,
    status              TEXT NOT NULL DEFAULT 'pendente'
                            CHECK (status IN ('pendente', 'aprovado')),
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)        REFERENCES usuario (id)        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (tipo_atividade_id) REFERENCES tipo_atividade (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- Dados iniciais: tipos de atividade
-- ------------------------------------------------------------
INSERT OR IGNORE INTO tipo_atividade (nome) VALUES
    ('Reunião'),
    ('Permanência'),
    ('Evento'),
    ('Oficina'),
    ('Mentoria');
