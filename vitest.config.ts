import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * The app's unit tests run in Node, not a browser: what is worth testing here is
 * the contract layer (response shapes, error shapes), which has no DOM.
 */
export default defineConfig({
  resolve: {
    // Mirrors the `@/` alias from tsconfig.json.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
