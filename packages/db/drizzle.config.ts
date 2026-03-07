import type { Config } from 'drizzle-kit'

export default {
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './src/migrations',
} satisfies Config
