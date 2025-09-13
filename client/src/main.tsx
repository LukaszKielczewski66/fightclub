import React from "react";

import ReactDOM from "react-dom/client";
import { AppProviders } from "@/app/providers";
import App from "@/app/App";
import { ThemeProviderCustom } from "@/features/theme/ThemeProviderCustom";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProviderCustom>
      <AppProviders>
        <App />
      </AppProviders>
    </ThemeProviderCustom>
  </React.StrictMode>
);
