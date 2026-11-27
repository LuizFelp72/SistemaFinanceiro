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

## Resultado na branch

| Módulo | Create | Read | Update | Delete | Frontend | Backend | Status | Prioridade restante |
|---|---|---|---|---|---|---|---|---|
| Contas | Formulário | Lista, saldos, extrato | Edição e ativação | Confirmação e conflito | Integrado | Testado | 🟢 | Revisão |
| Categorias | API | API | API | API | Pendente | Testado | 🟡 | 1 |
| Métodos de pagamento | API | API | API | API | Pendente | Testado | 🟡 | 2 |
| Transações | Transferir pela conta; demais só API | Extrato real; lista geral local | API | API | Parcial | Testado | 🟡 | 3 |
| Bens | API | API e demonstração | API | API | Parcial | Testado | 🟡 | 4 |
| Metas | API | API | API | API | Pendente | Testado | 🟡 | 5 |
| Orçamentos | Ausente | Ausente | A definir | A definir | Pendente | Ausente | 🔴 | 6 |

**1 completo, 5 parciais, 1 inexistente. 6 de 7 precisam de desenvolvimento; conclusão por módulo: 14,3%.** O login real desbloqueia Contas. Cada tela que ainda usa dados locais identifica a demonstração. A implementação de Transações deve mapear UUIDs, transferências, status sem acento, strings decimais e paginação do servidor antes de substituir a lista local. Dashboard e relatórios exigem agregação por período e moeda; somar só a primeira página distorceria os indicadores.

## Experimentos e decisões
- A URL /contas abria em branco. Implementados os cartões, indicadores, extrato e transferência da página 2 do PDF. Em celular os cartões passam a uma coluna. Saldos de moedas diferentes aparecem separados, com aritmética em centavos.
- Mantidos tema MUI, barra lateral escura, cores de ação e hierarquia do produto. O cadastro e a edição usam diálogos com foco gerenciado, validação, bloqueio durante envio e erro retornado pela API. Exclusão exige confirmação; a conta com histórico pode ser inativada.
- Descartado o campo de período que só exibia texto. Um intervalo com limites inclusivos filtra os dados; limpar filtros restaura a lista. O diálogo de detalhe fecha com Escape e devolve o foco à ação.
- No login estreito, os dois painéis comprimiam o formulário. A ilustração agora aparece a partir de 600 px. Navegação inclui salto ao conteúdo e indicação de página indisponível. Gráficos e transições respeitam movimento reduzido.
- Omitidos limite de cartão, instituição financeira e comparação mensal em Contas porque o contrato não fornece esses dados. O gráfico consolidado de movimentações permanece pendente. A tela mostra saldo e extrato verificáveis; não simula valores para preencher o layout.
- Skills usadas: Impeccable para contexto existente e estados de interação, UI UX Pro Max para critérios de foco e movimento, Web Design Guidelines para rótulos e navegação. Frontend Design e Design Taste Frontend ficam como alternativas para uma reformulação visual; aqui o PDF e o tema existente definem a direção. As demais skills disponíveis atendem instalação/autoria, documentação OpenAI, ilustração e mídia, Pages, Sites, plugins, visualizações e pets. Nenhuma delas é necessária para a camada financeira. A validação usa os testes nativos do projeto e o navegador do ambiente.

## Evidências e limites
- 5/5 testes de validação e 17/17 de integração HTTP em PostgreSQL 18 local isolado, com quatro migrações aplicadas. O Compose especifica PostgreSQL 17; a pilha Docker não foi exercitada. O teste de integração usa schema exclusivo.
- Lint partia de dois erros no contexto de autenticação. ESLint e build de produção (tsc + Vite) passaram no resultado final. Permanece o aviso de tamanho do chunk de gráficos (cerca de 547 kB antes de gzip).
- Navegador: cadastro, criação, renomeação, desativação/reativação, recarga, logout e login, exclusão de conta temporária, exclusão bloqueada de conta com movimentação. Uma transferência de 10,25 de Carteira para Reserva preservou o total de 2.410,50; o extrato da origem mostrou −10,25. As contas usadas foram criadas no banco isolado.
- Busca por “Uber” e intervalo de um dia em 31/05/2025 retornaram um registro cada na demonstração. Limpeza dos filtros e retorno de foco após Escape verificados. Em Contas, captura de 1440×900 e 390×844; nenhum transbordamento horizontal da página no celular. Houve erros transitórios de HMR enquanto os arquivos eram editados e HTTP 409 esperado na exclusão com vínculo. Não houve auditoria integral de leitor de tela, carga, segurança ou Lighthouse.
- [Antes da rota Contas](evidencias/contas-antes.png) · [Depois em desktop](evidencias/contas-desktop.png) · [Depois em celular](evidencias/contas-mobile.png).
- Antes da integração, revisar a sessão por aba e o primeiro destino após login (/contas), validar o proxy com o ambiente de homologação e decidir as regras de orçamento e limite de cartão. Planejar teste de navegador repetível dos fluxos críticos. O CRUD de Contas está funcional; o produto como um todo ainda depende dos módulos acima.

## Atualização após 436ee10

O merge 436ee10 trouxe b53bee2 para a main. O diff desde c23ec34 altera 77 arquivos no frontend e não altera Backend ou Compose. A main tem telas mais completas e uma API simulada em services/mock; localStorage contém inclusive dados e credenciais de demonstração. O frontend desta branch continua usando JWT e os endpoints reais.

Para a futura conciliação, preservar a composição dos wireframes da main onde agregar valor (Página, Controles e formulários), adaptar os componentes ao transporte HTTP e manter as credenciais de demonstração fora do fluxo autenticado. Conferir os campos de cartão, histórico de avaliações, orçamentos, perfil e preferências quando os contratos reais chegarem. Evitar vincular os rascunhos locais a registros no servidor automaticamente: revisar categoria, mês e duplicatas antes de importar.

A branch conecta Dashboard, Transações, Bens, Categorias, Metas e Métodos de pagamento aos endpoints existentes. Relatórios agregam os lançamentos concluídos por ano e moeda e oferecem CSV e impressão. Orçamentos calcula gastos reais com limites rotulados como rascunhos locais. Configurações usa os dados do usuário autenticado com perfil em leitura e acesso à gestão dos métodos de pagamento.

## Consolidação e validação de 27/11
Integrada origin/main 436ee10 na branch de experimentos com resolução explícita. Mantidos os fluxos HTTP, tema e microinterações já aprovados nesta branch. Incorporado o exportador CSV da main, com escape de aspas e neutralização de fórmulas. A implementação alternativa com localStorage permanece no histórico da main, sem entrar no fluxo de produção desta branch.

Contratos confirmados contra os DTOs existentes. Orçamentos, edição de perfil, preferências e campos de cartão continuam dependendo de contratos adicionais. Nenhuma mudança de backend foi publicada no remoto desde c23ec34.

Navegador real com banco isolado: criação, edição e exclusão de categoria, método de pagamento, meta, bem e transação. Recarga confirmou persistência da transação. Token inválido resultou em redirecionamento ao login; novo login funcionou. Acionada a exportação CSV, mas o arquivo baixado não foi inspecionado. Testes de isolamento entre usuários, token expirado e transferências passaram na suíte HTTP/PostgreSQL (17/17). Lint, TypeScript e build passaram. Permanece o aviso de tamanho do chunk de gráficos. Houve erro transitório de Vite durante a resolução dos arquivos de merge; as requisições HTTP 401 posteriores foram provocadas pelo teste de sessão inválida.
