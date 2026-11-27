import { useMemo, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, InputAdornment, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tab, Tabs, TextField, Tooltip, Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import SouthEastRoundedIcon from "@mui/icons-material/SouthEastRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import { listarBens } from "../../services/bens/bens.service";
import type { Bem, CategoriaBem } from "../../services/bens/bens.types";
import { formatarData, formatarMoeda } from "../../utils/financeiro";
import Composition from "./Composition";
import { Card, Container, Summary } from "./styles";

function Variacao({ valor }: { valor: number }) {
  const Icon = valor > 0 ? NorthEastRoundedIcon : valor < 0 ? SouthEastRoundedIcon : EastRoundedIcon;
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: valor > 0 ? "#21A366" : valor < 0 ? "#E5535E" : "text.secondary", fontSize: 12 }}>
      <Icon sx={{ fontSize: 14 }} />
      {valor > 0 ? "+" : ""}{valor.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
    </Box>
  );
}

export default function BensPatrimonio() {
  const bens = useMemo(() => listarBens(), []);
  const [categoria, setCategoria] = useState<CategoriaBem | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [detalhe, setDetalhe] = useState<Bem | null>(null);
  const investimentos = bens.filter((bem) => bem.categoria === "Investimentos");
  const totalInvestimentos = investimentos.reduce((total, bem) => total + bem.valorAtual, 0);
  const totalBens = bens.filter((bem) => bem.categoria !== "Investimentos").reduce((total, bem) => total + bem.valorAtual, 0);
  const filtrados = bens.filter((bem) => (categoria === "todos" || bem.categoria === categoria)
    && bem.nome.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR").trim()));

  return (
    <Container>
      <Box component="header" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 0.5 }}>
        <Box>
          <Typography component="h1" variant="h5" sx={{ fontSize: 23, letterSpacing: "-.5px", mb: 0.5 }}>Bens / Patrimônio</Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Gerencie seus bens e ativos · Dados de demonstração</Typography>
        </Box>
        <Tooltip title="Cadastro disponível na próxima etapa">
          <span><Button disabled variant="contained" startIcon={<AddRoundedIcon />} size="small">Novo bem</Button></span>
        </Tooltip>
      </Box>

      <Summary>
        {[
          { title: "Patrimônio total", value: totalBens + totalInvestimentos, description: `${bens.length} bens e investimentos cadastrados` },
          { title: "Total de bens", value: totalBens, description: "Imóveis, veículos e outros" },
          { title: "Total de investimentos", value: totalInvestimentos, description: `${investimentos.length} aplicações cadastradas` },
        ].map((item) => (
          <Card key={item.title} sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Typography component="h2" sx={{ color: "text.secondary", fontSize: 12, fontWeight: 500, mb: 1.5 }}>{item.title}</Typography>
            <Typography sx={{ fontSize: { xs: 24, lg: 23 }, fontWeight: 700, letterSpacing: "-.5px", fontVariantNumeric: "tabular-nums" }}>{formatarMoeda(item.value)}</Typography>
            <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 1.25 }}>{item.description}</Typography>
          </Card>
        ))}
        <Composition bens={bens} />
      </Summary>

      <Card>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 2.5 }}>
          <Tabs
            value={categoria}
            onChange={(_, value: CategoriaBem | "todos") => setCategoria(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Categorias dos bens"
            sx={{ minHeight: 34, maxWidth: "100%", "& .MuiTabs-indicator": { display: "none" }, "& .MuiTabs-list": { gap: 0.75 }, "& .MuiTab-root": { minHeight: 34, minWidth: 0, px: 1.75, py: 0.75, fontSize: 12, textTransform: "none", border: "1px solid #EAECF0", borderRadius: 5, color: "text.secondary" }, "& .Mui-selected": { color: "#7057F0", borderColor: "#CFC5FF", bgcolor: "#F8F6FF" } }}
          >
            <Tab label="Todos" value="todos" />
            <Tab label="Imóveis" value="Imóveis" />
            <Tab label="Veículos" value="Veículos" />
            <Tab label="Investimentos" value="Investimentos" />
            <Tab label="Outros" value="Outros" />
          </Tabs>
          <TextField
            size="small"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar bem..."
            slotProps={{ htmlInput: { "aria-label": "Buscar bem" }, input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 17 }} /></InputAdornment> } }}
            sx={{ width: { xs: "100%", sm: 210 }, "& .MuiInputBase-root": { fontSize: 12, bgcolor: "#fff" } }}
          />
        </Box>

        <TableContainer>
          <Table size="small" aria-label="Bens e patrimônio" sx={{ minWidth: 700, "& .MuiTableCell-root": { px: 1.5, py: 2.1, borderColor: "#F2F4F7", fontSize: 13, whiteSpace: "nowrap" }, "& .MuiTableCell-head": { fontSize: 11, color: "text.secondary", fontWeight: 600 }, "& .MuiTableRow-root:last-child td": { borderBottom: 0 } }}>
            <TableHead><TableRow>
              <TableCell>Bem</TableCell><TableCell>Categoria</TableCell><TableCell align="right">Valor atual</TableCell>
              <TableCell align="center">Variação</TableCell><TableCell>Data aquisição</TableCell><TableCell align="right">Ações</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {filtrados.map((bem) => (
                <TableRow key={bem.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{bem.nome}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{bem.categoria}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>{formatarMoeda(bem.valorAtual)}</TableCell>
                  <TableCell align="center"><Variacao valor={bem.variacao} /></TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{formatarData(bem.dataAquisicao)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver detalhes"><IconButton size="small" aria-label={`Ver detalhes de ${bem.nome}`} onClick={() => setDetalhe(bem)}><VisibilityOutlinedIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>
                    <IconButton size="small" disabled aria-label={`Editar ${bem.nome}`}><EditOutlinedIcon sx={{ fontSize: 17 }} /></IconButton>
                    <IconButton size="small" disabled aria-label={`Excluir ${bem.nome}`}><DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filtrados.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: "40px !important", color: "text.secondary" }}>Nenhum bem encontrado.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 2.5, px: 1.5 }}>Mostrando {filtrados.length ? 1 : 0} a {filtrados.length} de {filtrados.length} bens</Typography>
      </Card>

      <Dialog open={Boolean(detalhe)} onClose={() => setDetalhe(null)} fullWidth maxWidth="xs">
        <DialogTitle>{detalhe?.nome}</DialogTitle>
        <DialogContent>
          {detalhe && <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
            {[
              { label: "Categoria", value: detalhe.categoria },
              { label: "Valor atual", value: formatarMoeda(detalhe.valorAtual) },
              { label: "Data de aquisição", value: formatarData(detalhe.dataAquisicao) },
            ].map((item) => <Box key={item.label}><Typography variant="caption" color="text.secondary">{item.label}</Typography><Typography variant="body2" sx={{ fontWeight: 500, mt: 0.25 }}>{item.value}</Typography></Box>)}
            <Box><Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>Variação</Typography><Variacao valor={detalhe.variacao} /></Box>
          </Box>}
        </DialogContent>
        <DialogActions><Button onClick={() => setDetalhe(null)}>Fechar</Button></DialogActions>
      </Dialog>
    </Container>
  );
}
