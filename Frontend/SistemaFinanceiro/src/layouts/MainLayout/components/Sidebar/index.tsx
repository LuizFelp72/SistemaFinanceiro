import { Link, useLocation } from "react-router-dom";
import { Box, Tooltip, Typography } from "@mui/material";
import { menuItems } from "./menuItems";
import { StyledDrawer, LogoBox, LogoMarca, NavItem, NavList } from "./styles";
import UserCard from "../UserCard";

function Sidebar() {
  const { pathname } = useLocation();

  return (
    <StyledDrawer variant="permanent" anchor="left" className="nao-imprimir">
      <LogoBox>
        <LogoMarca aria-hidden>N</LogoMarca>
        <Typography className="logo-nome" sx={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
          Nuvra
        </Typography>
      </LogoBox>

      <NavList aria-label="Menu principal">
        {menuItems.map(({ label, path, icon: Icon }) => {
          const isActive = pathname === path || (path === "/" && pathname === "/dashboard");

          return (
            <Tooltip key={path} title={label} placement="right" disableHoverListener={false} enterDelay={600}>
              <NavItem
                {...{ component: Link, to: path }}
                active={isActive}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon />
                <Box component="span" className="nav-nome">{label}</Box>
              </NavItem>
            </Tooltip>
          );
        })}
      </NavList>

      <UserCard />
    </StyledDrawer>
  );
}

export default Sidebar;
