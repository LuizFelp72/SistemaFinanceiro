CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  categoria_id UUID NOT NULL,
  mes CHAR(7) NOT NULL CHECK (mes ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  moeda CHAR(3) NOT NULL DEFAULT 'BRL' CHECK (moeda ~ '^[A-Z]{3}$'),
  valor_limite NUMERIC(15,2) NOT NULL CHECK (valor_limite > 0),
  FOREIGN KEY (categoria_id, usuario_id) REFERENCES categories(id, usuario_id) ON DELETE RESTRICT,
  UNIQUE (usuario_id, categoria_id, mes, moeda)
);
ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0;
