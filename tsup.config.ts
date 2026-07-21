import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/core/index.ts"],
  format: ["cjs", "esm", "iife"], // Build for commonJS, ESmodules, and browser IIFE
  globalName: "QRISUtility", // Global variable name in the browser
  dts: true, // Generate declaration files (.d.ts)
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: "dist-core",
  minify: true,
});
