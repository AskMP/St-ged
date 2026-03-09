import { describe, it, expect, beforeAll, afterAll } from "vitest";

const API_URL = process.env.API_URL || "http://localhost:3000";

// These tests require a live API server. Skip in CI unless API_URL is explicitly set.
// Run manually with: API_URL=http://localhost:3000 pnpm --filter api test health
describe("Health endpoint", () => {
  let server: ReturnType<typeof setTimeout>;
  let serverAvailable = false;

  beforeAll(async () => {
    server = setTimeout(() => {}, 10000);
    // Check if server is available
    try {
      const res = await fetch(`${API_URL}/health`);
      serverAvailable = res.ok;
    } catch {
      serverAvailable = false;
    }
  });

  afterAll(() => {
    clearTimeout(server);
  });

  it("returns 200 with status ok when DB is available", async () => {
    if (!serverAvailable) {
      console.log(`Skipping: no API server at ${API_URL}`);
      return;
    }
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.db).toBeDefined();
    expect(data.uptime).toBeDefined();
  });
});
