// ensure required environment variables are set for the test run
process.env.NEXTAUTH_SECRET ||= "test-secret";
process.env.DATABASE_URL ||=
  "postgresql://staged:staged_dev_password@localhost:5432/staged_dev";
process.env.NEXTAUTH_URL ||= "http://localhost:3000";

import { randomUUID } from "crypto";
import { app } from "../../src/index";
import {
  createHousehold,
  joinHousehold,
} from "../../src/services/household-service";
import { db } from "../../src/lib/db";
import { users } from "@staged/db";

async function createTestUser(): Promise<string> {
  const id = randomUUID();
  await db
    .insert(users)
    .values({ id, email: `test-${id}@example.com`, displayName: "Test User" })
    .onConflictDoNothing();
  return id;
}

describe("household ops routes", () => {
  it("allows posting a cost entry and retrieving history", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    const h = await createHousehold("OpsHouse", userA);
    const hid = h.id;
    await joinHousehold(h.inviteCode, userB);

    const postRes = await app.request(
      `http://localhost/api/households/${hid}/costs`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-test-user-id": userA,
        },
        body: JSON.stringify({ total: 50 }),
      },
    );
    expect(postRes.status).toBe(201);
    const entry = await postRes.json();
    expect(entry.splits).toBeDefined();
    expect(Object.keys(entry.splits).length).toBe(2);

    const getRes = await app.request(
      `http://localhost/api/households/${hid}/costs`,
      {
        method: "GET",
        headers: { "x-test-user-id": userA },
      },
    );
    expect(getRes.status).toBe(200);
    const history = await getRes.json();
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThanOrEqual(1);
    const last = history[history.length - 1];
    expect(last.total).toBe(50);
  });

  it("lets clients configure rotation and fetch assignments", async () => {
    const userX = await createTestUser();
    const userY = await createTestUser();
    const userZ = await createTestUser();
    const h = await createHousehold("RotHouse", userX);
    const hid = h.id;
    await joinHousehold(h.inviteCode, userY);
    await joinHousehold(h.inviteCode, userZ);

    const postRes = await app.request(
      `http://localhost/api/households/${hid}/rotation`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-test-user-id": userX,
        },
        body: JSON.stringify({
          frequency: "weekly",
          members: [userX, userY, userZ],
          startDate: "2025-01-01",
        }),
      },
    );
    expect(postRes.status).toBe(200);
    const settings = await postRes.json();
    expect(settings.frequency).toBe("weekly");

    const getRes = await app.request(
      `http://localhost/api/households/${hid}/rotation`,
      {
        method: "GET",
        headers: { "x-test-user-id": userX },
      },
    );
    expect(getRes.status).toBe(200);
    const fetched = await getRes.json();
    expect(fetched.frequency).toBe("weekly");

    const assignsRes = await app.request(
      `http://localhost/api/households/${hid}/rotation/assignments?weeks=3`,
      {
        method: "GET",
        headers: { "x-test-user-id": userX },
      },
    );
    expect(assignsRes.status).toBe(200);
    const assigns = await assignsRes.json();
    expect(assigns.length).toBe(3);
    expect(assigns[0].userId).toBe(userX);
    expect(assigns[1].userId).toBe(userY);
    expect(assigns[2].userId).toBe(userZ);
  });
});
