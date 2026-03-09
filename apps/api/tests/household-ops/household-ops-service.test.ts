import { describe, expect, it } from "vitest";
import {
  addCostEntry,
  createHousehold,
  getCostHistory,
  getRotation,
  getRotationAssignments,
  joinHousehold,
  setRotation,
} from "../../src/services/household-service";
import { db } from "../../src/lib/db";
import { users } from "@staged/db";
import { randomUUID } from "crypto";

async function createTestUser(): Promise<string> {
  const id = randomUUID();
  await db
    .insert(users)
    .values({ id, email: `test-${id}@example.com`, displayName: "Test User" })
    .onConflictDoNothing();
  return id;
}

// helper to create a household with one owner and optionally join additional members
async function makeHouseholdWithMembers(additionalCount = 0) {
  const ownerId = await createTestUser();
  const { id, inviteCode } = await createHousehold("test", ownerId);
  const memberIds: string[] = [ownerId];
  for (let i = 0; i < additionalCount; i++) {
    const memberId = await createTestUser();
    await joinHousehold(inviteCode, memberId);
    memberIds.push(memberId);
  }
  return { id, memberIds };
}

describe("household ops service", () => {
  it("adds cost entry and returns equal splits with single member", async () => {
    const { id, memberIds } = await makeHouseholdWithMembers(0);
    const entry = await addCostEntry(id, 120);
    expect(entry.splits[memberIds[0]!]).toBeCloseTo(120);
    const hist = await getCostHistory(id);
    expect(hist.length).toBeGreaterThanOrEqual(1);
    const last = hist[hist.length - 1]!;
    expect(last.total).toBe(120);
    expect(Object.keys(last.splits)).toHaveLength(1);
  });

  it("splits cost evenly across multiple members", async () => {
    const { id, memberIds } = await makeHouseholdWithMembers(2);
    const entry = await addCostEntry(id, 90);
    for (const mid of memberIds) {
      expect(entry.splits[mid]).toBeCloseTo(30);
    }
  });

  it("rounds splits to cents and distributes remainder", async () => {
    const { id } = await makeHouseholdWithMembers(2);
    // 100/3 should produce 33.34, 33.33, 33.33 or similar
    const entry = await addCostEntry(id, 100);
    const values = Object.values(entry.splits).map(
      (v) => Math.round(v * 100) / 100,
    );
    expect(values.reduce((a, b) => a + b, 0)).toBeCloseTo(100);
    expect(values.some((v) => v === 33.34)).toBe(true);
  });

  it("handles zero-weight fallback to even split", async () => {
    const { id, memberIds } = await makeHouseholdWithMembers(1);
    const weights: Record<string, number> = {};
    for (const mid of memberIds) weights[mid] = 0;
    const entry = await addCostEntry(id, 50, weights);
    for (const mid of memberIds) {
      expect(entry.splits[mid]).toBeCloseTo(25);
    }
  });

  it("supports weighted splits", async () => {
    const { id, memberIds } = await makeHouseholdWithMembers(1);
    const [m1, m2] = memberIds as [string, string];
    const weights: Record<string, number> = { [m1]: 1, [m2]: 3 };
    const entry = await addCostEntry(id, 80, weights);
    expect(entry.splits[m1]).toBeCloseTo(20);
    expect(entry.splits[m2]).toBeCloseTo(60);
  });

  it("rotation settings and assignments rotate correctly", async () => {
    const { id, memberIds } = await makeHouseholdWithMembers(2);
    const settings = await setRotation(id, "weekly", memberIds, "2025-01-01");
    expect(settings.frequency).toBe("weekly");
    const fetched = await getRotation(id);
    expect(fetched).toMatchObject({ frequency: "weekly" });

    const assigns = await getRotationAssignments(id, 3);
    expect(assigns).toHaveLength(3);
    expect(assigns[0]!.userId).toBe(memberIds[0]);
    expect(assigns[1]!.userId).toBe(memberIds[1]);
    expect(assigns[2]!.userId).toBe(memberIds[2]);
  });
});
