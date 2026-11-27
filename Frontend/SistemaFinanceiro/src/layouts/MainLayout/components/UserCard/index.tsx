import { Avatar, IconButton, Box, Typography } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { CardContainer } from "./styles";

import { useAuth } from "../../../../auth/session";

function UserCard() {
  const { user, logout } = useAuth();
  return (
    <CardContainer>
      <Avatar sx={{ width: 36, height: 36 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ color: "#fff", fontWeight: 500 }} variant="body2">
          {user?.nome}
        </Typography>
        <Typography noWrap component="div" variant="caption" color="#94a3b8">
          {user?.email}
        </Typography>
      </Box>
      <IconButton aria-label="Sair da conta" onClick={logout} sx={{ color: "white" }}><LogoutIcon fontSize="small" /></IconButton>
    </CardContainer>
  );
}

export default UserCard;
