import { useLocation, useNavigate } from "react-router-dom";
import { List, ListItemIcon, ListItemText, Typography } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { menuItems } from "./menuItems";
import { StyledDrawer, LogoBox, NavItem, NavList } from "./styles";
import UserCard from "../UserCard";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <StyledDrawer variant="permanent" anchor="left">
      <LogoBox>
        <AccountBalanceIcon sx={{ color: "primary.main", fontSize: 28 }} />
        <Typography sx={{ fontWeight: "bold", color: "#fff" }} variant="h6">
          Nuvra
        </Typography>
      </LogoBox>

      <NavList>
        <List disablePadding>
          {menuItems.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;

            return (
              <NavItem
                key={path}
                active={isActive}
                onClick={() => navigate(path)}
              >
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={label} />
              </NavItem>
            );
          })}
        </List>
      </NavList>

      <UserCard />
    </StyledDrawer>
  );
}

export default Sidebar;
