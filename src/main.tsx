import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app";
import { AppProvider } from "@/providers";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import "@/index.css";

// Suppress the React 19 internal "Cannot read properties of undefined (reading 'startTime')"
// TypeError originating from the browser's Performance API instrumentation. This is a known
// React 19 + browser compatibility issue in development mode and does not affect production.
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    const msg = event?.error?.message ?? event?.message ?? "";
    if (typeof msg === "string" && msg.includes("startTime")) {
      event.preventDefault();
      return false;
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </AppErrorBoundary>
  </StrictMode>,
);
