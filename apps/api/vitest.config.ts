import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 10000,
    env: {
      DATABASE_URL: 'postgresql://staged:staged_dev_password@localhost:5432/staged_dev',
      // 32-character secret for zod validation
      NEXTAUTH_SECRET: 'abcdefghijklmnopqrstuvwxyzABCDEF',
      NEXTAUTH_URL: 'http://localhost:3000',
    },
  },
})
