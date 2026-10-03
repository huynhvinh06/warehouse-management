import { createTheme, alpha } from "@mui/material/styles";

const PRIMARY = "#4f46e5";
const SECONDARY = "#7c3aed";

const theme = createTheme({
  palette: {
    primary: { main: PRIMARY },
    secondary: { main: SECONDARY },
    success: { main: "#16a34a" },
    warning: { main: "#f59e0b" },
    info: { main: "#0ea5e9" },
    error: { main: "#ef4444" },
    background: { default: "#f4f6fb", paper: "#ffffff" },
    text: { primary: "#1f2937", secondary: "#6b7280" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Hiệu ứng chuyển trang
        "@keyframes pageIn": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "*": { animation: "none !important", transition: "none !important" },
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        colorPrimary: {
          background: `linear-gradient(90deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "none",
          boxShadow: "2px 0 12px rgba(16, 24, 40, 0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 14 },
        elevation1: { boxShadow: "0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04)" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 14, boxShadow: "0 1px 3px rgba(16, 24, 40, 0.08)" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: "transform .15s ease, box-shadow .15s ease, background-color .15s ease",
        },
        contained: {
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: `0 6px 14px ${alpha(PRIMARY, 0.35)}`,
          },
          "&:active": { transform: "translateY(0)" },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { transition: "background-color .15s ease, transform .15s ease" },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#f8fafc",
            color: "#475569",
            fontWeight: 700,
            whiteSpace: "nowrap",
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root": { transition: "background-color .15s ease" },
          "& .MuiTableRow-root:hover": { backgroundColor: alpha(PRIMARY, 0.04) },
          "& .MuiTableRow-root:last-child .MuiTableCell-root": { borderBottom: 0 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderColor: "#eef0f4" } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontWeight: 700 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
  },
});

export default theme;
