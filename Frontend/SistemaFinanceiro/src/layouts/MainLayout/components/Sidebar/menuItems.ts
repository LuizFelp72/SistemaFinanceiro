import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { type SvgIconComponent } from "@mui/icons-material";

export interface MenuItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
}

export const menuItems: MenuItem[] = [
  { label: "Dashboard", path: "/", icon: DashboardOutlinedIcon },
  { label: "Transações", path: "/transacoes", icon: SwapHorizOutlinedIcon },
  {
    label: "Bens / Patrimônio",
    path: "/bens-patrimonio",
    icon: AccountBalanceWalletOutlinedIcon,
  },
  { label: "Contas", path: "/contas", icon: CreditCardOutlinedIcon },
  { label: "Orçamentos", path: "/orcamentos", icon: CalendarTodayOutlinedIcon },
  { label: "Relatórios", path: "/relatorios", icon: AssessmentOutlinedIcon },
  { label: "Metas", path: "/metas", icon: FlagOutlinedIcon },
  { label: "Categorias", path: "/categorias", icon: LocalOfferOutlinedIcon },
  {
    label: "Configurações",
    path: "/configuracoes",
    icon: SettingsOutlinedIcon,
  },
];
