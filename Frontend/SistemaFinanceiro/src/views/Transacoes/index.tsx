import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FinanceData from "../../components/FinanceData";
import FinanceEditor, { type EditAction } from "../../components/FinanceEditor";
import { type Ledger, presentTransactions, label } from "../../services/finance";
import {
  CORES_CATEGORIA,
  capitalizar,
  formatarData,
  formatarMoeda,
} from "../../utils/financeiro";

const CORES = {
  primaria: "#6C5CE7",
  primariaHover: "#5A4BD4",
  verde: "#21A366",
  vermelho: "#E5535E",
  laranja: "#F2994A",
  texto: "#667085",
  borda: "#EAECF0",
};

const estiloCabecalho = {
  fontWeight: 600,
  color: CORES.texto,
  fontSize: 13,
  borderBottom: `1px solid ${CORES.borda}`,
};

const estiloCelula = {
  fontSize: 14,
  borderBottom: `1px solid ${CORES.borda}`,
};

function Transacoes() {
  return <FinanceData resources="transactions accounts categories payment-methods">{(db,reload) => <Lista db={db} reload={reload} />}</FinanceData>;
}
function Lista({db,reload}: {db:Ledger;reload():void}) {
  const transacoes = useMemo(() => presentTransactions(db), [db]);
  const [action,setAction] = useState<EditAction|null>(null);

  const [detalhe, setDetalhe] = useState<(typeof transacoes)[number] | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroConta, setFiltroConta] = useState("todas");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const categorias = useMemo(
    () => Array.from(new Set(transacoes.map((t) => t.categoria))),
    [transacoes]
  );
  const contas = useMemo(
    () => Array.from(new Set(transacoes.map((t) => t.conta))),
    [transacoes]
  );

  const filtradas = useMemo(() => {
    return transacoes.filter((t) => {
      const combinaBusca = t.descricao
        .toLowerCase()
        .includes(busca.toLowerCase());
      const combinaConta = filtroConta === "todas" || t.conta === filtroConta;
      const combinaTipo = filtroTipo === "todos" || t.tipo === filtroTipo;
      const combinaCategoria =
        filtroCategoria === "todas" || t.categoria === filtroCategoria;
      return (!de || t.data >= de) && (!ate || t.data <= ate) && combinaBusca && combinaConta && combinaTipo && combinaCategoria;
    });
  }, [transacoes, busca, filtroConta, filtroTipo, filtroCategoria, de, ate]);

  const pagina = Math.min(page, Math.max(0, Math.ceil(filtradas.length / rowsPerPage) - 1));
  const inicio = pagina * rowsPerPage;
  const linhas = filtradas.slice(inicio, inicio + rowsPerPage);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Cabeçalho da página */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
            Transações
          </Typography>
          <Typography sx={{ color: CORES.texto, fontSize: 14 }}>
            Gerencie todas as suas transações financeiras
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setAction({mode:"create"})}
          startIcon={<AddIcon />}
          sx={{
            bgcolor: CORES.primaria,
            "&:hover": { bgcolor: CORES.primariaHover },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Nova transação
        </Button>
      </Box>

      {/* Cartão com busca, filtros e tabela */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: `1px solid ${CORES.borda}`, p: 2 }}
      >
        <TextField
          size="small"
          fullWidth
          label="Buscar transações"
          value={busca}
          onChange={(evento) => {
            setBusca(evento.target.value);
            setPage(0);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: CORES.texto }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />

        {/* Filtros */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <TextField
            select
            size="small"
            label="Conta"
            value={filtroConta}
            onChange={(evento) => {
              setFiltroConta(evento.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="todas">Todas as contas</MenuItem>
            {contas.map((conta) => (
              <MenuItem key={conta} value={conta}>
                {conta}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Tipo"
            value={filtroTipo}
            onChange={(evento) => {
              setFiltroTipo(evento.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="todos">Todos os tipos</MenuItem>
            <MenuItem value="receita">Receita</MenuItem>
            <MenuItem value="despesa">Despesa</MenuItem>
            <MenuItem value="transferencia">Transferência</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Categoria"
            value={filtroCategoria}
            onChange={(evento) => {
              setFiltroCategoria(evento.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="todas">Todas categorias</MenuItem>
            {categorias.map((categoria) => (
              <MenuItem key={categoria} value={categoria}>
                {categoria}
              </MenuItem>
            ))}
          </TextField>

          <TextField size="small" label="De" type="date" value={de}
            onChange={e => { setDe(e.target.value); setPage(0); }}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: ate || undefined } }} />
          <TextField size="small" label="Até" type="date" value={ate}
            error={!!de && !!ate && ate < de} helperText={de && ate && ate < de ? "O fim deve ser igual ou posterior ao início." : undefined}
            onChange={e => { setAte(e.target.value); setPage(0); }}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: de || undefined } }} />
          <Button
            disabled={!busca && !de && !ate && filtroConta === "todas" && filtroTipo === "todos" && filtroCategoria === "todas"}
            onClick={() => { setBusca(""); setDe(""); setAte(""); setFiltroConta("todas"); setFiltroCategoria("todas"); setFiltroTipo("todos"); setPage(0); }}
            variant="outlined"
            aria-label="Limpar filtros"
            startIcon={<FilterListOutlinedIcon />}
            sx={{
              textTransform: "none",
              borderColor: CORES.borda,
              color: CORES.texto,
            }}
          >
            Limpar filtros
          </Button>
        </Box>

        {/* Tabela */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={estiloCabecalho}>Data</TableCell>
                <TableCell sx={estiloCabecalho}>Descrição</TableCell>
                <TableCell sx={estiloCabecalho}>Categoria</TableCell>
                <TableCell sx={estiloCabecalho}>Tipo</TableCell>
                <TableCell sx={estiloCabecalho} align="right">
                  Valor
                </TableCell>
                <TableCell sx={estiloCabecalho}>Status</TableCell>
                <TableCell sx={estiloCabecalho}>Conta</TableCell>
                <TableCell sx={estiloCabecalho} align="right">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {linhas.map((t) => {
                const corCategoria =
                  CORES_CATEGORIA[t.categoria] ?? CORES_CATEGORIA.Outros;
                return (
                  <TableRow key={t.id} hover>
                    <TableCell sx={estiloCelula}>{formatarData(t.data)}</TableCell>
                    <TableCell sx={estiloCelula}>{t.descricao}</TableCell>
                    <TableCell sx={estiloCelula}>
                      <Chip
                        size="small"
                        label={t.categoria}
                        sx={{
                          backgroundColor: corCategoria.bg,
                          color: corCategoria.cor,
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={estiloCelula}>
                      <Chip
                        size="small"
                        label={label(t.tipo)}
                        sx={{
                          backgroundColor:
                            t.tipo === "receita" ? "#E6F7EF" : "#FDEBEC",
                          color:
                            t.tipo === "receita" ? CORES.verde : CORES.vermelho,
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={estiloCelula}>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: 14,
                          fontWeight: 600,
                          color:
                            t.tipo === "receita" ? CORES.verde : CORES.vermelho,
                        }}
                      >
                        {t.tipo === "despesa" ? "-" : ""}
                        {formatarMoeda(t.valor,t.moeda)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={estiloCelula}>
                      <Chip
                        size="small"
                        label={capitalizar(t.status)}
                        sx={{
                          backgroundColor:
                            t.status === "concluída" ? "#E6F7EF" : "#FEF3E2",
                          color:
                            t.status === "concluída"
                              ? CORES.verde
                              : CORES.laranja,
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ ...estiloCelula, color: CORES.texto }}>
                      {t.conta}
                    </TableCell>
                    <TableCell align="right" sx={estiloCelula}>
                      <IconButton size="small" aria-label={`Ver detalhes de ${t.descricao}`} onClick={() => setDetalhe(t)}>
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setAction({mode:"edit",row:db.transactions.find(r => r.id === t.id)})} aria-label={`Editar ${t.descricao}`}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setAction({mode:"delete",row:db.transactions.find(r => r.id === t.id)})} aria-label={`Excluir ${t.descricao}`}>
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}

              {linhas.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 4, color: CORES.texto }}
                  >
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Rodapé */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ color: CORES.texto, fontSize: 13, pl: 1 }}>
            Mostrando {filtradas.length === 0 ? 0 : inicio + 1} a{" "}
            {inicio + linhas.length} de {filtradas.length} transações
          </Typography>
          <TablePagination
            component="div"
            count={filtradas.length}
            page={pagina}
            onPageChange={(_, novaPage) => setPage(novaPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(evento) => {
              setRowsPerPage(parseInt(evento.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Por página"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} de ${count}`
            }
          />
        </Box>
      </Paper>
      {action && <FinanceEditor resource="transactions" db={db} action={action} close={() => setAction(null)} saved={() => { setAction(null); reload(); }} />}
      <Dialog open={!!detalhe} onClose={() => setDetalhe(null)} aria-labelledby="transacao-detalhe">
        <DialogTitle id="transacao-detalhe">{detalhe?.descricao}</DialogTitle>
        {detalhe && <DialogContent><Typography>{label(detalhe.tipo)} · {formatarMoeda(detalhe.valor,detalhe.moeda)}</Typography><Typography>{formatarData(detalhe.data)} · {detalhe.conta}{detalhe.destino && " → " + detalhe.destino}</Typography><Typography>{detalhe.categoria} · {capitalizar(detalhe.status)}</Typography></DialogContent>}
        <DialogActions><Button onClick={() => setDetalhe(null)}>Fechar</Button></DialogActions>
      </Dialog>
    </Box>
  );
}

export default Transacoes;
