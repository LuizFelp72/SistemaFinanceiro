import { Avatar, Box, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { CardContainer } from "./styles";

function UserCard() {
  return (
    <CardContainer>
      <Avatar sx={{ width: 36, height: 36 }} />
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ color: "#fff", fontWeight: 500 }} variant="body2">
          Usuário
        </Typography>
        <Typography variant="caption" color="#94a3b8">
          Ver perfil
        </Typography>
      </Box>
      <ChevronRightIcon fontSize="small" sx={{ color: "#94a3b8" }} />
    </CardContainer>
  );
}

export default UserCard;
