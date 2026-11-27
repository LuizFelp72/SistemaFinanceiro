import { useState } from "react";
import { Box, Button, Popover, TextField } from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { BotaoContorno } from "./Controles.styles";
import type { Periodo } from "../utils/calculos";
import { formatarData } from "../utils/formato";

export function SeletorPeriodo({ valor, onChange, seta = false }: {
  valor: Periodo; onChange: (periodo: Periodo) => void; seta?: boolean;
}) {
  const [ancora, setAncora] = useState<HTMLElement | null>(null);
  const [rascunho, setRascunho] = useState(valor);
  const invalido = !rascunho.inicio || !rascunho.fim || rascunho.inicio > rascunho.fim;

  return (
    <>
      <BotaoContorno
        variant="outlined"
        sx={{ minHeight: 38 }}
        startIcon={<CalendarTodayOutlinedIcon sx={{ fontSize: "15px !important" }} />}
        endIcon={seta ? <KeyboardArrowDownRoundedIcon /> : undefined}
        onClick={(evento) => { setRascunho(valor); setAncora(evento.currentTarget); }}
      >
        {formatarData(valor.inicio)} – {formatarData(valor.fim)}
      </BotaoContorno>
      <Popover open={Boolean(ancora)} anchorEl={ancora} onClose={() => setAncora(null)} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Box sx={{ display: "grid", gap: 2, p: 2, width: 240 }}>
          {(["inicio", "fim"] as const).map((campo) => (
            <TextField
              key={campo}
              type="date"
              size="small"
              label={campo === "inicio" ? "De" : "Até"}
              value={rascunho[campo]}
              error={invalido}
              onChange={(evento) => setRascunho({ ...rascunho, [campo]: evento.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          ))}
          <Button variant="contained" size="small" disabled={invalido} onClick={() => { onChange(rascunho); setAncora(null); }}>
            Aplicar
          </Button>
        </Box>
      </Popover>
    </>
  );
}
