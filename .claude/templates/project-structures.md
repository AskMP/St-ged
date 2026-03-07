# Project Structure Templates

Reference directory structures for common frameworks. The `/scaffold` command uses these to generate initial project layouts.

---

## Next.js (App Router + TypeScript)

```
project-root/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── api/
│   │   │   └── health/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── hooks/
│   ├── types/
│   └── styles/
├── public/
├── prisma/
│   └── schema.prisma
├── .storybook/
├── tests/
│   ├── e2e/
│   └── integration/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── package.json
└── CLAUDE.md
```

---

## Vite + React + TypeScript

```
project-root/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   │   └── api.ts
│   ├── store/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── tests/
│   ├── e2e/
│   └── integration/
├── .storybook/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md
```

---

## Python + FastAPI

```
project-root/
├── src/
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       ├── models/
│       │   ├── __init__.py
│       │   └── user.py
│       ├── schemas/
│       │   ├── __init__.py
│       │   └── user.py
│       ├── routes/
│       │   ├── __init__.py
│       │   ├── health.py
│       │   └── users.py
│       ├── services/
│       │   └── __init__.py
│       ├── db/
│       │   ├── __init__.py
│       │   ├── session.py
│       │   └── migrations/
│       │       └── versions/
│       └── middleware/
│           └── __init__.py
├── tests/
│   ├── conftest.py
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── alembic.ini
├── pyproject.toml
├── ruff.toml
└── CLAUDE.md
```

---

## Go + Gin/Echo/Chi

```
project-root/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   │   └── config.go
│   ├── handlers/
│   │   ├── health.go
│   │   └── users.go
│   ├── middleware/
│   │   └── auth.go
│   ├── models/
│   │   └── user.go
│   ├── repository/
│   │   └── user.go
│   ├── services/
│   │   └── user.go
│   └── database/
│       ├── db.go
│       └── migrations/
├── pkg/
│   └── utils/
├── tests/
│   ├── integration/
│   └── e2e/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── go.mod
├── go.sum
├── Makefile
└── CLAUDE.md
```

---

## Monorepo (Turborepo)

```
project-root/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── api/                    # Express/Fastify backend
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── config/                 # Shared configs (ESLint, TS, Tailwind)
│   │   └── package.json
│   ├── types/                  # Shared TypeScript types
│   │   ├── src/
│   │   └── package.json
│   └── db/                     # Shared database client
│       ├── prisma/
│       ├── src/
│       └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
└── CLAUDE.md
```

---

## Common Configuration Files

### Docker

**Node.js multi-stage Dockerfile:**

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

FROM base AS deps
RUN corepack enable && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser
COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appgroup /app/public ./public
USER appuser
EXPOSE 3000
CMD ["node", "server.js"]
```

**Python multi-stage Dockerfile:**

```dockerfile
FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

FROM base AS deps
COPY pyproject.toml ./
RUN pip install --no-cache-dir .

FROM base AS runner
COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
COPY src/ ./src/
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml

```yaml
services:
  app:
    build: .
    ports:
      - "${PORT:-3000}:3000"
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-app}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  redisdata:
```

### GitHub Actions CI

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: corepack enable && pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Test
        run: pnpm test -- --coverage

      - name: Build
        run: pnpm build
```

### .env.example

```shell
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Auth
AUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000

# Redis
REDIS_URL=redis://localhost:6379

# App
NODE_ENV=development
PORT=3000
```

---

## Conventions

These templates follow a consistent set of principles regardless of language or framework.

### `src/` directory for all source code

All application source lives under `src/` (or `internal/` in Go, following its convention). This separates authored code from configuration files, build artifacts, and tooling at the project root. It also makes it straightforward to configure linters, bundlers, and test runners to target a single subtree.

### Co-located unit tests, separate integration/e2e

Unit tests live next to the code they exercise -- `user.test.ts` alongside `user.ts`, or `user_test.go` alongside `user.go`. This keeps the feedback loop tight: when you change a file you immediately see its tests. Integration and end-to-end tests live in a top-level `tests/` directory because they span multiple modules and have different runner configurations, fixtures, and lifecycle requirements.

### Separation of concerns

Every template splits code into the same conceptual layers:

- **Routes / Handlers** -- HTTP interface. Parses requests, calls services, returns responses.
- **Services / Business logic** -- Core rules. Framework-agnostic, testable in isolation.
- **Models / Data** -- Database entities, ORM definitions, repository methods.
- **Types / Schemas** -- Shared type definitions, validation schemas, API contracts.

This layering keeps dependencies flowing inward (handlers depend on services, services depend on models) and prevents circular imports.

### `.env.example` committed, `.env` gitignored

`.env.example` documents every environment variable the application needs, with safe placeholder values. It is committed to the repository so new contributors can copy it to `.env` and fill in real values. The actual `.env` file is listed in `.gitignore` to prevent secrets from entering version control.

### Docker for reproducible environments

Every template includes a `Dockerfile` and `docker-compose.yml`. The Dockerfile uses multi-stage builds to keep production images small. The Compose file wires up the application with its backing services (Postgres, Redis) so a single `docker compose up` gives any developer a running system without installing database servers locally.

### CI/CD from day one

A GitHub Actions workflow is included from the start. It runs lint, type-check, test, and build on every push and pull request. Setting this up before the first feature lands means the pipeline never has to be retrofitted, and every contributor gets automated feedback from their first commit.
