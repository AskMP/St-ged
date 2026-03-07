---
name: "mcp-catalog"
description: "Curated MCP server registry with auto-suggest based on project tech choices"
auto_invoke: true
triggers: ["project scaffolding", "MCP server selection", "adding external tool integration", "database MCP needed", "design tool MCP needed"]
---

# MCP Catalog

## Instructions

### 1. Auto-Suggest Logic

When the project's tech stack is known (from CLAUDE.md or scaffold Q&A), suggest relevant MCP servers:

| Tech Choice | Suggested MCP Server(s) |
|---|---|
| Any project (universal) | context7 — live documentation for any library/framework |
| PostgreSQL | @modelcontextprotocol/server-postgres |
| MongoDB | mongodb-mcp-server |
| Redis | mcp-redis |
| MySQL | mysql-mcp-server |
| GitHub (any project) | @modelcontextprotocol/server-github |
| Figma design files | Figma MCP (official) |
| Playwright testing | playwright-mcp |
| Kubernetes deployment | mcp-server-kubernetes |
| Terraform IaC | terraform-mcp-server |
| Supabase BaaS | supabase-mcp |
| Linear PM | linear-mcp |

When multiple technologies are detected, suggest all matching servers and let the user confirm which to include. Always recommend context7 (live documentation) and @modelcontextprotocol/server-github for any project using Git/GitHub.

### 2. Configuration Generation

For each suggested MCP server, generate the `settings.json` entry. Use one of three common patterns depending on the server:

**NPX-based (most common):**

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": { "ENV_VAR": "value" }
    }
  }
}
```

**Docker-based (isolated, production):**

```json
{
  "mcpServers": {
    "server-name": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "image-name"],
      "env": { "ENV_VAR": "value" }
    }
  }
}
```

**Python-based:**

```json
{
  "mcpServers": {
    "server-name": {
      "command": "python",
      "args": ["-m", "module-name"],
      "env": { "ENV_VAR": "value" }
    }
  }
}
```

When generating config for multiple servers, merge them into a single `mcpServers` block so the user can paste once.

### 3. Installation Guidance

Follow these rules when recommending MCP server configuration:

- Always use environment variables for sensitive data (tokens, passwords, connection strings)
- Prefer npx for development environments, Docker for production isolation
- Remind the user to restart Claude Desktop or Claude Code after config changes
- Recommend testing with read-only modes first when the server supports it
- Validate JSON syntax before saving -- a trailing comma or missing brace breaks the entire config
- Reference the full catalog template at `templates/mcp-catalog.md` for detailed server entries

### 4. Server Tiers

Categorize servers by maturity so the user can make informed choices:

- **Tier 1 (Official)**: Maintained by the service vendor or the MCP core team. Examples: GitHub, MongoDB, Redis, Figma, Playwright, Terraform, Filesystem, Fetch, Memory, Context7.
- **Tier 2 (Community Maintained)**: Active open-source community with 1K+ GitHub stars, regular releases.
- **Tier 3 (Experimental)**: Useful but less maintained; may lag behind API changes or have sparse docs.

Always note the tier when suggesting a server. For Tier 3 servers, add a caveat about checking last-commit date and open issues before adopting.

## Examples

### Example: Node.js + PostgreSQL + GitHub Project

User is scaffolding a Node.js API backed by PostgreSQL and hosted on GitHub.

Suggested servers:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>" }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost:5432/dbname" }
    }
  }
}
```

All are Tier 1 (Official). Context7 requires no API key — it provides live, version-accurate documentation for any library/framework in the project's tech stack. Add to `.claude/settings.json` or `~/.config/claude/settings.json`, then restart Claude.

### Example: React + Figma + Playwright

User is building a React app with Figma designs and Playwright tests.

Suggested servers:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp"],
      "env": { "FIGMA_API_KEY": "<your-figma-token>" }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "playwright-mcp"]
    }
  }
}
```

Figma MCP is Tier 1 (Official). Playwright MCP is Tier 1 (Microsoft official).
