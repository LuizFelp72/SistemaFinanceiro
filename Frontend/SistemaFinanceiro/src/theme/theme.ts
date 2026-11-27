import { createTheme } from "@mui/material/styles";

/** Cores tiradas dos wireframes. As views não devem declarar cores soltas. */
export const cores = {
  primaria: "#4F6EF7",
  primariaEscura: "#3F5BE0",
  primariaSuave: "#EEF2FF",
  verde: "#22C55E",
  verdeSuave: "#EEFDF3",
  vermelho: "#EF4444",
  vermelhoSuave: "#FEF0F0",
  ambar: "#F59E0B",
  ambarSuave: "#FFF8E8",
  roxo: "#8B5CF6",
  roxoSuave: "#F7F0FF",
  azul: "#3B82F6",
  azulEscuro: "#1E40AF",
  indigo: "#6366F1",
  rosa: "#EC4899",
  laranja: "#F97316",
  esmeralda: "#10B981",
  cinza: "#94A3B8",
  texto: "#0F172A",
  textoSecundario: "#667085",
  textoFraco: "#98A2B3",
  fundo: "#F3F4F8",
  fundoTabela: "#F9FAFB",
  borda: "#E5E7EB",
  bordaSuave: "#F2F4F7",
  menu: "#171827",
  menuTexto: "#8E91AC",
  branco: "#FFFFFF",
} as const;

export const FONTE = '"Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif';

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: cores.primaria, dark: cores.primariaEscura, contrastText: cores.branco },
    secondary: { main: cores.rosa },
    success: { main: cores.verde },
    error: { main: cores.vermelho },
    warning: { main: cores.ambar },
    background: { default: cores.fundo, paper: cores.branco },
    text: { primary: cores.texto, secondary: cores.textoSecundario },
    divider: cores.bordaSuave,
  },
  typography: {
    fontFamily: FONTE,
    fontSize: 14,
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, minHeight: 40, padding: "7px 18px", fontSize: 15 },
        sizeSmall: { minHeight: 34, padding: "4px 12px", fontSize: 14 },
        sizeLarge: { minHeight: 46 },
      },
      variants: [{ props: { variant: "outlined", color: "primary" }, style: { borderColor: cores.primaria } }],
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { rounded: { borderRadius: 16 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontSize: 15,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: cores.borda },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: cores.primaria },
        },
      },
    },
    MuiMenu: { styleOverrides: { paper: { boxShadow: "0 8px 24px rgba(15, 23, 42, .12)" } } },
    MuiPopover: { styleOverrides: { paper: { boxShadow: "0 8px 24px rgba(15, 23, 42, .12)" } } },
    MuiMenuItem: { styleOverrides: { root: { fontSize: 14 } } },
    MuiDialog: { styleOverrides: { paper: { boxShadow: "0 20px 48px rgba(15, 23, 42, .18)" } } },
    MuiDialogTitle: { styleOverrides: { root: { fontSize: 18, fontWeight: 600 } } },
    MuiTableCell: { styleOverrides: { root: { fontSize: 15, borderColor: cores.bordaSuave } } },
  },
});

export default theme;
