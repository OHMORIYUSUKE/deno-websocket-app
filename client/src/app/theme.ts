import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4285F4", // Google Blue
    },
    secondary: {
      main: "#EA4335", // Google Red
    },
    warning: {
      main: "#FBBC04", // Google Yellow
    },
    success: {
      main: "#34A853", // Google Green
    },
    info: {
      main: "#4285F4", // 同じ青を info にも適用可能
    },
    error: {
      main: "#EA4335", // 同じ赤を error にも適用可能
    },
    background: {
      default: "#ffffff", // 白背景
      paper: "#f5f5f5", // 薄いグレー
    },
    text: {
      primary: "#202124", // Google の黒
      secondary: "#5f6368", // 薄いグレーの文字色
    },
  },
});

export default theme;
