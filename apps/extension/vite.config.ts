import path from "node:path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "popup.html"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
  resolve: {
    alias: {
      "@funds/core/csv": path.resolve(
        __dirname,
        "../../packages/core/src/csv.ts",
      ),
      "@funds/core/excel": path.resolve(
        __dirname,
        "../../packages/core/src/excel.ts",
      ),
      "@funds/core/types": path.resolve(
        __dirname,
        "../../packages/core/src/types.ts",
      ),
      "@funds/banks": path.resolve(
        __dirname,
        "../../packages/banks/src/index.ts",
      ),
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: "manifest.json", dest: "." },
        { src: "icons/*", dest: "icons" },
      ],
    }),
  ],
});
