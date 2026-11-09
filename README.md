# SistemaFinanceiro
Projeto de um sistema financeiro utilizando React e Node JS para a matéria de desenvolvimento web.

## PostgreSQL com Docker

Na raiz do projeto, com Docker e Docker Compose instalados:

```bash
docker compose up -d --build --wait postgres
```

O banco `sistema_financeiro` fica disponível em `localhost:5432`, com usuário
`postgres` e senha `postgres` para desenvolvimento local. Os dados são mantidos
no volume `postgres_data`, inclusive após parar ou recriar o container.

Para configurar o backend e criar as tabelas:

```bash
cd Backend
cp .env.example .env
# Configure JWT_SECRET no .env.
npm ci
npm run db:migrate
npm start
```

A `DATABASE_URL` de `Backend/.env.example` já corresponde ao banco do Docker.
As migrações são executadas pelo backend, separadamente da inicialização do banco.

Para parar o banco preservando os dados, execute na raiz:

```bash
docker compose down
```

As variáveis `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_PORT`
podem ser definidas no ambiente ou em um arquivo `.env` na raiz. Por exemplo,
se a porta 5432 estiver ocupada:

```bash
POSTGRES_PORT=5433 docker compose up -d --build --wait postgres
```

Ao personalizar as credenciais ou a porta, ajuste também a `DATABASE_URL` em
`Backend/.env`. As credenciais de inicialização são aplicadas somente quando o
volume de dados está vazio.

Mais detalhes da API em [Backend/README.md](Backend/README.md).
