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
        theme_color: "#000000",
        background_color: "#000000",
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
      // Force the CJS build Vite can prebundle (browser export lacks ESM named/default).
      "sql.js": path.resolve(__dirname, "node_modules/sql.js/dist/sql-wasm.js"),
    },
  },
  optimizeDeps: {
    // Prebundle so CJS `module.exports = initSqlJs` gets a proper ESM default.
    include: ["sql.js"],
  },
  assetsInclude: ["**/*.wasm"],
});


