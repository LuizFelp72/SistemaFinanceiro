import { useState } from "react";
import { Box, Button, InputAdornment, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Abas, AcoesLinha, Progresso, Selo, Tabela } from "../../components/Controles";
import { Confirmacao, Formulario } from "../../components/Dialogos";
import { Carregando, CartaoResumo, Pagina, Tendencia } from "../../components/Pagina";
import { Cartao, GradeResumo } from "../../components/Pagina.styles";
import { TIPOS } from "../../components/Transacao.constants";
import { useDados } from "../../hooks/useDados";
import { categorias, transacoes } from "../../services";
import { contem } from "../../services/mock/crud";
import type { Categoria, TipoCategoria } from "../../services/api/types";
import { cores } from "../../theme/theme";
import { concluidas } from "../../utils/calculos";
import { centavos, formatarCentavos, formatarPercentual, HOJE } from "../../utils/formato";

const TITULO = "Categorias";
const SUBTITULO = "Organize e gerencie suas categorias financeiras";

type Dialogo = { acao: "novo" } | { acao: "editar" | "excluir"; categoria: Categoria } | null;

export default function Categorias() {
  const [tipo, setTipo] = useState<TipoCategoria | "todas">("todas");
  const [busca, setBusca] = useState("");
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const { dados, erro, recarregar } = useDados(() => Promise.all([categorias.listarTodos(), transacoes.listarTodos()]));

  if (!dados) return <Carregando titulo={TITULO} subtitulo={SUBTITULO} erro={erro} repetir={recarregar} />;
  const [lista, lancamentos] = dados;
  const doMes = concluidas(lancamentos).filter((t) => t.data.startsWith(HOJE.slice(0, 7)));
  const linhas = lista.map((categoria) => {
    const suas = doMes.filter((t) => t.categoria_id === categoria.id);
    return { categoria, quantidade: suas.length, total: suas.reduce((soma, t) => soma + centavos(t.valor), 0) };
  });
  // A barra de distribuição é relativa à categoria com maior total no mês.
  const maiorTotal = Math.max(1, ...linhas.map((linha) => linha.total));
  const maisUsada = [...linhas].sort((a, b) => b.quantidade - a.quantidade)[0];
  const visiveis = linhas.filter(({ categoria }) =>
    (tipo === "todas" || categoria.tipo === tipo) && contem(categoria.nome, busca));
  const ativas = lista.filter((c) => c.ativo).length;
  const fechar = () => setDialogo(null);
  const editando = dialogo?.acao === "editar" ? dialogo.categoria : undefined;

  return (
    <Pagina
      titulo={TITULO}
      subtitulo={SUBTITULO}
      acoes={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogo({ acao: "novo" })}>Nova categoria</Button>}
    >
      <GradeResumo>
        <CartaoResumo titulo="Total de categorias" valor={lista.length}
          detalhe={<Tendencia valor={1}>{ativas === lista.length ? "Ativas" : `${ativas} ativas`}</Tendencia>} />
        <CartaoResumo titulo="Categorias de despesa" valor={lista.filter((c) => c.tipo === "despesa").length} />
        <CartaoResumo titulo="Categorias de receita" valor={lista.filter((c) => c.tipo === "receita").length} />
        <CartaoResumo titulo="Mais utilizada" valor={maisUsada?.quantidade ? maisUsada.categoria.nome : "—"}
          detalhe={`${maisUsada?.quantidade ?? 0} transações este mês`} />
      </GradeResumo>

      <Cartao sx={{ p: 0, overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, p: "14px 18px", borderBottom: `1px solid ${cores.bordaSuave}` }}>
          <Abas rotulo="Tipo de categoria" valor={tipo} onChange={setTipo}
            opcoes={[{ valor: "todas", rotulo: "Todas" }, { valor: "despesa", rotulo: "Despesa" }, { valor: "receita", rotulo: "Receita" }]} />
          <TextField
            size="small"
            value={busca}
            placeholder="Buscar categoria..."
            onChange={(evento) => setBusca(evento.target.value)}
            slotProps={{
              htmlInput: { "aria-label": "Buscar categoria" },
              input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 17, color: cores.textoFraco }} /></InputAdornment> },
            }}
            sx={{ width: { xs: "100%", sm: 180 }, "& .MuiOutlinedInput-root": { height: 34, fontSize: 14 } }}
          />
        </Box>
        <Box sx={{ "& tbody td": { height: "55px !important" } }}>
          <Tabela rotulo="Categorias" larguraMinima={850}>
            <TableHead><TableRow>
              <TableCell>Categoria</TableCell><TableCell>Tipo</TableCell><TableCell align="right">Transações</TableCell>
              <TableCell align="right">Total (mês)</TableCell><TableCell>Distribuição</TableCell><TableCell align="center">Ações</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {visiveis.map(({ categoria, quantidade, total }) => {
                const cor = categoria.cor ?? cores.cinza;
                const percentual = (total / maiorTotal) * 100;
                return (
                  <TableRow key={categoria.id} hover>
                    <TableCell sx={{ fontWeight: 600, width: "28%", opacity: categoria.ativo ? 1 : 0.55 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Box component="span" aria-hidden sx={{ width: 20, fontSize: 18 }}>{categoria.icone}</Box>
                        <Box sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: cor }} />
                        {categoria.nome}{!categoria.ativo && " (inativa)"}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: "18%" }}>
                      <Selo cor={TIPOS[categoria.tipo].cor} fundo={categoria.tipo === "receita" ? cores.verdeSuave : cores.vermelhoSuave}>{TIPOS[categoria.tipo].rotulo}</Selo>
                    </TableCell>
                    <TableCell align="right">{quantidade}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatarCentavos(total)}</TableCell>
                    <TableCell sx={{ width: "17%" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 100 }}><Progresso percentual={percentual} cor={cor} altura={6} rotulo={`Distribuição de ${categoria.nome}`} /></Box>
                        <Box component="span" sx={{ fontSize: 12, color: "text.secondary", minWidth: 36 }}>{formatarPercentual(percentual, 0)}</Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <AcoesLinha nome={categoria.nome}
                        onEditar={() => setDialogo({ acao: "editar", categoria })}
                        onExcluir={() => setDialogo({ acao: "excluir", categoria })} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {visiveis.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ color: "text.secondary" }}>Nenhuma categoria encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Tabela>
        </Box>
      </Cartao>

      {(dialogo?.acao === "novo" || editando) && (
        <Formulario
          titulo={editando ? "Editar categoria" : "Nova categoria"}
          onFechar={fechar}
          campos={[
            { nome: "nome", rotulo: "Nome", obrigatorio: true },
            { nome: "tipo", rotulo: "Tipo", tipo: "selecao", obrigatorio: true, opcoes: [{ valor: "despesa", rotulo: "Despesa" }, { valor: "receita", rotulo: "Receita" }] },
            { nome: "icone", rotulo: "Ícone (emoji)", meia: true },
            { nome: "cor", rotulo: "Cor", tipo: "cor", meia: true },
            { nome: "ativo", rotulo: "Categoria ativa", tipo: "chave" },
          ]}
          inicial={{
            nome: editando?.nome ?? "", tipo: editando?.tipo ?? "despesa", icone: editando?.icone ?? "🏷️",
            cor: (editando?.cor ?? cores.primaria).toLowerCase(), ativo: editando?.ativo ?? true,
          }}
          onSalvar={async (v) => {
            const dadosCategoria = {
              nome: String(v.nome).trim(), tipo: String(v.tipo) as TipoCategoria,
              icone: String(v.icone).trim() || null, cor: String(v.cor), ativo: Boolean(v.ativo),
            };
            await (editando ? categorias.atualizar(editando.id, dadosCategoria) : categorias.criar(dadosCategoria));
          }}
        />
      )}
      {dialogo?.acao === "excluir" && (
        <Confirmacao titulo="Excluir categoria" mensagem={`Excluir a categoria "${dialogo.categoria.nome}"?`}
          onConfirmar={() => categorias.remover(dialogo.categoria.id)} onFechar={fechar} />
      )}
    </Pagina>
  );
}
