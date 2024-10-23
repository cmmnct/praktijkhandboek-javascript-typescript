import { defineConfig } from "vite";
import { resolve } from "path";
export default defineConfig({
root: resolve(__dirname, "src"),
build: {
outDir: resolve(__dirname, "dist"),
rollupOptions: {
input: {
main: resolve(__dirname, "src/index.html"),
},
},
},
base: "./",
server: {
open: true,
},
assetsInclude: ["**/*.webp", "**/*.jpg", "**/*.png"],
});