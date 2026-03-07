# MCP Server Catalog

Curated registry of recommended MCP servers for use with Claude Code and Claude Desktop. Each entry includes tier classification, package/repository info, configuration example, and usage notes.

**Tier Legend:**
- **Tier 1 (Official)** -- Maintained by the service vendor or the MCP core team
- **Tier 2 (Community Maintained)** -- Active community, 1K+ stars, regular releases
- **Tier 3 (Experimental)** -- Useful but less maintained; verify last-commit date before adopting

---

## Database Servers

### PostgreSQL

- **Package:** `@modelcontextprotocol/server-postgres`
- **Tier:** 1 (Official)
- **Description:** Query PostgreSQL databases, inspect schemas, and run read/write SQL.

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:password@localhost:5432/dbname"
      }
    }
  }
}
```

**Notes:** Use a read-only database user for exploration. Switch to a write-capable user only when mutations are needed.

---

### MongoDB

- **Package:** `mongodb-mcp-server`
- **Tier:** 1 (Official -- MongoDB Inc.)
- **Description:** MongoDB Atlas and local instance access. Query collections, inspect schemas, manage indexes.

```json
{
  "mcpServers": {
    "mongodb": {
      "command": "npx",
      "args": ["-y", "mongodb-mcp-server"],
      "env": {
        "MONGODB_URI": "mongodb+srv://user:password@cluster.mongodb.net/dbname"
      }
    }
  }
}
```

**Notes:** Supports both Atlas and local MongoDB. Set `MONGODB_READ_ONLY=true` for safe exploration.

---

### Redis

- **Package:** `mcp-redis`
- **Tier:** 1 (Official -- Redis Ltd.)
- **Description:** Interact with Redis instances. Read/write keys, inspect data structures.

```json
{
  "mcpServers": {
    "redis": {
      "command": "npx",
      "args": ["-y", "mcp-redis"],
      "env": {
        "REDIS_URL": "redis://localhost:6379"
      }
    }
  }
}
```

**Notes:** Supports Redis Stack features (JSON, Search, TimeSeries) when available on the server.

---

### MySQL

- **Package:** `mysql-mcp-server`
- **Tier:** 2 (Community Maintained)
- **Description:** Connect to MySQL/MariaDB databases. Run queries, inspect table schemas.

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["-y", "mysql-mcp-server"],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "root",
        "MYSQL_PASSWORD": "password",
        "MYSQL_DATABASE": "dbname"
      }
    }
  }
}
```

**Notes:** Use a read-only MySQL user for exploration. Community maintained -- check for recent releases.

---

### Multi-DB (40+ databases)

- **Package:** `mcp-database-server`
- **Tier:** 2 (Community Maintained)
- **Description:** Universal database connector supporting 40+ databases through a common interface. Useful for polyglot database environments.

```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["-y", "mcp-database-server"],
      "env": {
        "DATABASE_URL": "your-connection-string"
      }
    }
  }
}
```

**Notes:** Good fallback when a dedicated MCP server does not exist for your database. Supports PostgreSQL, MySQL, SQLite, MSSQL, Oracle, and many more via JDBC/ODBC.

---

## Version Control & Development

### GitHub

- **Package:** `@modelcontextprotocol/server-github`
- **Tier:** 1 (Official)
- **Description:** Interact with GitHub repos, issues, PRs, actions, and more. 14K+ stars.

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}
```

**Notes:** Recommended for any project hosted on GitHub. Token needs `repo` scope minimum. For org repos, add `read:org`.

---

### Git

- **Package:** `git-mcp`
- **Tier:** 2 (Community Maintained)
- **Description:** Direct Git operations -- clone, diff, log, blame, branch management without the GitHub API layer.

```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["-y", "git-mcp"]
    }
  }
}
```

**Notes:** Useful for non-GitHub Git hosting (GitLab, Bitbucket, self-hosted). No authentication required for local repos.

---

## Design & UI

### Figma

- **Package:** `figma-developer-mcp` (official Figma MCP)
- **Tier:** 1 (Official -- Figma)
- **Description:** Read Figma files, extract design tokens, component properties, and layout information for code generation.

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp"],
      "env": {
        "FIGMA_API_KEY": "<your-figma-personal-access-token>"
      }
    }
  }
}
```

**Notes:** Generate a Personal Access Token in Figma Settings. Read-only access to files you have permission to view.

---

### Storybook

- **Package:** `storybook-mcp`
- **Tier:** 2 (Community Maintained)
- **Description:** Access Storybook component documentation and stories. Useful for design-system-driven development.

```json
{
  "mcpServers": {
    "storybook": {
      "command": "npx",
      "args": ["-y", "storybook-mcp"],
      "env": {
        "STORYBOOK_URL": "http://localhost:6006"
      }
    }
  }
}
```

**Notes:** Requires a running Storybook instance. Point `STORYBOOK_URL` to your local or deployed Storybook.

---

## Testing & Automation

### Playwright

- **Package:** `playwright-mcp`
- **Tier:** 1 (Official -- Microsoft)
- **Description:** Browser automation for testing. Navigate pages, interact with elements, capture screenshots, run accessibility audits.

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "playwright-mcp"]
    }
  }
}
```

**Notes:** Requires Playwright browsers installed (`npx playwright install`). Supports Chromium, Firefox, and WebKit.

---

## DevOps & Infrastructure

### Kubernetes

- **Package:** `mcp-server-kubernetes`
- **Tier:** 2 (Community Maintained)
- **Description:** Interact with Kubernetes clusters. List pods, read logs, describe resources, apply manifests.

```json
{
  "mcpServers": {
    "kubernetes": {
      "command": "npx",
      "args": ["-y", "mcp-server-kubernetes"]
    }
  }
}
```

**Notes:** Uses your local `~/.kube/config` by default. Set `KUBECONFIG` env var to point to a specific config. Start with read-only operations.

---

### Terraform

- **Package:** `terraform-mcp-server`
- **Tier:** 1 (Official -- HashiCorp)
- **Description:** Terraform plan, apply, state inspection, and module documentation lookup.

```json
{
  "mcpServers": {
    "terraform": {
      "command": "npx",
      "args": ["-y", "terraform-mcp-server"]
    }
  }
}
```

**Notes:** Requires Terraform CLI installed locally. Operates on the Terraform project in the current working directory.

---

### AWS

- **Package:** `aws-mcp-server`
- **Tier:** 2 (Community Maintained)
- **Description:** Interact with AWS services. S3, Lambda, EC2, CloudFormation, and more.

```json
{
  "mcpServers": {
    "aws": {
      "command": "npx",
      "args": ["-y", "aws-mcp-server"],
      "env": {
        "AWS_ACCESS_KEY_ID": "<your-access-key>",
        "AWS_SECRET_ACCESS_KEY": "<your-secret-key>",
        "AWS_REGION": "us-east-1"
      }
    }
  }
}
```

**Notes:** Prefer IAM roles or SSO over long-lived access keys. Use a minimal-permission IAM policy for safety.

---

### Cloudflare

- **Package:** `mcp-server-cloudflare`
- **Tier:** 2 (Community Maintained)
- **Description:** Manage Cloudflare Workers, KV, R2, D1, and DNS records.

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "npx",
      "args": ["-y", "mcp-server-cloudflare"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "<your-api-token>"
      }
    }
  }
}
```

**Notes:** Use a scoped API token with minimum required permissions rather than a global API key.

---

## Project Management

### Linear

- **Package:** `linear-mcp`
- **Tier:** 1 (Official -- Linear)
- **Description:** Create and manage Linear issues, projects, and cycles.

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "linear-mcp"],
      "env": {
        "LINEAR_API_KEY": "<your-linear-api-key>"
      }
    }
  }
}
```

**Notes:** Generate an API key in Linear Settings > API. Supports issue creation, status updates, and project queries.

---

### Notion

- **Package:** `notion-mcp`
- **Tier:** 1 (Official -- Notion)
- **Description:** Read and write Notion pages, databases, and blocks.

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "notion-mcp"],
      "env": {
        "NOTION_API_KEY": "<your-notion-integration-token>"
      }
    }
  }
}
```

**Notes:** Create an internal integration at notion.so/my-integrations. Share specific pages/databases with the integration.

---

### Atlassian / Jira

- **Package:** `atlassian-mcp`
- **Tier:** 2 (Community Maintained)
- **Description:** Interact with Jira issues, Confluence pages, and Atlassian Cloud APIs.

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "atlassian-mcp"],
      "env": {
        "ATLASSIAN_HOST": "your-domain.atlassian.net",
        "ATLASSIAN_EMAIL": "your-email@example.com",
        "ATLASSIAN_API_TOKEN": "<your-api-token>"
      }
    }
  }
}
```

**Notes:** Generate an API token at id.atlassian.com/manage-profile/security/api-tokens.

---

## BaaS & Platform

### Supabase

- **Package:** `supabase-mcp`
- **Tier:** 2 (Community Maintained, 2.4K+ stars)
- **Description:** Interact with Supabase projects. Database queries, auth management, storage, and edge functions.

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "supabase-mcp"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "<your-service-role-key>"
      }
    }
  }
}
```

**Notes:** Use the service role key for full access or the anon key for restricted access. Never expose the service role key in client-side code.

---

## Utility

### Filesystem

- **Package:** `@modelcontextprotocol/server-filesystem`
- **Tier:** 1 (Official)
- **Description:** Read, write, and manage files and directories. Sandboxed to specified paths.

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"]
    }
  }
}
```

**Notes:** The final argument restricts access to that directory tree. Multiple paths can be specified.

---

### Fetch

- **Package:** `@modelcontextprotocol/server-fetch`
- **Tier:** 1 (Official)
- **Description:** Make HTTP requests and retrieve web content. Converts HTML to markdown for consumption.

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

**Notes:** Useful for reading documentation, APIs, and web pages without a browser. Respects robots.txt by default.

---

### Memory

- **Package:** `@modelcontextprotocol/server-memory`
- **Tier:** 1 (Official)
- **Description:** Persistent key-value memory across sessions. Store and retrieve facts, preferences, and context.

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

**Notes:** Data persists in a local file. Useful for maintaining context across conversation sessions.

---

### Sequential Thinking

- **Package:** `@modelcontextprotocol/server-sequential-thinking`
- **Tier:** 1 (Official)
- **Description:** Structured step-by-step reasoning. Helps break down complex problems into sequential analysis steps.

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

**Notes:** Particularly effective for multi-step planning, debugging, and architectural decisions.

---

## Discovery Resources

When you need an MCP server not listed above, check these directories:

| Resource | URL | Notes |
|---|---|---|
| Official MCP Registry | registry.modelcontextprotocol.io | Canonical source, verified servers |
| Awesome MCP Servers | github.com/punkpeye/awesome-mcp-servers | 80K+ stars, community-curated |
| MCP.so | mcp.so | 3000+ servers, searchable catalog |
| Smithery | smithery.ai | 2200+ servers, one-click install configs |

---

## Quick Reference: Tech Stack to MCP Mapping

| Tech | MCP Server | Tier |
|---|---|---|
| PostgreSQL | @modelcontextprotocol/server-postgres | 1 |
| MongoDB | mongodb-mcp-server | 1 |
| Redis | mcp-redis | 1 |
| MySQL | mysql-mcp-server | 2 |
| Multi-DB | mcp-database-server | 2 |
| GitHub | @modelcontextprotocol/server-github | 1 |
| Git (non-GitHub) | git-mcp | 2 |
| Figma | figma-developer-mcp | 1 |
| Storybook | storybook-mcp | 2 |
| Playwright | playwright-mcp | 1 |
| Kubernetes | mcp-server-kubernetes | 2 |
| Terraform | terraform-mcp-server | 1 |
| AWS | aws-mcp-server | 2 |
| Cloudflare | mcp-server-cloudflare | 2 |
| Linear | linear-mcp | 1 |
| Notion | notion-mcp | 1 |
| Jira/Confluence | atlassian-mcp | 2 |
| Supabase | supabase-mcp | 2 |
| Filesystem | @modelcontextprotocol/server-filesystem | 1 |
| HTTP/Fetch | @modelcontextprotocol/server-fetch | 1 |
| Memory | @modelcontextprotocol/server-memory | 1 |
| Reasoning | @modelcontextprotocol/server-sequential-thinking | 1 |
