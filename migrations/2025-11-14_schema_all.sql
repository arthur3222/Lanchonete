BEGIN;

-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Trigger genérica para updated_at
CREATE OR REPLACE FUNCTION trg_set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Tabela: escolas
-- =========================
CREATE TABLE IF NOT EXISTS escolas (
  id          BIGSERIAL PRIMARY KEY,
  nome        VARCHAR(150) NOT NULL,
  email       VARCHAR(150),
  telefone    VARCHAR(30),
  logradouro  VARCHAR(200),
  numero      VARCHAR(40),
  complemento VARCHAR(120),
  bairro      VARCHAR(120),
  cidade      VARCHAR(120),
  estado      CHAR(2),
  cep         VARCHAR(12),
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ
);

-- REPLACE: cria trigger para escolas de forma compatível
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_escolas_set_updated_at') THEN
    CREATE TRIGGER trg_escolas_set_updated_at
      BEFORE UPDATE ON escolas
      FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
  END IF;
END$$;

-- =========================
-- Tabela: lanchonetes
-- =========================
CREATE TABLE IF NOT EXISTS lanchonetes (
  id          BIGSERIAL PRIMARY KEY,
  escola_id   BIGINT REFERENCES escolas(id) ON DELETE RESTRICT,
  nome        VARCHAR(150) NOT NULL,
  cnpj        VARCHAR(20),
  email       VARCHAR(150),
  telefone    VARCHAR(30),
  logradouro  VARCHAR(200),
  numero      VARCHAR(40),
  complemento VARCHAR(120),
  bairro      VARCHAR(120),
  cidade      VARCHAR(120),
  estado      CHAR(2),
  cep         VARCHAR(12),
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ,
  CONSTRAINT uq_lanchonete_escola_nome UNIQUE (escola_id, nome)
);

-- REPLACE: cria trigger para lanchonetes de forma compatível
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lanchonetes_set_updated_at') THEN
    CREATE TRIGGER trg_lanchonetes_set_updated_at
      BEFORE UPDATE ON lanchonetes
      FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS ix_lanchonetes_escola_id ON lanchonetes (escola_id);

-- =========================
-- Tabela: perfis
-- =========================
CREATE TABLE IF NOT EXISTS perfis (
  id           BIGSERIAL PRIMARY KEY,
  nome         VARCHAR(60) NOT NULL UNIQUE,
  descricao    VARCHAR(255),
  permissoes   JSONB,
  ativo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ
);

-- REPLACE: cria trigger para perfis de forma compatível
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_perfis_set_updated_at') THEN
    CREATE TRIGGER trg_perfis_set_updated_at
      BEFORE UPDATE ON perfis
      FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
  END IF;
END$$;

-- Seeds básicos de perfis (idempotente)
INSERT INTO perfis (nome, descricao) VALUES
  ('ALUNO', 'Perfil de aluno'),
  ('PROFESSOR', 'Perfil de professor'),
  ('FUNCIONARIO', 'Perfil de funcionário'),
  ('ADMIN_ESCOLA', 'Administrador da escola'),
  ('ADMIN_LANCHONETE', 'Administrador da lanchonete'),
  ('ADMIN_GLOBAL', 'Administrador global')
ON CONFLICT (nome) DO NOTHING;

-- =========================
-- Tabela: usuarios
-- Obs: Mantém coluna senha para compatibilidade com Perfil.jsx.
-- Para produção ideal usar auth.users + senha_hash.
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
  id             BIGSERIAL PRIMARY KEY,
  auth_user_id   UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  escola_id      BIGINT REFERENCES escolas(id) ON DELETE SET NULL,
  perfil_id      BIGINT REFERENCES perfis(id) ON DELETE RESTRICT,
  nome           VARCHAR(150) NOT NULL,
  email          VARCHAR(180) NOT NULL UNIQUE,
  senha          TEXT, -- em produção usar hash e autenticação via auth.users
  image_url      TEXT,
  telefone       VARCHAR(30),
  tipo           VARCHAR(30) DEFAULT 'aluno',
  matricula      VARCHAR(80),
  ativo          BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_login   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_usuarios_escola_id ON usuarios (escola_id);
CREATE INDEX IF NOT EXISTS ix_usuarios_perfil_id ON usuarios (perfil_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_escola_matricula
  ON usuarios (escola_id, matricula)
  WHERE matricula IS NOT NULL;

-- REPLACE: cria trigger para usuarios de forma compatível
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_usuarios_set_updated_at') THEN
    CREATE TRIGGER trg_usuarios_set_updated_at
      BEFORE UPDATE ON usuarios
      FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
  END IF;
END$$;

-- Define perfil padrão ALUNO para usuários existentes sem perfil
UPDATE usuarios
SET perfil_id = (SELECT id FROM perfis WHERE nome = 'ALUNO' LIMIT 1)
WHERE perfil_id IS NULL;

-- =========================
-- Tabela: administradores (escopo escola ou lanchonete)
-- =========================
CREATE TABLE IF NOT EXISTS administradores (
  id             BIGSERIAL PRIMARY KEY,
  usuario_id     BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  escola_id      BIGINT REFERENCES escolas(id) ON DELETE CASCADE,
  lanchonete_id  BIGINT REFERENCES lanchonetes(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_admin_escopo CHECK (
    (escola_id IS NOT NULL AND lanchonete_id IS NULL) OR
    (lanchonete_id IS NOT NULL AND escola_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS ix_admin_escola_id ON administradores (escola_id);
CREATE INDEX IF NOT EXISTS ix_admin_lanchonete_id ON administradores (lanchonete_id);

-- =========================
-- Tabela: administradores_master (admMaster) - administradores globais
-- =========================
CREATE TABLE IF NOT EXISTS administradores_master (
  id           BIGSERIAL PRIMARY KEY,
  usuario_id   BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_por   BIGINT REFERENCES usuarios(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- seed opcional: criar administrador global se existir usuário com email 'admin@local'
-- (ajuste/remova conforme necessário)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@local') THEN
    INSERT INTO administradores_master (usuario_id)
    SELECT id FROM usuarios WHERE email = 'admin@local' LIMIT 1
    ON CONFLICT (usuario_id) DO NOTHING;
  END IF;
END$$;

-- =========================
-- Tabela: produtos
-- =========================
CREATE TABLE IF NOT EXISTS produtos (
  id             BIGSERIAL PRIMARY KEY,
  lanchonete_id  BIGINT NOT NULL REFERENCES lanchonetes(id) ON DELETE CASCADE,
  nome           VARCHAR(150) NOT NULL,
  descricao      TEXT,
  categoria      VARCHAR(80),
  preco          NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  estoque        INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  ativo          BOOLEAN NOT NULL DEFAULT TRUE,
  imagem_url     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ,
  CONSTRAINT uq_produto_nome_por_lanchonete UNIQUE (lanchonete_id, nome)
);

-- REPLACE: cria trigger para produtos de forma compatível
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_produtos_set_updated_at') THEN
    CREATE TRIGGER trg_produtos_set_updated_at
      BEFORE UPDATE ON produtos
      FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS ix_produtos_lanchonete_id ON produtos (lanchonete_id);
CREATE INDEX IF NOT EXISTS ix_produtos_categoria ON produtos (categoria);

-- =========================
-- Funções helper usadas pelo frontend (idempotentes)
-- - upsert_profile(email, nome, senha, image_url)
-- - get_profile_by_email(email)
-- =========================

CREATE OR REPLACE FUNCTION upsert_profile(
  _email VARCHAR,
  _nome VARCHAR,
  _senha TEXT DEFAULT NULL,
  _image_url TEXT DEFAULT NULL
) RETURNS TABLE (id BIGINT, email VARCHAR, nome VARCHAR, image_url TEXT, updated_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
    INSERT INTO usuarios (email, nome, senha, image_url, updated_at)
    VALUES (_email, _nome, _senha, _image_url, now())
    ON CONFLICT (email) DO UPDATE
      SET nome = EXCLUDED.nome,
          senha = COALESCE(EXCLUDED.senha, usuarios.senha),
          image_url = COALESCE(EXCLUDED.image_url, usuarios.image_url),
          updated_at = now()
    RETURNING id, email, nome, image_url, updated_at;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_profile_by_email(_email VARCHAR) RETURNS usuarios AS $$
DECLARE u usuarios%ROWTYPE;
BEGIN
  SELECT * INTO u FROM usuarios WHERE email = _email LIMIT 1;
  RETURN u;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute for public (ajuste conforme políticas de segurança do seu projeto)
GRANT EXECUTE ON FUNCTION upsert_profile(VARCHAR, VARCHAR, TEXT, TEXT) TO public;
GRANT EXECUTE ON FUNCTION get_profile_by_email(VARCHAR) TO public;

COMMIT;
