import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  // peers — provided by the host app / design-sync runtime
  external: ["react", "react-dom", "react/jsx-runtime", "lucide-react", "recharts"],
  banner: { js: '"use client";' }
});
