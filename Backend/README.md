# API de contas e transações

Implementação modular em JavaScript/CommonJS, seguindo a base existente do projeto:
Express 5 e PostgreSQL com `pg`. Cada módulo em `src/modules/` contém rotas,
controller, DTO, service e repository. Não há novas dependências de execução.

## Executar

Requisitos: Node.js 18 ou superior e PostgreSQL 13 ou superior.

Para iniciar o PostgreSQL local pelo Docker, execute `docker compose up -d --build --wait postgres`
na raiz do repositório. A conexão padrão de `.env.example` já corresponde a esse banco.

```bash
cd Backend
npm ci
cp .env.example .env
# Configure DATABASE_URL e JWT_SECRET no .env antes de iniciar.
npm run db:migrate
npm start
```

As migrações são versionadas, transacionais e protegidas contra aplicação
simultânea. O comando pode ser repetido. Execute em um banco novo: o backend
original não possuía tabelas. A migração cria `accounts`, `transactions` e as
tabelas de suporte `users`, `categories` e `payment_methods`, necessárias para
integridade referencial. Não modifica bancos automaticamente ao iniciar a API.

## Autenticação e escopo

Todas as rotas financeiras exigem `Authorization: Bearer <token>`.
O token deve ser JWT HS256 assinado com `JWT_SECRET`, ter `sub` igual ao UUID de
um registro existente em `users` e conter `exp` válido. A API verifica a
assinatura, a expiração e a existência do usuário a cada requisição.

Cadastro, login, emissão de tokens e CRUD de categorias/métodos de pagamento
ficam para módulos próprios. Esta entrega fornece a verificação JWT para
proteger contas e transações; o frontend continua usando seus mocks.

O `usuario_id` é sempre obtido do token. Enviá-lo no corpo é rejeitado.
Referências a contas, categorias e métodos de outros usuários são rejeitadas,
inclusive por chaves estrangeiras compostas no banco. Registros pertencentes a
outro usuário retornam 404.

## Endpoints

| Recurso | Coleção | Registro |
| --- | --- | --- |
| Contas | `/api/v1/accounts` | `/api/v1/accounts/:id` |
| Transações | `/api/v1/transactions` | `/api/v1/transactions/:id` |

Coleções aceitam GET e POST. Registros aceitam GET, PATCH e DELETE.
POST retorna 201 e `Location`; DELETE retorna 204, sem corpo.
GET de coleção retorna `{ "data": [], "total": 0, "page": 1, "limit": 20 }`.
Os parâmetros `page` e `limit` são opcionais; o limite máximo é 100.
Campos desconhecidos, PATCH vazio e dados inválidos retornam 400.
Conflitos de integridade retornam 409. Erros seguem `{ "error": "mensagem" }`.

### Conta

```json
{
  "nome": "Conta principal",
  "tipo": "corrente",
  "saldo_inicial": "1000.00",
  "moeda": "BRL",
  "ativo": true
}
```

`nome` e `tipo` são obrigatórios. Tipos: `corrente`, `poupanca`, `carteira`,
`investimento`, `outro`. Valores padrão: saldo `0.00`, moeda `BRL`, ativo `true`.
A moeda utiliza três letras maiúsculas. Saldos iniciais negativos são aceitos.
GET também retorna `id`, `usuario_id` e `saldo_atual` calculado.
Filtros: `tipo`, `ativo=true|false`.

Contas com movimentações não podem ser excluídas nem trocar de moeda.
Use PATCH com `ativo: false` para desativá-las. Contas inativas preservam seu
histórico e não aceitam criação ou edição de movimentações. A exclusão de uma
transação continua possível para corrigir o histórico.

### Transação

```json
{
  "descricao": "Supermercado",
  "valor": "150.25",
  "tipo": "despesa",
  "data": "2026-11-09",
  "conta_id": "UUID-DA-CONTA",
  "status": "concluida",
  "categoria_id": null,
  "metodo_pagamento_id": null,
  "observacao": null
}
```

Obrigatórios: `descricao`, `valor`, `tipo`, `data`, `conta_id`.
Tipos: `receita`, `despesa`, `transferencia`.
Status: `concluida` (padrão), `pendente`. Os enums da API são escritos sem acentos.
`categoria_id`, `metodo_pagamento_id`, `conta_destino_id` e `observacao` são
opcionais e aceitam `null`. Datas usam `AAAA-MM-DD`, sem conversão de fuso.
Uma categoria deve corresponder ao tipo receita/despesa; o método deve estar ativo.

Filtros: `tipo`, `status`, `conta_id`, `categoria_id`, `data_inicio`, `data_fim`,
`busca` (trecho da descrição, sem distinguir maiúsculas). O intervalo de datas é
inclusivo. O filtro `conta_id` também inclui transferências recebidas.

### Transferência e saldo

```json
{
  "descricao": "Transferência para poupança",
  "valor": "200.00",
  "tipo": "transferencia",
  "data": "2026-11-09",
  "conta_id": "UUID-DA-ORIGEM",
  "conta_destino_id": "UUID-DO-DESTINO"
}
```

A origem e o destino devem ser contas distintas, ativas, do mesmo usuário e na
mesma moeda. Transferências não aceitam categoria de receita/despesa.
Receitas e despesas não aceitam destino. Para alterar uma transferência para
receita/despesa, envie também `conta_destino_id: null` no PATCH.

Uma transferência é representada por um único registro referenciando ambas as
contas. Sua criação/edição usa uma transação de banco com bloqueio das contas;
as duas pontas são refletidas juntas no saldo, sem lançamentos parciais.

`saldo_atual = saldo_inicial + receitas - despesas - transferências enviadas +
transferências recebidas`. Apenas transações `concluida` entram no cálculo.
Alterar/excluir uma transação ou alterar o saldo inicial recalcula o resultado
automaticamente. Saldos negativos são permitidos.

Dinheiro é armazenado como `NUMERIC(15,2)` e retornado como string decimal,
evitando perda de precisão. Prefira enviar valores como strings: `"0.10"`.
Transações exigem valor positivo, até 13 dígitos inteiros e 2 casas decimais.

## Testes

```bash
npm test
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/financeiro_test npm run test:integration
```

Use um banco exclusivo para testes. A suíte de integração cria um schema
aleatório, aplica as migrações e remove apenas esse schema ao terminar.
O usuário do banco precisa de permissão para criar schemas. Os testes exercitam
HTTP e PostgreSQL reais: autenticação, CRUD, isolamento, validação, centavos,
transferências, rollback, concorrência, integridade e paginação.
