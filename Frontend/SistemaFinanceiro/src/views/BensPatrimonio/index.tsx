import { useState } from "react";
import { Box, Button, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Carregando, CartaoResumo, Pagina, Tendencia } from "../../components/Pagina";
import { Cartao, GradeResumo } from "../../components/Pagina.styles";
import { Abas, AcoesLinha, Filtro, Tabela } from "../../components/Controles";
import { Confirmacao, Detalhes, Formulario } from "../../components/Dialogos";
import { useDados } from "../../hooks/useDados";
import { bens, historicoBens } from "../../services";
import type { Bem, StatusBem } from "../../services/api/types";
import { cores } from "../../theme/theme";
import { bensEm, valorizacao, variacao } from "../../utils/calculos";
import { limitesDoMes, somarMeses } from "../../utils/datas";
import { centavos, formatarCentavos, formatarData, formatarMoeda, formatarPercentual, HOJE, moedaParaCampo } from "../../utils/formato";
import Composition from "./Composition";
import { categoriaDe, CATEGORIAS, STATUS } from "./constants";

const TITULO = "Bens / Patrimônio";
const SUBTITULO = "Gerencie seus bens e ativos";

type Dialogo = { acao: "novo" } | { acao: "ver" | "editar" | "excluir"; bem: Bem } | null;

function Variacao({ bem }: { bem: Bem }) {
  const valor = valorizacao(bem);
  const texto = `${Math.abs(valor).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  return (
    <Box component="span" sx={{ fontWeight: 600 }}>
      {Math.abs(valor) < 0.05
        ? <Box component="span" sx={{ color: cores.verde }}>{texto}</Box>
        : <Tendencia valor={valor}>{texto}</Tendencia>}
    </Box>
  );
}

export default function BensPatrimonio() {
  const [categoria, setCategoria] = useState("todos");
  const [status, setStatus] = useState("");
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const { dados, erro, recarregar } = useDados(() => Promise.all([bens.listarTodos(), historicoBens()]));

  if (!dados) return <Carregando titulo={TITULO} subtitulo={SUBTITULO} erro={erro} repetir={recarregar} />;
  const [lista, avaliacoes] = dados;
  const ativos = lista.filter((bem) => bem.status === "ativo");
  const investimentos = ativos.filter((bem) => categoriaDe(bem) === "Investimentos");
  const fimMesAnterior = limitesDoMes(somarMeses(HOJE.slice(0, 7), -1)).fim;
  const somar = (itens: Bem[]) => itens.reduce((total, bem) => total + centavos(bem.valor_atual), 0);
  const comparar = (itens: Bem[]) => {
    const delta = variacao(somar(itens), bensEm(itens, avaliacoes, fimMesAnterior));
    return delta === null ? undefined : <Tendencia valor={delta}>{formatarPercentual(delta)} vs. mês anterior</Tendencia>;
  };
  const filtrados = lista.filter((bem) =>
    (categoria === "todos" || categoriaDe(bem) === categoria) && (!status || bem.status === status));
  const fechar = () => setDialogo(null);
  const editando = dialogo?.acao === "editar" ? dialogo.bem : undefined;

  return (
    <Pagina
      titulo={TITULO}
      subtitulo={SUBTITULO}
      acoes={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogo({ acao: "novo" })}>Novo bem</Button>}
    >
      <GradeResumo>
        <CartaoResumo titulo="Patrimônio total" valor={formatarCentavos(somar(ativos))} detalhe={comparar(ativos)} />
        <CartaoResumo titulo="Total de bens" valor={formatarCentavos(somar(ativos) - somar(investimentos))} />
        <CartaoResumo titulo="Total de investimentos" valor={formatarCentavos(somar(investimentos))} detalhe={comparar(investimentos)} />
        <Composition bens={ativos} />
      </GradeResumo>

      <Cartao sx={{ p: 0, overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, p: "15px 20px", borderBottom: `1px solid ${cores.bordaSuave}` }}>
          <Abas
            rotulo="Categorias dos bens"
            valor={categoria}
            onChange={setCategoria}
            opcoes={[{ valor: "todos", rotulo: "Todos" }, ...["Imóveis", "Veículos", "Investimentos", "Outros"].map((c) => ({ valor: c, rotulo: c }))]}
          />
          <Filtro rotulo="Status" valor={status} onChange={setStatus}
            opcoes={[{ valor: "", rotulo: "Todos os status" }, ...Object.entries(STATUS).map(([valor, rotulo]) => ({ valor, rotulo }))]} />
        </Box>
        <Tabela rotulo="Bens e patrimônio">
          <TableHead><TableRow>
            <TableCell>Bem</TableCell><TableCell>Categoria</TableCell><TableCell align="right">Valor atual</TableCell>
            <TableCell align="right">Variação</TableCell><TableCell>Data aquisição</TableCell><TableCell align="center">Ações</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filtrados.map((bem) => (
              <TableRow key={bem.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{bem.nome}{bem.status !== "ativo" && ` (${STATUS[bem.status].toLowerCase()})`}</TableCell>
                <TableCell sx={{ color: "text.secondary" }}>{bem.tipo}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatarMoeda(bem.valor_atual)}</TableCell>
                <TableCell align="right"><Variacao bem={bem} /></TableCell>
                <TableCell sx={{ color: "text.secondary" }}>{formatarData(bem.data_aquisicao)}</TableCell>
                <TableCell align="center">
                  <AcoesLinha
                    nome={bem.nome}
                    onVer={() => setDialogo({ acao: "ver", bem })}
                    onEditar={() => setDialogo({ acao: "editar", bem })}
                    onExcluir={() => setDialogo({ acao: "excluir", bem })}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtrados.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ color: "text.secondary", height: "120px !important" }}>Nenhum bem encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Tabela>
        <Typography sx={{ fontSize: 15, color: "text.secondary", p: "14px 20px" }}>
          Mostrando {filtrados.length ? 1 : 0} a {filtrados.length} de {filtrados.length} bens
        </Typography>
      </Cartao>

      {(dialogo?.acao === "novo" || editando) && (
        <Formulario
          titulo={editando ? "Editar bem" : "Novo bem"}
          onFechar={fechar}
          campos={[
            { nome: "nome", rotulo: "Nome", obrigatorio: true },
            { nome: "tipo", rotulo: "Categoria", tipo: "selecao", obrigatorio: true, meia: true, opcoes: [...new Set([...CATEGORIAS.map((c) => c.nome), editando?.tipo ?? "Outros"])].map((c) => ({ valor: c, rotulo: c })) },
            { nome: "status", rotulo: "Status", tipo: "selecao", obrigatorio: true, meia: true, opcoes: Object.entries(STATUS).map(([valor, rotulo]) => ({ valor, rotulo })) },
            { nome: "valor_aquisicao", rotulo: "Valor de aquisição (R$)", tipo: "moeda", obrigatorio: true, meia: true },
            { nome: "valor_atual", rotulo: "Valor atual (R$)", tipo: "moeda", obrigatorio: true, meia: true },
            { nome: "data_aquisicao", rotulo: "Data de aquisição", tipo: "data", obrigatorio: true },
            { nome: "descricao", rotulo: "Descrição", tipo: "longo" },
          ]}
          inicial={{
            nome: editando?.nome ?? "", tipo: editando?.tipo ?? "Imóveis", status: editando?.status ?? "ativo",
            valor_aquisicao: moedaParaCampo(editando?.valor_aquisicao), valor_atual: moedaParaCampo(editando?.valor_atual),
            data_aquisicao: editando?.data_aquisicao ?? HOJE, descricao: editando?.descricao ?? "",
          }}
          onSalvar={async (v) => {
            const dadosBem = {
              nome: String(v.nome).trim(), tipo: String(v.tipo), status: String(v.status) as StatusBem,
              valor_aquisicao: String(v.valor_aquisicao), valor_atual: String(v.valor_atual),
              data_aquisicao: String(v.data_aquisicao), descricao: String(v.descricao).trim() || null,
            };
            await (editando ? bens.atualizar(editando.id, dadosBem) : bens.criar(dadosBem));
          }}
        />
      )}
      {dialogo?.acao === "excluir" && (
        <Confirmacao titulo="Excluir bem" mensagem={`Excluir "${dialogo.bem.nome}" e seu histórico de valores?`}
          onConfirmar={() => bens.remover(dialogo.bem.id)} onFechar={fechar} />
      )}
      {dialogo?.acao === "ver" && (
        <Detalhes titulo={dialogo.bem.nome} onFechar={fechar} itens={[
          { rotulo: "Categoria", valor: dialogo.bem.tipo },
          { rotulo: "Status", valor: STATUS[dialogo.bem.status] },
          { rotulo: "Valor de aquisição", valor: formatarMoeda(dialogo.bem.valor_aquisicao) },
          { rotulo: "Valor atual", valor: formatarMoeda(dialogo.bem.valor_atual) },
          { rotulo: "Variação desde a aquisição", valor: <Variacao bem={dialogo.bem} /> },
          { rotulo: "Data de aquisição", valor: formatarData(dialogo.bem.data_aquisicao) },
          { rotulo: "Descrição", valor: dialogo.bem.descricao ?? "—" },
        ]} />
      )}
    </Pagina>
  );
}
