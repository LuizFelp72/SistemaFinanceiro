import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366f1",
      light: "#818cf8",
      dark: "#4f46e5",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ec4899",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
    success: {
      main: "#22c55e",
    },
    error: {
      main: "#ef4444",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiTooltip: {
      defaultProps: { arrow: true, enterDelay: 350 },
      styleOverrides: { tooltip: { borderRadius: 8, padding: "7px 10px", fontSize: 12 } },
    },
    MuiIconButton: {
      styleOverrides: { root: {
        transition: "background-color 160ms ease, color 160ms ease",
        "&:focus-visible": { outline: "2px solid #6366f1", outlineOffset: 2 },
      } },
    },
    MuiTableRow: {
      styleOverrides: { root: { transition: "background-color 160ms ease" } },
    },
    MuiDialog: {
      styleOverrides: { paper: { boxShadow: "0 16px 48px rgba(15,23,42,0.18)" } },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 6 }, bar: { borderRadius: 6 } },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 20px",
          transition: "background-color 160ms ease, box-shadow 160ms ease, transform 120ms ease",
          "&:active:not(.Mui-disabled)": { transform: "scale(0.98)" },
          "@media (hover: hover)": {
            "&:hover:not(.Mui-disabled)": { transform: "translateY(-1px)" },
          },
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
            "&:active:not(.Mui-disabled), &:hover:not(.Mui-disabled)": { transform: "none" },
          },
          boxShadow: "none",
        },
        contained: {
          "&:hover": {
            boxShadow: "none",
          },
        },
        sizeLarge: {
          padding: "12px 24px",
          fontSize: "1rem",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: "#f8fafc",
            "& fieldset": {
              borderColor: "#e2e8f0",
            },
            "&:hover fieldset": {
              borderColor: "#cbd5e1",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#6366f1",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#6366f1",
          fontWeight: 500,
          textDecorationColor: "#6366f1",
        },
      },
    },
  },
});

export default theme;
