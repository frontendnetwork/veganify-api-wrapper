import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["lib/index.ts"],
  format: ["esm", "cjs"],
  // fetch-based wrapper: Node, Bun, browsers, edge
  platform: "neutral",
  dts: true,
  publint: true,
  attw: true,
});
