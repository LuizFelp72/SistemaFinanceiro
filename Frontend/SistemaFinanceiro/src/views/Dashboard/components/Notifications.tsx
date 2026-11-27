import { useState } from "react";
import { Badge, Box, IconButton, Popover, Typography } from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { useDados } from "../../../hooks/useDados";
import { listarNotificacoes } from "../../../services/extras";
import { cores } from "../../../theme/theme";

export default function Notifications() {
  const [ancora, setAncora] = useState<HTMLElement | null>(null);
  const { dados: avisos = [] } = useDados(listarNotificacoes);

  return (
    <>
      <IconButton
        aria-label={`Notificações (${avisos.length})`}
        onClick={(evento) => setAncora(evento.currentTarget)}
        sx={{ width: 38, height: 38, borderRadius: "12px", border: `1px solid ${cores.borda}` }}
      >
        <Badge variant="dot" color="error" invisible={avisos.length === 0}>
          <NotificationsNoneOutlinedIcon sx={{ fontSize: 19, color: "text.primary" }} />
        </Badge>
      </IconButton>
      <Popover open={Boolean(ancora)} anchorEl={ancora} onClose={() => setAncora(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
        <Box sx={{ p: 2, width: 300, display: "grid", gap: 1.5 }}>
          {avisos.length === 0 && <Typography sx={{ fontSize: 14 }}>Nenhuma notificação.</Typography>}
          {avisos.map((aviso) => (
            <Box key={aviso.id}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{aviso.titulo}</Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{aviso.mensagem}</Typography>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
}
