const { createRepository, contains } = require("../../shared/sql");

module.exports = createRepository({
  table: "assets",
  projection: `id, usuario_id, nome, tipo,
    valor_aquisicao::text AS valor_aquisicao,
    valor_atual::text AS valor_atual,
    to_char(data_aquisicao, 'YYYY-MM-DD') AS data_aquisicao,
    descricao`,
  conditions: { tipo: p => `lower(tipo) = lower(${p})`, busca: p => `nome ILIKE ${p}` },
  valueOf: { busca: contains },
  orderBy: "data_aquisicao DESC, nome ASC, id ASC",
});
