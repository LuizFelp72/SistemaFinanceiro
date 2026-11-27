import { Box, Button, Typography } from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { AcoesLinha, Selo } from "../../components/Controles";
import { BotaoContorno } from "../../components/Controles.styles";
import { Cartao } from "../../components/Pagina.styles";
import type { Conta } from "../../services/api/types";
import { cores } from "../../theme/theme";
import { centavos, formatarMoeda } from "../../utils/formato";
import { TIPOS_CONTA } from "./constants";

const AVATARES = [cores.roxo, cores.ambar, cores.azul, cores.verde, cores.vermelho];

interface Props {
  conta: Conta;
  indice: number;
  onEditar: () => void;
  onExcluir: () => void;
  onExtrato: () => void;
  onTransferir: () => void;
}

export default function AccountCard({ conta, indice, onEditar, onExcluir, onExtrato, onTransferir }: Props) {
  const apagado = conta.ativo ? 1 : 0.55;
  const iniciais = (conta.instituicao || conta.nome).charAt(0).toUpperCase();

  return (
    <Cartao sx={{ p: "18px", bgcolor: conta.ativo ? cores.branco : cores.fundoTabela }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: "12px", display: "grid", placeItems: "center", bgcolor: AVATARES[indice % AVATARES.length], color: cores.branco, fontWeight: 700, opacity: conta.ativo ? 1 : 0.65 }}>
          {iniciais}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, opacity: apagado }}>
          <Typography noWrap component="h2" sx={{ fontSize: 16, fontWeight: 600 }}>{conta.nome}</Typography>
          <Typography noWrap sx={{ fontSize: 14, color: "text.secondary" }}>{conta.instituicao ?? "—"}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: "-6px", mr: "-4px" }}>
          {!conta.ativo && <Selo cor={cores.textoFraco} fundo={cores.bordaSuave}>Inativa</Selo>}
          <AcoesLinha nome={conta.nome} onEditar={onEditar} onExcluir={onExcluir} />
        </Box>
      </Box>

      <Box sx={{ opacity: apagado, mt: 2, pb: "14px", borderBottom: `1px solid ${cores.bordaSuave}` }}>
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>{TIPOS_CONTA[conta.tipo]}</Typography>
        <Typography sx={{ fontSize: 23, fontWeight: 600, color: centavos(conta.saldo_atual) < 0 ? cores.vermelho : "text.primary" }}>
          {formatarMoeda(conta.saldo_atual)}
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", mt: "14px", opacity: apagado }}>
        <Button variant="outlined" size="small" disabled={!conta.ativo} onClick={onExtrato} startIcon={<FileDownloadOutlinedIcon />}>Extrato</Button>
        <BotaoContorno variant="outlined" size="small" disabled={!conta.ativo} onClick={onTransferir} startIcon={<FileUploadOutlinedIcon />}>Transferir</BotaoContorno>
      </Box>
    </Cartao>
  );
}
