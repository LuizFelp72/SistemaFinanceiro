# SistemaFinanceiro
Projeto de um sistema financeiro utilizando React e Node JS para a matéria de desenvolvimento web.

## Executando com Docker

Requer Docker e Docker Compose. Na raiz do projeto:

```bash
cp .env.example .env     # defina JWT_SECRET (mínimo de 32 caracteres)
docker compose up -d --build --wait
```

Serviços:

| Serviço | Função | Acesso |
| --- | --- | --- |
| `postgres` | Banco PostgreSQL 17 (dados no volume `postgres_data`) | `localhost:5432` |
| `backend` | API Node. Aplica as migrações e inicia | interno (porta 3000) |
| `nginx` | Proxy reverso: encaminha `/api` ao backend | `http://localhost` (`HTTP_PORT`) |

A API fica em `http://localhost/api/v1` (teste: `curl http://localhost/api/v1/health`). As migrações são
idempotentes e rodam a cada subida do backend; nada é recriado se já estiverem aplicadas.

```bash
docker compose logs -f backend   # acompanhar migrações e requisições
docker compose down              # parar preservando os dados (use -v para apagar o volume)
```

As variáveis do `.env` da raiz (`POSTGRES_*`, `HTTP_PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`) são descritas em
`.env.example`. As credenciais do Postgres só valem para um volume novo.

### Desenvolvimento sem Docker para o backend

Suba apenas o banco (`docker compose up -d --build --wait postgres`) e rode a API localmente:

```bash
cd Backend
cp .env.example .env     # configure JWT_SECRET
npm ci
npm run db:migrate
npm run dev
```

Mais detalhes da API em [Backend/README.md](Backend/README.md).

## Frontend local

Depois de subir a API e aplicar as migrações, execute na pasta `Frontend/SistemaFinanceiro`:

```bash
npm ci
npm run dev
```

Abra a URL do Vite e use **Criar cadastro**. O proxy de desenvolvimento encaminha `/api` para `http://127.0.0.1:3000`. Para a API do Compose, configure `API_PROXY_TARGET=http://localhost` no ambiente do terminal (ajuste a porta se alterou HTTP_PORT). Em produção, a SPA precisa ser servida com fallback de rotas e com `/api` encaminhado ao backend na mesma origem.

O [diagnóstico e a validação](docs/diagnostico-ui.md) registram a cobertura dos módulos e as telas que ainda usam demonstração.
