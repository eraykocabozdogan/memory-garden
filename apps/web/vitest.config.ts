import { defineConfig } from "vitest/config";

// Unit tests run without the Vite app plugins; browser tests live in e2e/ and use Playwright.
export default defineConfig({
  test: {
    include: ["worker/**/*.test.ts", "app/**/*.test.{ts,tsx}"],
  },
});
