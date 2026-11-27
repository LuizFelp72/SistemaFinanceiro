import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { type SvgIconComponent } from "@mui/icons-material";

export interface MenuItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
}

export const menuItems: MenuItem[] = [
  { label: "Dashboard", path: "/", icon: GridViewOutlinedIcon },
  { label: "Transações", path: "/transacoes", icon: SwapHorizOutlinedIcon },
  { label: "Bens / Patrimônio", path: "/bens-patrimonio", icon: AccountBalanceOutlinedIcon },
  { label: "Contas", path: "/contas", icon: AccountBalanceWalletOutlinedIcon },
  { label: "Orçamentos", path: "/orcamentos", icon: BarChartOutlinedIcon },
  { label: "Relatórios", path: "/relatorios", icon: DescriptionOutlinedIcon },
  { label: "Metas", path: "/metas", icon: TrackChangesOutlinedIcon },
  { label: "Categorias", path: "/categorias", icon: LocalOfferOutlinedIcon },
  { label: "Configurações", path: "/configuracoes", icon: SettingsOutlinedIcon },
];
