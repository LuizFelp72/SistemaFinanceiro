import { useState } from "react";
import { Box, Button } from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Chart from "../../components/Chart";
import { opcaoBarras, opcaoLinha } from "../../components/Chart/opcoes";
import { Abas, Filtro, Progresso } from "../../components/Controles";
import { BotaoContorno } from "../../components/Controles.styles";
import { Carregando, CartaoResumo, Pagina, Tendencia } from "../../components/Pagina";
import { Cartao, GradeResumo, TituloCartao } from "../../components/Pagina.styles";
import { TIPOS } from "../../components/Transacao.constants";
import { useDados } from "../../hooks/useDados";
import { bens, categorias, contas, historicoBens, transacoes } from "../../services";
import { preferencias } from "../../services/extras";
import { cores } from "../../theme/theme";
import { concluidas, noPeriodo, patrimonioEm, resumir, variacao } from "../../utils/calculos";
import { limitesDoMes, ultimosMeses } from "../../utils/datas";
import { baixarCsv } from "../../utils/csv";
import { formatarCentavos, formatarData, formatarPercentual, HOJE, nomeMes } from "../../utils/formato";

const TITULO = "Relatórios";
const SUBTITULO = "Análise detalhada das suas finanças";

type Aba = "comparativo" | "fluxo" | "categoria" | "patrimonio";

export default function Relatorios() {
  const [aba, setAba] = useState<Aba>("comparativo");
  const [quantidade, setQuantidade] = useState(5);
  const { dados, erro, recarregar } = useDados(() => Promise.all([
    transacoes.listarTodos(), contas.listarTodos(), categorias.listarTodos(), bens.listarTodos(), historicoBens(), preferencias.buscar(),
  ]));

  if (!dados) return <Carregando titulo={TITULO} subtitulo={SUBTITULO} erro={erro} repetir={recarregar} />;
  const [lancamentos, listaContas, listaCategorias, listaBens, avaliacoes, opcoes] = dados;
  const efetivadas = concluidas(lancamentos);

  // Ano até a data de referência contra o mesmo intervalo do ano anterior.
  const ano = Number(HOJE.slice(0, 4));
  const doAno = (a: number) => resumir(noPeriodo(efetivadas, { inicio: `${a}-01-01`, fim: `${a}${HOJE.slice(4)}` }));
  const atual = doAno(ano);
  const anterior = doAno(ano - 1);
  const comparar = (a: number, b: number, inverter = false) => {
    const delta = variacao(a, b);
    return delta === null
      ? "Sem ano anterior para comparar"
      : <Tendencia valor={delta} inverter={inverter}>{formatarPercentual(Math.abs(delta))} vs. ano anterior</Tendencia>;
  };

  const meses = ultimosMeses(HOJE.slice(0, 7), quantidade);
  const rotulos = meses.map(nomeMes);
  const porMes = meses.map((mes) => resumir(efetivadas.filter((t) => t.data.startsWith(mes))));
  const patrimonio = meses.map((mes) => patrimonioEm(listaContas, lancamentos, listaBens, avaliacoes, limitesDoMes(mes).fim) / 100);
  const periodo = { inicio: `${meses[0]}-01`, fim: HOJE };
  const categoriaDe = (id: string) => listaCategorias.find((c) => c.id === id);

  const doMes = porMes.at(-1)!;
  const top = doMes.porCategoria.slice(0, 5);
  const doPeriodo = resumir(noPeriodo(efetivadas, periodo)).porCategoria;

  const graficos = {
    comparativo: opcaoBarras(rotulos, [
      { nome: "Receitas", cor: cores.verde, valores: porMes.map((r) => r.receitas / 100) },
      { nome: "Despesas", cor: cores.vermelho, valores: porMes.map((r) => r.despesas / 100) },
    ], true),
    fluxo: opcaoBarras(rotulos, [{ nome: "Saldo do mês", cor: cores.primaria, valores: porMes.map((r) => r.saldo / 100) }], true),
    categoria: opcaoBarras(
      doPeriodo.map((item) => categoriaDe(item.categoriaId)?.nome ?? "Sem categoria"),
      [{ nome: "Despesas no período", cor: cores.primaria, valores: doPeriodo.map((item) => item.valor / 100) }], true,
    ),
    patrimonio: opcaoLinha(rotulos, patrimonio, "Patrimônio líquido", { pontos: true }),
  };

  const exportar = () => {
    const nomeConta = (id: string | null) => listaContas.find((c) => c.id === id)?.nome ?? "";
    baixarCsv(`nuvra-transacoes-${periodo.inicio}-a-${periodo.fim}.csv`, [
      ["Data", "Descrição", "Categoria", "Tipo", "Valor", "Status", "Conta", "Conta de destino"],
      ...noPeriodo(lancamentos, periodo).map((t) => [
        formatarData(t.data), t.descricao, categoriaDe(t.categoria_id ?? "")?.nome ?? "", TIPOS[t.tipo].rotulo,
        `${t.tipo === "despesa" ? "-" : ""}${t.valor.replace(".", ",")}`,
        t.status === "concluida" ? "Concluída" : "Pendente", nomeConta(t.conta_id), nomeConta(t.conta_destino_id),
      ]),
    ]);
  };

  return (
    <Pagina
      titulo={TITULO}
      subtitulo={SUBTITULO}
      acoes={<>
        <BotaoContorno variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={() => window.print()}>Exportar PDF</BotaoContorno>
        <Button variant="contained" startIcon={<FileDownloadOutlinedIcon />} onClick={exportar}>Exportar CSV</Button>
      </>}
    >
      <GradeResumo>
        <CartaoResumo titulo="Receita total (ano)" valor={formatarCentavos(atual.receitas)} detalhe={comparar(atual.receitas, anterior.receitas)} />
        <CartaoResumo titulo="Despesa total (ano)" valor={formatarCentavos(atual.despesas)} detalhe={comparar(atual.despesas, anterior.despesas, true)} />
        <CartaoResumo titulo="Saldo líquido (ano)" valor={formatarCentavos(atual.saldo)} detalhe={comparar(atual.saldo, anterior.saldo)} />
        <CartaoResumo titulo="Taxa de poupança média" valor={atual.receitas ? formatarPercentual((atual.saldo / atual.receitas) * 100) : "—"}
          detalhe={`Meta: ${formatarPercentual(opcoes.meta_poupanca)}`} />
      </GradeResumo>

      <Cartao sx={{ p: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, p: "15px 20px", borderBottom: `1px solid ${cores.bordaSuave}` }}>
          <Abas rotulo="Tipo de relatório" valor={aba} onChange={setAba} opcoes={[
            { valor: "comparativo", rotulo: "Receitas vs Despesas" }, { valor: "fluxo", rotulo: "Fluxo de Caixa" },
            { valor: "categoria", rotulo: "Por Categoria" }, { valor: "patrimonio", rotulo: "Patrimônio" },
          ]} />
          <Filtro rotulo="Período do relatório" valor={String(quantidade)} onChange={(v) => setQuantidade(Number(v))}
            opcoes={[3, 5, 6, 12].map((n) => ({ valor: String(n), rotulo: `Últimos ${n} meses` }))} />
        </Box>
        <Box sx={{ p: "14px 20px 20px" }}>
          <Chart height={270} option={graficos[aba]} empty={aba === "categoria" && doPeriodo.length === 0}
            label={`Gráfico de ${aba} dos últimos ${quantidade} meses.`} />
        </Box>
      </Cartao>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "3fr 4fr" }, gap: "22px" }}>
        <Cartao>
          <TituloCartao>Top categorias de gastos</TituloCartao>
          <Box sx={{ mt: 2.5, display: "grid", gap: "13px" }}>
            {top.map((item) => {
              const categoria = categoriaDe(item.categoriaId);
              const cor = categoria?.cor ?? cores.cinza;
              return (
                <Box key={item.categoriaId}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 15, mb: "4px" }}>
                    <Box sx={{ width: 13, height: 13, borderRadius: "50%", bgcolor: cor }} />
                    <Box component="span" sx={{ flex: 1 }}>{categoria?.nome ?? "Sem categoria"}</Box>
                    <Box component="span" sx={{ color: "text.secondary" }}>{formatarPercentual((item.valor / doMes.despesas) * 100)}</Box>
                    <Box component="span" sx={{ fontWeight: 600, minWidth: 110, textAlign: "right" }}>{formatarCentavos(item.valor)}</Box>
                  </Box>
                  {/* Barra relativa à maior categoria do mês. */}
                  <Progresso percentual={(item.valor / top[0].valor) * 99} cor={cor} altura={7} rotulo={`Gastos com ${categoria?.nome}`} />
                </Box>
              );
            })}
            {top.length === 0 && <Box sx={{ color: "text.secondary" }}>Sem despesas neste mês.</Box>}
          </Box>
        </Cartao>
        <Cartao>
          <TituloCartao>Evolução do patrimônio</TituloCartao>
          <Box sx={{ mt: 2 }}>
            <Chart height={220} label="Evolução do patrimônio líquido por mês." option={opcaoLinha(rotulos, patrimonio, "Patrimônio líquido", { pontos: true })} />
          </Box>
        </Cartao>
      </Box>
    </Pagina>
  );
}
