import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

/**
 * Vite configuration for the KeeMeds commerce frontend.
 *
 * Fully self-contained: no dependency on the ERPNext/Frappe workspace layout.
 * Everything runtime-configurable (dev port, API proxy target, build output)
 * is read from VITE_* environment variables with sensible defaults, so the
 * project can be cloned and run on any machine.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  /** Backend origin the dev-server `/api` proxy forwards to. */
  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:8000";

  /** Dev server port (defaults to 5173). */
  const devPort = Number.parseInt(env.VITE_DEV_PORT || "5173", 10);

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "src"),
      },
    },

    server: {
      port: devPort,
      open: false,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          // Expose Set-Cookie headers for ERPNext session cookies
          cookieDomainRewrite: {
            "*": "",
          },
          headers: {
            // CORS compatibility for local development against ERPNext
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Frappe-CSRF-Token",
            "Access-Control-Allow-Credentials": "true",
          },
        },
      },
    },

    build: {
      outDir: "dist",
      target: "es2023",
      sourcemap: false,
    },

    envPrefix: "VITE_",
  };
});