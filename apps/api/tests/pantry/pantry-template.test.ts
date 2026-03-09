// ensure test env
process.env.NEXTAUTH_SECRET ||= "test-secret";
process.env.DATABASE_URL ||=
  "postgresql://staged:staged_dev_password@localhost:5432/staged_dev";
process.env.NEXTAUTH_URL ||= "http://localhost:3000";

import { describe, expect, it } from "vitest";
import { randomUUID } from "crypto";
import { db } from "../../src/lib/db";
import { users } from "@staged/db";
import { createHousehold } from "../../src/services/household-service";
import * as pantryService from "../../src/services/pantry";
import * as templateService from "../../src/services/pantry-template-service";

async function createTestUser(): Promise<string> {
  const id = randomUUID();
  await db
    .insert(users)
    .values({ id, email: `test-${id}@example.com`, displayName: "Test" })
    .onConflictDoNothing();
  return id;
}

describe("pantry template service", () => {
  it("lists available templates", () => {
    const names = templateService.listTemplates();
    expect(names).toEqual(expect.arrayContaining(["basic", "vegan"]));
  });

  it("applies a template idempotently", async () => {
    const ownerId = await createTestUser();
    const { id: hid } = await createHousehold("TempHouse", ownerId);
    // start with empty pantry
    let p = await pantryService.getPantry(hid);
    expect(p).toEqual([]);

    const added1 = await templateService.applyTemplate(hid, "basic");
    expect(added1.length).toBeGreaterThan(0);

    p = await pantryService.getPantry(hid);
    expect(p.length).toEqual(added1.length);

    // apply again, should add nothing
    const added2 = await templateService.applyTemplate(hid, "basic");
    expect(added2).toEqual([]);
    p = await pantryService.getPantry(hid);
    expect(p.length).toEqual(added1.length);
  });

  it("throws for unknown template", async () => {
    await expect(
      templateService.applyTemplate("foo", "nonexistent"),
    ).rejects.toHaveProperty("status", 404);
  });
});
