import { Link } from "react-router-dom";
import { Avatar, Box, Typography } from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { useDados } from "../../../../hooks/useDados";
import { perfil } from "../../../../services/extras";
import { nomeCurto } from "../../../../utils/usuario";
import { CardContainer } from "./styles";

function UserCard() {
  const { dados: usuario } = useDados(perfil.buscar);
  const nome = usuario ? nomeCurto(usuario.nome) : "";

  return (
    <CardContainer {...{ component: Link, to: "/configuracoes" }} aria-label={`Perfil de ${nome}`}>
      <Avatar src={usuario?.foto ?? undefined} sx={{ width: 35, height: 35, bgcolor: "primary.main", fontSize: 15, fontWeight: 600 }}>
        {nome.charAt(0)}
      </Avatar>
      <Box className="usuario-texto" sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ color: "#fff", fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{nome}</Typography>
        <Typography sx={{ fontSize: 12, lineHeight: 1.3 }}>Perfil</Typography>
      </Box>
      <ChevronRightRoundedIcon className="usuario-seta" sx={{ fontSize: 18 }} />
    </CardContainer>
  );
}

export default UserCard;
