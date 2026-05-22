import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: "src",
  base: "/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-v2-[hash][extname]",
        chunkFileNames: "assets/[name]-v2-[hash].js",
        entryFileNames: "assets/[name]-v2-[hash].js",
      },
      input: {
        main: resolve(__dirname, "src/index.html"),
        about: resolve(__dirname, "src/about.html"),
        gallery: resolve(__dirname, "src/gallery.html"),
        "order-confirmation": resolve(__dirname, "src/order-confirmation.html"),
      },
    },
  },
});
