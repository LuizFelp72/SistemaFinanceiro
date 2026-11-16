import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { listarBens } from "../../services/bens/bens.service";
import type { Bem, TipoBem } from "../../services/bens/bens.types";

const CORES = {
  primaria: "#6C5CE7",
  primariaHover: "#5A4BD4",
  verde: "#21A366",
  vermelho: "#E5535E",
  laranja: "#F2994A",
  texto: "#667085",
  borda: "#EAECF0",
};

const TIPOS_BEM: TipoBem[] = [
  "Imóvel",
  "Veículo",
  "Investimento",
  "Eletrônico",
  "Outros",
];

const CORES_TIPO: Record<string, { bg: string; cor: string }> = {
  Imóvel: { bg: "#E8F1FE", cor: "#2F80ED" },
  Veículo: { bg: "#FEF3E2", cor: "#F2994A" },
  Investimento: { bg: "#E6F7EF", cor: "#21A366" },
  Eletrônico: { bg: "#F0E9FD", cor: "#8B5CF6" },
  Outros: { bg: "#F1F2F4", cor: "#667085" },
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

const formatarMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatarData = (data: string) => {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
};

interface FormularioBem {
  nome: string;
  tipo: TipoBem;
  valor_aquisicao: string;
  valor_atual: string;
  data_aquisicao: string;
  descricao: string;
}

const formInicial: FormularioBem = {
  nome: "",
  tipo: "Imóvel",
  valor_aquisicao: "",
  valor_atual: "",
  data_aquisicao: new Date().toISOString().slice(0, 10),
  descricao: "",
};

function BensPatrimonio() {
  const [bens, setBens] = useState<Bem[]>(() => listarBens());

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para modais de criar/editar e visualizar
  const [modalAberto, setModalAberto] = useState(false);
  const [bemEditandoId, setBemEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormularioBem>(formInicial);
  const [erroForm, setErroForm] = useState("");
  const [bemVisualizando, setBemVisualizando] = useState<Bem | null>(null);

  const filtrados = useMemo(() => {
    return bens.filter((b) => {
      const termo = busca.toLowerCase();
      const combinaBusca =
        b.nome.toLowerCase().includes(termo) ||
        b.descricao.toLowerCase().includes(termo);
      const combinaTipo = filtroTipo === "todos" || b.tipo === filtroTipo;
      return combinaBusca && combinaTipo;
    });
  }, [bens, busca, filtroTipo]);

  const resumo = useMemo(() => {
    const totalAquisicao = filtrados.reduce(
      (acc, b) => acc + b.valor_aquisicao,
      0
    );
    const totalAtual = filtrados.reduce((acc, b) => acc + b.valor_atual, 0);
    const variacao = totalAtual - totalAquisicao;
    const percentual =
      totalAquisicao > 0 ? (variacao / totalAquisicao) * 100 : 0;

    return {
      totalAquisicao,
      totalAtual,
      variacao,
      percentual,
      quantidade: filtrados.length,
    };
  }, [filtrados]);

  const inicio = page * rowsPerPage;
  const linhas = filtrados.slice(inicio, inicio + rowsPerPage);

  const abrirModalNovo = () => {
    setBemEditandoId(null);
    setForm(formInicial);
    setErroForm("");
    setModalAberto(true);
  };

  const abrirModalEditar = (bem: Bem) => {
    setBemEditandoId(bem.id);
    setForm({
      nome: bem.nome,
      tipo: bem.tipo,
      valor_aquisicao: String(bem.valor_aquisicao),
      valor_atual: String(bem.valor_atual),
      data_aquisicao: bem.data_aquisicao,
      descricao: bem.descricao,
    });
    setErroForm("");
    setModalAberto(true);
  };

  const salvarBem = () => {
    const nomeLimpo = form.nome.trim();
    const valorAquisicaoNum = Number(form.valor_aquisicao);
    const valorAtualNum = Number(form.valor_atual);

    if (!nomeLimpo) {
      setErroForm("Informe o nome do bem.");
      return;
    }
    if (
      !form.valor_aquisicao ||
      Number.isNaN(valorAquisicaoNum) ||
      valorAquisicaoNum < 0
    ) {
      setErroForm("Informe um valor de aquisição válido.");
      return;
    }
    if (
      !form.valor_atual ||
      Number.isNaN(valorAtualNum) ||
      valorAtualNum < 0
    ) {
      setErroForm("Informe um valor atual válido.");
      return;
    }
    if (!form.data_aquisicao) {
      setErroForm("Informe a data de aquisição.");
      return;
    }

    if (bemEditandoId) {
      setBens((atuais) =>
        atuais.map((item) =>
          item.id === bemEditandoId
            ? {
                ...item,
                nome: nomeLimpo,
                tipo: form.tipo,
                valor_aquisicao: valorAquisicaoNum,
                valor_atual: valorAtualNum,
                data_aquisicao: form.data_aquisicao,
                descricao: form.descricao.trim(),
              }
            : item
        )
      );
    } else {
      const novoBem: Bem = {
        id: String(Date.now()),
        nome: nomeLimpo,
        tipo: form.tipo,
        valor_aquisicao: valorAquisicaoNum,
        valor_atual: valorAtualNum,
        data_aquisicao: form.data_aquisicao,
        descricao: form.descricao.trim(),
      };
      setBens((atuais) => [novoBem, ...atuais]);
    }

    setModalAberto(false);
  };

  const excluirBem = (id: string) => {
    setBens((atuais) => atuais.filter((item) => item.id !== id));
  };

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
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Bens / Patrimônio
          </Typography>
          <Typography sx={{ color: CORES.texto, fontSize: 14 }}>
            Acompanhe seus bens, valores de aquisição e evolução patrimonial
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirModalNovo}
          sx={{
            bgcolor: CORES.primaria,
            "&:hover": { bgcolor: CORES.primariaHover },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Novo bem
        </Button>
      </Box>

      {/* Cards de Resumo Patrimonial */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{ borderRadius: 3, border: `1px solid ${CORES.borda}`, p: 2.5 }}
        >
          <Typography sx={{ color: CORES.texto, fontSize: 13, mb: 0.5 }}>
            Patrimônio Atual
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 22 }}>
            {formatarMoeda(resumo.totalAtual)}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{ borderRadius: 3, border: `1px solid ${CORES.borda}`, p: 2.5 }}
        >
          <Typography sx={{ color: CORES.texto, fontSize: 13, mb: 0.5 }}>
            Valor de Aquisição
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 22 }}>
            {formatarMoeda(resumo.totalAquisicao)}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{ borderRadius: 3, border: `1px solid ${CORES.borda}`, p: 2.5 }}
        >
          <Typography sx={{ color: CORES.texto, fontSize: 13, mb: 0.5 }}>
            Valorização Acumulada
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 22,
                color: resumo.variacao >= 0 ? CORES.verde : CORES.vermelho,
              }}
            >
              {resumo.variacao >= 0 ? "+" : ""}
              {formatarMoeda(resumo.variacao)}
            </Typography>
            <Chip
              size="small"
              label={`${resumo.variacao >= 0 ? "+" : ""}${resumo.percentual.toFixed(1)}%`}
              sx={{
                backgroundColor:
                  resumo.variacao >= 0 ? "#E6F7EF" : "#FDEBEC",
                color: resumo.variacao >= 0 ? CORES.verde : CORES.vermelho,
                fontWeight: 600,
                fontSize: 12,
              }}
            />
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{ borderRadius: 3, border: `1px solid ${CORES.borda}`, p: 2.5 }}
        >
          <Typography sx={{ color: CORES.texto, fontSize: 13, mb: 0.5 }}>
            Total de Bens
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 22 }}>
            {resumo.quantidade} {resumo.quantidade === 1 ? "item" : "itens"}
          </Typography>
        </Paper>
      </Box>

      {/* Cartão com busca, filtros e tabela */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: `1px solid ${CORES.borda}`, p: 2 }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <TextField
            size="small"
            placeholder="Buscar bens por nome ou descrição..."
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
            sx={{ flex: 1, minWidth: 240 }}
          />

          <TextField
            select
            size="small"
            value={filtroTipo}
            onChange={(evento) => {
              setFiltroTipo(evento.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="todos">Todos os tipos</MenuItem>
            {TIPOS_BEM.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>
                {tipo}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Tabela */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={estiloCabecalho}>Aquisição</TableCell>
                <TableCell sx={estiloCabecalho}>Bem</TableCell>
                <TableCell sx={estiloCabecalho}>Tipo</TableCell>
                <TableCell sx={estiloCabecalho} align="right">
                  Valor de Aquisição
                </TableCell>
                <TableCell sx={estiloCabecalho} align="right">
                  Valor Atual
                </TableCell>
                <TableCell sx={estiloCabecalho} align="right">
                  Variação
                </TableCell>
                <TableCell sx={estiloCabecalho} align="right">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {linhas.map((bem) => {
                const corTipo = CORES_TIPO[bem.tipo] ?? CORES_TIPO.Outros;
                const diferenca = bem.valor_atual - bem.valor_aquisicao;
                const percentual =
                  bem.valor_aquisicao > 0
                    ? (diferenca / bem.valor_aquisicao) * 100
                    : 0;
                const valorizou = diferenca >= 0;

                return (
                  <TableRow key={bem.id} hover>
                    <TableCell sx={estiloCelula}>
                      {formatarData(bem.data_aquisicao)}
                    </TableCell>
                    <TableCell sx={estiloCelula}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                        {bem.nome}
                      </Typography>
                      {bem.descricao && (
                        <Typography sx={{ fontSize: 12, color: CORES.texto }}>
                          {bem.descricao}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={estiloCelula}>
                      <Chip
                        size="small"
                        label={bem.tipo}
                        sx={{
                          backgroundColor: corTipo.bg,
                          color: corTipo.cor,
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ ...estiloCelula, color: CORES.texto }}
                    >
                      {formatarMoeda(bem.valor_aquisicao)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ ...estiloCelula, fontWeight: 600 }}
                    >
                      {formatarMoeda(bem.valor_atual)}
                    </TableCell>
                    <TableCell align="right" sx={estiloCelula}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: valorizou ? CORES.verde : CORES.vermelho,
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {valorizou ? (
                          <TrendingUpIcon fontSize="small" />
                        ) : (
                          <TrendingDownIcon fontSize="small" />
                        )}
                        <span>
                          {valorizou ? "+" : ""}
                          {percentual.toFixed(1)}%
                        </span>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={estiloCelula}>
                      <IconButton
                        size="small"
                        onClick={() => setBemVisualizando(bem)}
                        title="Visualizar detalhes"
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => abrirModalEditar(bem)}
                        title="Editar bem"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => excluirBem(bem.id)}
                        title="Excluir bem"
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}

              {linhas.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ py: 4, color: CORES.texto }}
                  >
                    Nenhum bem encontrado.
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
            Mostrando {filtrados.length === 0 ? 0 : inicio + 1} a{" "}
            {inicio + linhas.length} de {filtrados.length} bens
          </Typography>
          <TablePagination
            component="div"
            count={filtrados.length}
            page={page}
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

      {/* Modal de Criar / Editar Bem */}
      <Dialog
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {bemEditandoId ? "Editar bem" : "Novo bem"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {erroForm && (
              <Typography sx={{ color: CORES.vermelho, fontSize: 13 }}>
                {erroForm}
              </Typography>
            )}

            <TextField
              label="Nome do bem"
              size="small"
              fullWidth
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                select
                label="Tipo"
                size="small"
                fullWidth
                value={form.tipo}
                onChange={(e) =>
                  setForm({ ...form, tipo: e.target.value as TipoBem })
                }
              >
                {TIPOS_BEM.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Data de aquisição"
                type="date"
                size="small"
                fullWidth
                value={form.data_aquisicao}
                onChange={(e) =>
                  setForm({ ...form, data_aquisicao: e.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Valor de aquisição (R$)"
                type="number"
                size="small"
                fullWidth
                value={form.valor_aquisicao}
                onChange={(e) =>
                  setForm({ ...form, valor_aquisicao: e.target.value })
                }
              />

              <TextField
                label="Valor atual (R$)"
                type="number"
                size="small"
                fullWidth
                value={form.valor_atual}
                onChange={(e) =>
                  setForm({ ...form, valor_atual: e.target.value })
                }
              />
            </Box>

            <TextField
              label="Descrição / Observações"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setModalAberto(false)}
            sx={{ color: CORES.texto, textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={salvarBem}
            sx={{
              bgcolor: CORES.primaria,
              "&:hover": { bgcolor: CORES.primariaHover },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Visualizar Detalhes */}
      <Dialog
        open={Boolean(bemVisualizando)}
        onClose={() => setBemVisualizando(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Detalhes do bem</DialogTitle>
        <DialogContent dividers>
          {bemVisualizando && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: 12, color: CORES.texto }}>
                  Nome
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {bemVisualizando.nome}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: CORES.texto }}>
                  Tipo
                </Typography>
                <Typography>{bemVisualizando.tipo}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: CORES.texto }}>
                  Data de Aquisição
                </Typography>
                <Typography>
                  {formatarData(bemVisualizando.data_aquisicao)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: CORES.texto }}>
                  Valor de Aquisição
                </Typography>
                <Typography>
                  {formatarMoeda(bemVisualizando.valor_aquisicao)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: CORES.texto }}>
                  Valor Atual
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {formatarMoeda(bemVisualizando.valor_atual)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: CORES.texto }}>
                  Descrição
                </Typography>
                <Typography>
                  {bemVisualizando.descricao || "Sem descrição informada."}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button
            onClick={() => setBemVisualizando(null)}
            sx={{ color: CORES.primaria, textTransform: "none", fontWeight: 600 }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BensPatrimonio;
