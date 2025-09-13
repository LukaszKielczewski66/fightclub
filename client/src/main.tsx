import React from "react";

import ReactDOM from "react-dom/client";
import { AppProviders } from "@/app/providers";
import App from "@/app/App";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";


const theme = createTheme({
  palette: { mode: "light" }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProviders>
        <App />
      </AppProviders>
    </ThemeProvider>
  </React.StrictMode>
);
