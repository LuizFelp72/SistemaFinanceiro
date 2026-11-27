# Diagnóstico do SistemaFinanceiro
Base c23ec34. O worktree original estava em b612095 com package-lock.json não rastreado. O laboratório parte dos 13 commits adicionais da main remota.

## Percurso de uma operação
A SPA React 19 usa TypeScript, Vite, React Router, MUI/Emotion, React Hook Form e ECharts. AppRoutes protege o layout; a base só renderiza dashboard, transações e patrimônio além do login. O menu declara nove destinos. Em auth/AuthContext a senha era verificada no navegador; a restauração confiava na presença de uma string. listarTransacoes e listarBens copiavam arrays de demonstração; o dashboard agregava esses lançamentos e saldos fixos. Busca e paginação locais funcionavam, sem efeitos no banco.

Express 5 monta /api/v1 em Backend/src/routes. Cada módulo usa um DTO, um service e um repository. shared/crud.js gera controllers e rotas, shared/sql.js parametriza as consultas e filtra por proprietário. PostgreSQL preserva valores em NUMERIC(15,2). O compose sobe banco, API e proxy nginx; a SPA usa Vite separadamente. A documentação operacional está em README.md e Backend/README.md.

users possui contas, categorias, métodos, bens, metas e transações. Uma transação referencia a conta de origem e pode referenciar destino, categoria e método; chaves compostas impedem cruzar proprietários. Cadastro/login usam bcrypt e JWT HS256; /auth/me verifica a sessão. O escopo é por usuário; não há papel administrativo demonstrado. Datas e decimais têm validadores próprios. POST retorna 201, DELETE 204, campos inválidos 400, sessão inválida 401, registros alheios 404, conflitos 409.

## Inventário na base
C/R/U/D descrevem o caminho disponível (API ou demonstração local); 🟢 exige fluxo funcional do navegador à persistência, 🟡 tem uma parte implementada, 🔴 ausente, ⚪ fora do escopo CRUD.

| Módulo | Create | Read | Update | Delete | Frontend | Backend | Status | Prioridade |
|---|---|---|---|---|---|---|---|---|
| Contas | API | API | API | API/inativação | Rota ausente | Testado | 🟡 | 1 |
| Categorias | API | API | API | API | Rota ausente | Testado | 🟡 | 2 |
| Métodos de pagamento | API | API | API | API/inativação | Sem gestão | Testado | 🟡 | 3 |
| Transações | API | API + lista local | API | API | Ações de escrita sem handler | Testado | 🟡 | 4 |
| Bens | API | API + lista/detalhe local | API | API | Escrita desabilitada | Testado | 🟡 | 5 |
| Metas | API | API | API | API | Rota ausente | Testado | 🟡 | 6 |
| Orçamentos | Ausente | Ausente | A definir | A definir | Só menu | Ausente | 🔴 | 7 |

**Base: 7 necessários, 0 completos (0%), 6 parciais, 1 inexistente, 7 pendentes.** Orçamentos entra pela página 3 do PDF (novo orçamento, gasto e disponível por categoria). Período, revisões e tratamento de histórico precisam de definição antes da migração.

| Validação e conflitos por módulo | Evidência no servidor |
|---|---|
| Contas | Tipo, moeda e saldo inicial; movimentações bloqueiam exclusão e troca de moeda. Inativação preserva histórico. |
| Categorias | Receita/despesa, propriedade e coerência com transações vinculadas. |
| Métodos | Tipo e ativação; método inativo não pode ser associado a lançamento novo. |
| Transações | Valor positivo, data válida, situação e referências compatíveis. Transferência entre contas distintas e ativas na mesma moeda. Bloqueio e transação SQL; apenas concluídas alteram saldo. |
| Bens | Aquisição e valor atual não negativos, nome/tipo/data obrigatórios; API aceita tipos livres e a UI usa quatro categorias. |
| Metas | Objetivo positivo, acumulado não negativo, prazo posterior ou igual ao início e status enumerado. |
| Orçamentos | Nenhum contrato de validação ou autorização encontrado. |

A suíte Backend/test/entities.integration.test.js exercita as rotas via HTTP e PostgreSQL, incluindo isolamento, paginação, concorrência, reversão de transferência e centavos. Dashboard e relatórios são leituras derivadas (⚪). O PDF pede exportação PDF/CSV e edição de perfil, mas não estabelece CRUD administrativo de usuários. Configurações, recuperação de senha, limite de cartão e relatórios são fluxos pendentes; limite não é saldo. A tabela de migrações é infraestrutura. Não há evidência para criar tabelas de gráficos ou permissões administrativas.

## Wireframes e plano
As cinco páginas do PDF mostram, em ordem, dashboard/transações, bens/contas, orçamentos/relatórios, metas/categorias e configurações. Compartilham navegação escura, título e ação principal no topo, indicadores e listagem abaixo. Contas precisa vir antes de lançamentos: conta_id é obrigatório. A seguir implementar os cadastros auxiliares, lançamentos e leituras derivadas. Reutilizar tema MUI, acesso por teclado, foco visível, feedback de erro e estados vazios. Testar paginação, dispositivos estreitos, saldos em moedas distintas e exclusão com vínculos.
