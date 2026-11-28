import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import type { Transacao } from "../../../services/transacoes/transacoes.types";
import {
  CORES_CATEGORIA,
  capitalizar,
  formatarData,
  formatarMoeda,
} from "../../../utils/financeiro";
import { CardHeading, DashboardCard } from "../styles";

export default function RecentTransactions({
  transacoes,
  currency = "BRL",
}: {
  transacoes: Transacao[];
  currency?: string;
}) {
  const recentes = [...transacoes]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5);

  return (
    <DashboardCard>
      <CardHeading>
        <Typography component="h2">Últimas transações</Typography>
        <Button
          component={Link}
          to="/transacoes"
          size="small"
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: "14px !important" }} />}
          sx={{ fontSize: 12, py: 0.5, px: 1 }}
        >
          Ver todas
        </Button>
      </CardHeading>
      <TableContainer>
        <Table
          size="small"
          aria-label="Últimas transações do período"
          sx={{
            minWidth: 620,
            "& .MuiTableCell-root": {
              borderColor: "#F2F4F7",
              fontSize: 12,
              px: 1,
              py: 1.4,
              whiteSpace: "nowrap",
            },
            "& .MuiTableCell-head": {
              fontSize: 11,
              fontWeight: 600,
              color: "text.secondary",
            },
            "& .MuiTableRow-root:last-child td": { borderBottom: 0 },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell>Conta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentes.map((transacao) => {
              const categoria = CORES_CATEGORIA[transacao.categoria]
                ?? CORES_CATEGORIA.Outros;
              const receita = transacao.tipo === "receita";

              return (
                <TableRow key={transacao.id} hover>
                  <TableCell>{formatarData(transacao.data)}</TableCell>
                  <TableCell>
                    {transacao.descricao}
                    {transacao.status === "pendente" && (
                      <Chip
                        label="Pendente"
                        size="small"
                        sx={{ ml: 1, height: 19, fontSize: 10, bgcolor: "#FEF3E2", color: "#B76E16" }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transacao.categoria}
                      size="small"
                      sx={{
                        height: 21,
                        fontSize: 10,
                        borderRadius: 1,
                        bgcolor: categoria.bg,
                        color: categoria.cor,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        color: receita ? "#21A366" : "#E5535E",
                        bgcolor: receita ? "#E6F7EF" : "#FDEBEC",
                        px: 0.75,
                        py: 0.35,
                        borderRadius: 0.5,
                        fontSize: 10,
                        fontWeight: 500,
                      }}
                    >
                      {capitalizar(transacao.tipo)}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ color: receita ? "#21A366" : "#E5535E", fontWeight: 500 }}>
                    {receita ? "" : "− "}{formatarMoeda(transacao.valor, currency)}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {transacao.conta}
                  </TableCell>
                </TableRow>
              );
            })}
            {recentes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: "40px !important", color: "text.secondary" }}>
                  Nenhuma transação no período selecionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardCard>
  );
}
