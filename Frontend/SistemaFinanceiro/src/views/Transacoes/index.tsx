import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box, Button, InputAdornment, Pagination, Popover, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { Carregando, Pagina } from "../../components/Pagina";
import { Cartao } from "../../components/Pagina.styles";
import { AcoesLinha, Filtro, Selo, Tabela } from "../../components/Controles";
import { BotaoContorno } from "../../components/Controles.styles";
import { Confirmacao, Detalhes } from "../../components/Dialogos";
import FormularioTransacao from "../../components/FormularioTransacao";
import { SeletorPeriodo } from "../../components/Periodo";
import { ChipCategoria, Tipo, Valor } from "../../components/Transacao";
import { TIPOS } from "../../components/Transacao.constants";
import { useDados } from "../../hooks/useDados";
import { categorias, contas, metodosPagamento, transacoes } from "../../services";
import type { Transacao } from "../../services/api/types";
import { cores } from "../../theme/theme";
import type { Periodo } from "../../utils/calculos";
import { limitesDoMes } from "../../utils/datas";
import { formatarData, formatarMoeda, HOJE } from "../../utils/formato";

const TITULO = "Transações";
const SUBTITULO = "Gerencie todas as suas transações financeiras";
const STATUS = { concluida: { rotulo: "Concluída", cor: cores.verde, fundo: cores.verdeSuave }, pendente: { rotulo: "Pendente", cor: cores.ambar, fundo: cores.ambarSuave } };

type Dialogo = { acao: "novo" } | { acao: "ver" | "editar" | "excluir"; transacao: Transacao } | null;

export default function Transacoes() {
  const [parametros] = useSearchParams();
  const [filtros, setFiltros] = useState({
    busca: "", conta_id: parametros.get("conta") ?? "", tipo: "", categoria_id: "", status: "", metodo_pagamento_id: "",
  });
  const [periodo, setPeriodo] = useState<Periodo>(limitesDoMes(HOJE.slice(0, 7)));
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(10);
  const [maisFiltros, setMaisFiltros] = useState<HTMLElement | null>(null);
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  const consulta = { ...filtros, data_inicio: periodo.inicio, data_fim: periodo.fim, page: pagina, limit: limite };
  const { dados, erro, recarregar } = useDados(() => Promise.all([
    transacoes.listar(consulta), contas.listarTodos(), categorias.listarTodos(), metodosPagamento.listarTodos(),
  ]), JSON.stringify(consulta));

  if (!dados) return <Carregando titulo={TITULO} subtitulo={SUBTITULO} erro={erro} repetir={recarregar} />;
  const [lista, listaContas, listaCategorias, metodos] = dados;
  const totalPaginas = Math.max(1, Math.ceil(lista.total / limite));
  // Excluir o último item da última página não pode deixar a tela vazia.
  if (pagina > totalPaginas && lista.page === pagina) setPagina(totalPaginas);

  const filtrar = (campo: keyof typeof filtros) => (valor: string) => {
    setFiltros({ ...filtros, [campo]: valor });
    setPagina(1);
  };
  const nomeConta = (id: string | null) => listaContas.find((c) => c.id === id)?.nome ?? "—";
  const contaDe = (t: Transacao) => t.tipo === "transferencia"
    ? `${nomeConta(t.conta_id)} → ${nomeConta(t.conta_destino_id)}`
    : nomeConta(t.conta_id);
  const inicio = (lista.page - 1) * lista.limit;
  const extras = Number(Boolean(filtros.status)) + Number(Boolean(filtros.metodo_pagamento_id));
  const fechar = () => setDialogo(null);

  return (
    <Pagina
      titulo={TITULO}
      subtitulo={SUBTITULO}
      acoes={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogo({ acao: "novo" })}>Nova transação</Button>}
    >
      <Cartao sx={{ p: 0, overflow: "hidden" }}>
        <Box sx={{ p: "20px 20px 21px" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar transações..."
            value={filtros.busca}
            onChange={(evento) => filtrar("busca")(evento.target.value)}
            slotProps={{
              htmlInput: { "aria-label": "Buscar transações" },
              input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 19, color: cores.textoFraco }} /></InputAdornment> },
            }}
            sx={{ "& .MuiOutlinedInput-root": { height: 42 } }}
          />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px", mt: "15px" }}>
            <Filtro rotulo="Conta" valor={filtros.conta_id} onChange={filtrar("conta_id")}
              opcoes={[{ valor: "", rotulo: "Todas as contas" }, ...listaContas.map((c) => ({ valor: c.id, rotulo: c.nome }))]} />
            <Filtro rotulo="Tipo" valor={filtros.tipo} onChange={filtrar("tipo")}
              opcoes={[{ valor: "", rotulo: "Todos os tipos" }, ...Object.entries(TIPOS).map(([valor, t]) => ({ valor, rotulo: t.rotulo }))]} />
            <Filtro rotulo="Categoria" valor={filtros.categoria_id} onChange={filtrar("categoria_id")}
              opcoes={[{ valor: "", rotulo: "Todas categorias" }, ...listaCategorias.map((c) => ({ valor: c.id, rotulo: c.nome }))]} />
            <SeletorPeriodo valor={periodo} onChange={(novo) => { setPeriodo(novo); setPagina(1); }} />
            <BotaoContorno variant="outlined" startIcon={<TuneRoundedIcon />} onClick={(e) => setMaisFiltros(e.currentTarget)} sx={{ ml: { sm: "auto" }, minHeight: 38 }}>
              Mais filtros{extras > 0 && ` (${extras})`}
            </BotaoContorno>
          </Box>
        </Box>

        <Popover open={Boolean(maisFiltros)} anchorEl={maisFiltros} onClose={() => setMaisFiltros(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
          <Box sx={{ display: "grid", gap: 1.5, p: 2, width: 240 }}>
            <Filtro rotulo="Status" valor={filtros.status} onChange={filtrar("status")}
              opcoes={[{ valor: "", rotulo: "Todos os status" }, { valor: "concluida", rotulo: "Concluída" }, { valor: "pendente", rotulo: "Pendente" }]} />
            <Filtro rotulo="Método de pagamento" valor={filtros.metodo_pagamento_id} onChange={filtrar("metodo_pagamento_id")}
              opcoes={[{ valor: "", rotulo: "Todos os métodos" }, ...metodos.map((m) => ({ valor: m.id, rotulo: m.nome }))]} />
            <Button size="small" onClick={() => { setFiltros({ busca: "", conta_id: "", tipo: "", categoria_id: "", status: "", metodo_pagamento_id: "" }); setPagina(1); setMaisFiltros(null); }}>
              Limpar filtros
            </Button>
          </Box>
        </Popover>

        <Box sx={{ borderTop: `1px solid ${cores.bordaSuave}` }}>
          <Tabela rotulo="Transações" larguraMinima={1000}>
            <TableHead><TableRow>
              <TableCell>Data</TableCell><TableCell>Descrição</TableCell><TableCell>Categoria</TableCell><TableCell>Tipo</TableCell>
              <TableCell align="right">Valor</TableCell><TableCell>Status</TableCell><TableCell>Conta</TableCell><TableCell align="center">Ações</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {lista.data.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell sx={{ color: "text.secondary" }}>{formatarData(t.data)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t.descricao}</TableCell>
                  <TableCell><ChipCategoria categoria={listaCategorias.find((c) => c.id === t.categoria_id)} /></TableCell>
                  <TableCell><Tipo tipo={t.tipo} /></TableCell>
                  <TableCell align="right"><Valor transacao={t} /></TableCell>
                  <TableCell><Selo cor={STATUS[t.status].cor} fundo={STATUS[t.status].fundo}><b>{STATUS[t.status].rotulo}</b></Selo></TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{contaDe(t)}</TableCell>
                  <TableCell align="center">
                    <AcoesLinha
                      nome={t.descricao}
                      onVer={() => setDialogo({ acao: "ver", transacao: t })}
                      onEditar={() => setDialogo({ acao: "editar", transacao: t })}
                      onExcluir={() => setDialogo({ acao: "excluir", transacao: t })}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {lista.data.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center" sx={{ color: "text.secondary", height: "120px !important" }}>Nenhuma transação encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Tabela>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, p: "15px 20px" }}>
          <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
            Mostrando {lista.total === 0 ? 0 : inicio + 1} a {inicio + lista.data.length} de {lista.total} transações
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Pagination
              count={totalPaginas}
              page={Math.min(pagina, totalPaginas)}
              onChange={(_, nova) => setPagina(nova)}
              shape="rounded"
              color="primary"
              sx={{ "& .MuiPaginationItem-root": { minWidth: 35, height: 35, borderRadius: "10px", fontSize: 14, fontWeight: 600 } }}
            />
            <Filtro rotulo="Itens por página" valor={String(limite)} onChange={(v) => { setLimite(Number(v)); setPagina(1); }}
              opcoes={[10, 25, 50].map((n) => ({ valor: String(n), rotulo: `${n} por página` }))} />
          </Box>
        </Box>
      </Cartao>

      {(dialogo?.acao === "novo" || dialogo?.acao === "editar") && (
        <FormularioTransacao
          transacao={dialogo.acao === "editar" ? dialogo.transacao : undefined}
          contas={listaContas} categorias={listaCategorias} metodos={metodos} onFechar={fechar}
        />
      )}
      {dialogo?.acao === "excluir" && (
        <Confirmacao
          titulo="Excluir transação"
          mensagem={`Excluir "${dialogo.transacao.descricao}" (${formatarMoeda(dialogo.transacao.valor)})? Essa ação não pode ser desfeita.`}
          onConfirmar={() => transacoes.remover(dialogo.transacao.id)}
          onFechar={fechar}
        />
      )}
      {dialogo?.acao === "ver" && (
        <Detalhes
          titulo={dialogo.transacao.descricao}
          onFechar={fechar}
          itens={[
            { rotulo: "Valor", valor: <Valor transacao={dialogo.transacao} /> },
            { rotulo: "Tipo", valor: TIPOS[dialogo.transacao.tipo].rotulo },
            { rotulo: "Data", valor: formatarData(dialogo.transacao.data) },
            { rotulo: "Status", valor: STATUS[dialogo.transacao.status].rotulo },
            { rotulo: "Conta", valor: contaDe(dialogo.transacao) },
            { rotulo: "Categoria", valor: listaCategorias.find((c) => c.id === dialogo.transacao.categoria_id)?.nome ?? "—" },
            { rotulo: "Método de pagamento", valor: metodos.find((m) => m.id === dialogo.transacao.metodo_pagamento_id)?.nome ?? "—" },
            { rotulo: "Observação", valor: dialogo.transacao.observacao ?? "—" },
          ]}
        />
      )}
    </Pagina>
  );
}
