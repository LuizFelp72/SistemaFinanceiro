import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Divider, Snackbar } from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "../../auth/context";
import { Carregando, Pagina } from "../../components/Pagina";
import { Cartao } from "../../components/Pagina.styles";
import { useDados } from "../../hooks/useDados";
import { perfil, preferencias } from "../../services/extras";
import { cores } from "../../theme/theme";
import { Aparencia, Moeda, Notificacoes, Seguranca } from "./Preferences";
import Profile from "./Profile";

const TITULO = "Configurações";
const SUBTITULO = "Gerencie suas preferências e conta";

const SECOES = [
  { id: "perfil", rotulo: "Perfil", Icone: PersonOutlineRoundedIcon },
  { id: "seguranca", rotulo: "Segurança", Icone: ShieldOutlinedIcon },
  { id: "notificacoes", rotulo: "Notificações", Icone: NotificationsNoneOutlinedIcon },
  { id: "aparencia", rotulo: "Aparência", Icone: PaletteOutlinedIcon },
  { id: "moeda", rotulo: "Moeda e Região", Icone: LanguageOutlinedIcon },
] as const;

const itemMenu = { justifyContent: "flex-start", minHeight: 45, px: "16px", gap: "6px", fontSize: 15 };

export default function Configuracoes() {
  const [secao, setSecao] = useState<(typeof SECOES)[number]["id"]>("perfil");
  const [aviso, setAviso] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { dados, erro, recarregar } = useDados(() => Promise.all([perfil.buscar(), preferencias.buscar()]));

  if (!dados) return <Carregando titulo={TITULO} subtitulo={SUBTITULO} erro={erro} repetir={recarregar} />;
  const [usuario, opcoes] = dados;
  const salvo = (mensagem = "Alterações salvas.") => setAviso(mensagem);

  return (
    <Pagina titulo={TITULO} subtitulo={SUBTITULO}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "218px minmax(0, 1fr)" }, gap: "27px", alignItems: "start" }}>
        <Cartao sx={{ p: "10px !important" }}>
          <Box component="nav" aria-label="Seções das configurações" sx={{ display: "grid" }}>
            {SECOES.map(({ id, rotulo, Icone }) => (
              <Button key={id} variant={secao === id ? "contained" : "text"} aria-current={secao === id ? "page" : undefined}
                onClick={() => setSecao(id)} startIcon={<Icone />}
                sx={{ ...itemMenu, color: secao === id ? cores.branco : cores.textoSecundario }}>
                {rotulo}
              </Button>
            ))}
            <Divider sx={{ my: 1.25 }} />
            <Button color="error" startIcon={<LogoutRoundedIcon />} sx={itemMenu} onClick={() => { logout(); navigate("/login"); }}>
              Sair da conta
            </Button>
          </Box>
        </Cartao>

        <Box sx={{ display: "grid", gap: "22px", minWidth: 0 }}>
          {secao === "perfil" && <Profile usuario={usuario} onSalvo={salvo} />}
          {secao === "seguranca" && <Seguranca onSalvo={salvo} />}
          {secao === "notificacoes" && <Notificacoes opcoes={opcoes} onSalvo={salvo} />}
          {secao === "aparencia" && <Aparencia />}
          {secao === "moeda" && <Moeda opcoes={opcoes} onSalvo={salvo} />}
        </Box>
      </Box>

      <Snackbar open={Boolean(aviso)} autoHideDuration={3000} onClose={() => setAviso("")}>
        <Alert severity="success" variant="filled" onClose={() => setAviso("")}>{aviso}</Alert>
      </Snackbar>
    </Pagina>
  );
}
