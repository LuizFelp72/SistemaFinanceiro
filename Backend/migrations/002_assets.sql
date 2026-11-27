CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  nome VARCHAR(255) NOT NULL CHECK (length(trim(nome)) > 0),
  tipo VARCHAR(255) NOT NULL CHECK (length(trim(tipo)) > 0),
  valor_aquisicao DECIMAL(15,2) NOT NULL CHECK (valor_aquisicao >= 0),
  valor_atual DECIMAL(15,2) NOT NULL CHECK (valor_atual >= 0),
  data_aquisicao DATE NOT NULL,
  descricao TEXT
);

CREATE INDEX assets_usuario_idx ON assets(usuario_id);
