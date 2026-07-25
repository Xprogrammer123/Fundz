import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Funds",
        short_name: "Funds",
        description:
          "Local-first bank statement analyzer. Your data never leaves this device.",
        theme_color: "#0f1f1a",
        background_color: "#0f1f1a",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,wasm,woff2}"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@funds/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
      "@funds/banks": path.resolve(
        __dirname,
        "../../packages/banks/src/index.ts",
      ),
    },
  },
  optimizeDeps: {
    exclude: ["sql.js"],
  },
  assetsInclude: ["**/*.wasm"],
});
