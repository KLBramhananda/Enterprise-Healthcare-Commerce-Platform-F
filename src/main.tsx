import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app";
import { AppProvider } from "@/providers";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
