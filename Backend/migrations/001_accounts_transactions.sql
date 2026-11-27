CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Entidades de suporte aos vínculos; seus endpoints serão implementados em módulos próprios.
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  cor VARCHAR(50),
  icone VARCHAR(100),
  UNIQUE (id, usuario_id)
);

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('pix', 'dinheiro', 'credito', 'debito', 'boleto', 'outro')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (id, usuario_id)
);

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  nome VARCHAR(255) NOT NULL CHECK (length(trim(nome)) > 0),
  tipo VARCHAR(15) NOT NULL CHECK (tipo IN ('corrente', 'poupanca', 'carteira', 'investimento', 'outro')),
  saldo_inicial NUMERIC(15,2) NOT NULL DEFAULT 0,
  moeda CHAR(3) NOT NULL DEFAULT 'BRL' CHECK (moeda ~ '^[A-Z]{3}$'),
  ativo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (id, usuario_id)
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  descricao VARCHAR(255) NOT NULL CHECK (length(trim(descricao)) > 0),
  valor NUMERIC(15,2) NOT NULL CHECK (valor > 0),
  tipo VARCHAR(15) NOT NULL CHECK (tipo IN ('receita', 'despesa', 'transferencia')),
  data DATE NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'concluida' CHECK (status IN ('concluida', 'pendente')),
  categoria_id UUID,
  conta_id UUID NOT NULL,
  conta_destino_id UUID,
  metodo_pagamento_id UUID,
  observacao TEXT,
  FOREIGN KEY (conta_id, usuario_id) REFERENCES accounts(id, usuario_id) ON DELETE RESTRICT,
  FOREIGN KEY (conta_destino_id, usuario_id) REFERENCES accounts(id, usuario_id) ON DELETE RESTRICT,
  FOREIGN KEY (categoria_id, usuario_id) REFERENCES categories(id, usuario_id) ON DELETE RESTRICT,
  FOREIGN KEY (metodo_pagamento_id, usuario_id) REFERENCES payment_methods(id, usuario_id) ON DELETE RESTRICT,
  CHECK ((tipo = 'transferencia' AND conta_destino_id IS NOT NULL AND conta_destino_id <> conta_id)
      OR (tipo <> 'transferencia' AND conta_destino_id IS NULL)),
  CHECK (tipo <> 'transferencia' OR categoria_id IS NULL)
);

CREATE INDEX accounts_usuario_idx ON accounts(usuario_id);
CREATE INDEX categories_usuario_idx ON categories(usuario_id);
CREATE INDEX payment_methods_usuario_idx ON payment_methods(usuario_id);
CREATE INDEX transactions_usuario_data_idx ON transactions(usuario_id, data DESC, id);
CREATE INDEX transactions_conta_idx ON transactions(conta_id, usuario_id);
CREATE INDEX transactions_destino_idx ON transactions(conta_destino_id, usuario_id);
CREATE INDEX transactions_categoria_idx ON transactions(categoria_id, usuario_id);
CREATE INDEX transactions_metodo_idx ON transactions(metodo_pagamento_id, usuario_id);
