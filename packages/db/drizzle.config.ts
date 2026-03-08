import type { Config } from "drizzle-kit";

export default {
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./src/migrations",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://staged:staged_dev_password@localhost:5432/staged_dev",
  },
} satisfies Config;
