import React from "react";

import ReactDOM from "react-dom/client";
import { AppProviders } from "@/app/providers";
import App from "@/app/App";
import { ThemeProviderCustom } from "@/features/theme/ThemeProviderCustom";
import { Provider } from "react-redux";
import { store } from "@/store/store";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProviderCustom>
      <Provider store={store}>
        <AppProviders>
          <App />
        </AppProviders>
      </Provider>
    </ThemeProviderCustom>
  </React.StrictMode>
);
