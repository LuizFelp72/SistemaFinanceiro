CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  nome VARCHAR(255) NOT NULL CHECK (length(trim(nome)) > 0),
  valor_objetivo DECIMAL(15,2) NOT NULL CHECK (valor_objetivo > 0),
  valor_atual DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (valor_atual >= 0),
  data_inicio DATE NOT NULL,
  data_limite DATE NOT NULL,
  status VARCHAR(15) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'concluida', 'cancelada')),
  CHECK (data_limite >= data_inicio)
);

CREATE INDEX financial_goals_usuario_idx ON financial_goals(usuario_id);
