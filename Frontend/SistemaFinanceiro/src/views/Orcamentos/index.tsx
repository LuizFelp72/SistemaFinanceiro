import { useState } from "react";
import { Box, Button, ButtonBase, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import Chart from "../../components/Chart";
import { opcaoBarras } from "../../components/Chart/opcoes";
import { Progresso } from "../../components/Controles";
import { Confirmacao, Formulario } from "../../components/Dialogos";
import { Carregando, CartaoResumo, Pagina, Tendencia } from "../../components/Pagina";
import { Cartao, GradeResumo, TituloCartao } from "../../components/Pagina.styles";
import { useDados } from "../../hooks/useDados";
import { categorias, transacoes } from "../../services";
import { ALERTA_ORCAMENTO, orcamentos } from "../../services/extras";
import type { Orcamento } from "../../services/api/types";
import { cores } from "../../theme/theme";
import { concluidas, resumir } from "../../utils/calculos";
import { ultimosMeses } from "../../utils/datas";
import { centavos, formatarCentavos, formatarMoeda, formatarPercentual, HOJE, nomeMes, moedaParaCampo } from "../../utils/formato";

const TITULO = "Orçamentos";
const SUBTITULO = "Controle seus gastos por categoria";
const ATENCAO = 75;

type Dialogo = { acao: "novo" } | { acao: "editar" | "excluir"; orcamento: Orcamento } | null;

export default function Orcamentos() {
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const mes = HOJE.slice(0, 7);
  const { dados, erro, recarregar } = useDados(() => Promise.all([
    orcamentos.listarTodos({ mes }), categorias.listarTodos(), transacoes.listarTodos(),
  ]));

  if (!dados) return <Carregando titulo={TITULO} subtitulo={SUBTITULO} erro={erro} repetir={recarregar} />;
  const [lista, listaCategorias, lancamentos] = dados;
  const itens = lista.map((orcamento) => ({
    orcamento,
    categoria: listaCategorias.find((c) => c.id === orcamento.categoria_id),
    uso: (centavos(orcamento.valor_gasto) / centavos(orcamento.valor_limite)) * 100,
  }));
  const orcado = lista.reduce((total, o) => total + centavos(o.valor_limite), 0);
  const gasto = lista.reduce((total, o) => total + centavos(o.valor_gasto), 0);
  const disponivel = orcado - gasto;
  const noLimite = itens.filter((item) => item.uso >= ALERTA_ORCAMENTO).sort((a, b) => b.uso - a.uso);
  const pior = noLimite[0];
  const meses = ultimosMeses(mes, 5);
  const gastosMensais = meses.map((m) => resumir(concluidas(lancamentos).filter((t) => t.data.startsWith(m))).despesas / 100);

  const fechar = () => setDialogo(null);
  const editando = dialogo?.acao === "editar" ? dialogo.orcamento : undefined;
  const livres = listaCategorias.filter((c) => c.tipo === "despesa"
    && (c.id === editando?.categoria_id || !lista.some((o) => o.categoria_id === c.id)));

  return (
    <Pagina
      titulo={TITULO}
      subtitulo={SUBTITULO}
      acoes={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogo({ acao: "novo" })}>Novo orçamento</Button>}
    >
      <GradeResumo>
        <CartaoResumo titulo="Total orçado" valor={formatarCentavos(orcado)} detalhe="Este mês" />
        <CartaoResumo titulo="Total gasto" valor={formatarCentavos(gasto)} detalhe={`${formatarPercentual(orcado ? (gasto / orcado) * 100 : 0)} do orçamento`} />
        <CartaoResumo titulo="Disponível" valor={formatarCentavos(disponivel)}
          detalhe={orcado ? <Tendencia valor={disponivel}>{formatarPercentual((disponivel / orcado) * 100)} restante</Tendencia> : undefined} />
        <CartaoResumo titulo="Categorias no limite" valor={`${noLimite.length} ${noLimite.length === 1 ? "categoria" : "categorias"}`}
          detalhe={pior
            ? <Tendencia valor={-1}>{pior.categoria?.nome} atingiu {formatarPercentual(pior.uso, 0)}</Tendencia>
            : "Nenhuma perto do limite"} />
      </GradeResumo>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }, gap: "20px" }}>
        {itens.map(({ orcamento, categoria, uso }) => {
          const nivel = uso >= ALERTA_ORCAMENTO ? cores.vermelho : uso >= ATENCAO ? cores.ambar : null;
          const restante = centavos(orcamento.valor_limite) - centavos(orcamento.valor_gasto);
          return (
            <Cartao key={orcamento.id} sx={{ p: 0, display: "flex" }}>
              <ButtonBase
                aria-label={`Editar orçamento de ${categoria?.nome}`}
                onClick={() => setDialogo({ acao: "editar", orcamento })}
                sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start", width: "100%", textAlign: "left", p: "20px 18px", borderRadius: "16px", "&:hover, &.Mui-focusVisible": { bgcolor: cores.fundoTabela } }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "14px", mb: "10px" }}>
                  <Box component="span" aria-hidden sx={{ fontSize: 18, width: 20 }}>{categoria?.icone}</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35 }}>{categoria?.nome}</Typography>
                    <Typography sx={{ fontSize: 14, color: "text.secondary" }}>{formatarMoeda(orcamento.valor_gasto)} de {formatarMoeda(orcamento.valor_limite)}</Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35, color: nivel ?? cores.verde }}>{formatarPercentual(uso, 0)}</Typography>
                    <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                      {restante >= 0 ? `${formatarCentavos(restante)} restante` : `${formatarCentavos(-restante)} acima`}
                    </Typography>
                  </Box>
                </Box>
                <Progresso percentual={uso} cor={nivel ?? categoria?.cor ?? cores.primaria} altura={9} rotulo={`Uso do orçamento de ${categoria?.nome}`} />
                {uso >= ALERTA_ORCAMENTO && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.25, color: cores.vermelho, fontSize: 12 }}>
                    <ErrorOutlineRoundedIcon sx={{ fontSize: 14 }} />{uso > 100 ? "Limite ultrapassado" : "Próximo do limite"}
                  </Box>
                )}
              </ButtonBase>
            </Cartao>
          );
        })}
        {itens.length === 0 && <Cartao>Nenhum orçamento neste mês.</Cartao>}
      </Box>

      <Cartao sx={{ p: 0 }}>
        <Box sx={{ p: "15px 18px", borderBottom: `1px solid ${cores.bordaSuave}` }}><TituloCartao>Evolução mensal dos gastos</TituloCartao></Box>
        <Box sx={{ p: "10px 20px 20px" }}>
          <Chart
            height={200}
            label={`Gastos mensais: ${meses.map((m, i) => `${nomeMes(m)}, ${formatarMoeda(gastosMensais[i])}`).join("; ")}.`}
            option={opcaoBarras(meses.map(nomeMes), [{ nome: "Gastos", cor: cores.primaria, valores: gastosMensais }])}
          />
        </Box>
      </Cartao>

      {(dialogo?.acao === "novo" || editando) && (
        <Formulario
          titulo={editando ? "Editar orçamento" : "Novo orçamento"}
          onFechar={fechar}
          onExcluir={editando ? () => setDialogo({ acao: "excluir", orcamento: editando }) : undefined}
          campos={[
            { nome: "categoria_id", rotulo: "Categoria", tipo: "selecao", obrigatorio: true, opcoes: livres.map((c) => ({ valor: c.id, rotulo: c.nome })) },
            { nome: "valor_limite", rotulo: "Limite mensal (R$)", tipo: "moeda", obrigatorio: true, meia: true },
            { nome: "mes", rotulo: "Mês", tipo: "mes", obrigatorio: true, meia: true },
          ]}
          inicial={{
            categoria_id: editando?.categoria_id ?? "", valor_limite: moedaParaCampo(editando?.valor_limite), mes: editando?.mes ?? mes,
          }}
          onSalvar={async (v) => {
            const dadosOrcamento = { categoria_id: String(v.categoria_id), valor_limite: String(v.valor_limite), mes: String(v.mes) };
            await (editando ? orcamentos.atualizar(editando.id, dadosOrcamento) : orcamentos.criar(dadosOrcamento));
          }}
        />
      )}
      {dialogo?.acao === "excluir" && (
        <Confirmacao titulo="Excluir orçamento" mensagem="Excluir este orçamento? As transações não são afetadas."
          onConfirmar={() => orcamentos.remover(dialogo.orcamento.id)} onFechar={fechar} />
      )}
    </Pagina>
  );
}
