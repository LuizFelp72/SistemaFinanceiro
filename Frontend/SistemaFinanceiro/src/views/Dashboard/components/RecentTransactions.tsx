import { Link } from "react-router-dom";
import { Box, Button, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Tabela } from "../../../components/Controles";
import { Cartao, TituloCartao } from "../../../components/Pagina.styles";
import { ChipCategoria, Tipo, Valor } from "../../../components/Transacao";
import type { Categoria, Conta, Transacao } from "../../../services/api/types";
import { cores } from "../../../theme/theme";
import { formatarData } from "../../../utils/formato";

export default function RecentTransactions({ transacoes, contas, categorias }: {
  transacoes: Transacao[]; contas: Conta[]; categorias: Categoria[];
}) {
  return (
    <Cartao>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <TituloCartao>Últimas transações</TituloCartao>
        <Button component={Link} to="/transacoes" size="small" sx={{ fontSize: 14, minHeight: 24, p: "0 4px" }}>Ver todos</Button>
      </Box>
      <Box sx={{ "& th, & td": { px: "0 !important", pr: "16px !important", fontSize: 14 }, "& th": { height: "38px !important", bgcolor: `${cores.branco} !important` }, "& td": { height: "37px !important" }, "& tr:last-of-type td": { borderBottom: 0 } }}>
        <Tabela rotulo="Últimas transações do período" larguraMinima={640}>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell><TableCell>Descrição</TableCell><TableCell>Categoria</TableCell>
              <TableCell>Tipo</TableCell><TableCell align="right">Valor</TableCell><TableCell>Conta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transacoes.slice(0, 5).map((transacao) => (
              <TableRow key={transacao.id}>
                <TableCell sx={{ color: "text.secondary" }}>{formatarData(transacao.data)}</TableCell>
                <TableCell>{transacao.descricao}{transacao.status === "pendente" && " (pendente)"}</TableCell>
                <TableCell><ChipCategoria categoria={categorias.find((c) => c.id === transacao.categoria_id)} /></TableCell>
                <TableCell><Tipo tipo={transacao.tipo} /></TableCell>
                <TableCell align="right"><Valor transacao={transacao} /></TableCell>
                <TableCell sx={{ color: "text.secondary" }}>{contas.find((c) => c.id === transacao.conta_id)?.nome}</TableCell>
              </TableRow>
            ))}
            {transacoes.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ color: "text.secondary" }}>Nenhuma transação no período.</TableCell></TableRow>
            )}
          </TableBody>
        </Tabela>
      </Box>
    </Cartao>
  );
}
