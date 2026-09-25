import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(import.meta.dirname, "../.."),
  test: {
    include: ["tests/resume-schema/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/.git/**"],
  },
});