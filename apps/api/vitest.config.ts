import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Allow service files that import @staged/db to resolve during tests
      // without requiring the package to be built first. Points directly at the
      // TypeScript source so Vitest can load it via ts-node transform.
      "@staged/db": path.resolve(__dirname, "../../packages/db/src/index.ts"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 10000,
    // Run test files sequentially to avoid DB state conflicts between suites
    // (auth tests truncate users/households which conflicts with parallel suites).
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
    env: {
      DATABASE_URL:
        "postgresql://staged:staged_dev_password@localhost:5432/staged_dev",
      // 32-character secret for zod validation
      NEXTAUTH_SECRET: "abcdefghijklmnopqrstuvwxyzABCDEF",
      NEXTAUTH_URL: "http://localhost:3000",
    },
  },
});
