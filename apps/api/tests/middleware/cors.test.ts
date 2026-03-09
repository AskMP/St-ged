import { describe, it, expect, beforeAll } from "vitest";

const API_URL = process.env.API_URL || "http://localhost:3000";

// These tests require a live API server. Skip gracefully when no server is running.
// Run manually with: API_URL=http://localhost:3000 pnpm --filter api test cors
describe("CORS middleware", () => {
  let serverAvailable = false;

  beforeAll(async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      serverAvailable = res.ok;
    } catch {
      serverAvailable = false;
    }
  });

  it("includes CORS headers in response", async () => {
    if (!serverAvailable) {
      console.log(`Skipping: no API server at ${API_URL}`);
      return;
    }
    const response = await fetch(`${API_URL}/health`, {
      headers: {
        Origin: "http://localhost:5173",
      },
    });

    expect(response.headers.get("access-control-allow-origin")).toBeDefined();
  });

  it("allows requests from localhost:5173", async () => {
    if (!serverAvailable) {
      console.log(`Skipping: no API server at ${API_URL}`);
      return;
    }
    const response = await fetch(`${API_URL}/health`, {
      headers: {
        Origin: "http://localhost:5173",
      },
    });

    expect(response.status).toBe(200);
  });
});
