import { describe, expect, it } from "vitest";
import {
  canAddGuest,
  createHousehold,
  joinHousehold,
  verifyHouseholdAccess,
} from "../../src/services/household-service";
import { createTestUser } from "./helpers";

describe("household service helpers", () => {
  it("allows owner and member to add guests", async () => {
    const ownerId = await createTestUser();
    const memberId = await createTestUser();
    const outsiderId = await createTestUser();
    const { id, inviteCode } = await createHousehold("Test", ownerId);
    // owner can add guest
    expect(await canAddGuest(id, ownerId)).toBe(true);
    // simulate another member
    await joinHousehold(inviteCode, memberId);
    expect(await canAddGuest(id, memberId)).toBe(true);
    // outsider cannot
    expect(await canAddGuest(id, outsiderId)).toBe(false);
  });

  it("verifyHouseholdAccess throws for non-member", async () => {
    const u1 = await createTestUser();
    const u2 = await createTestUser();
    const u3 = await createTestUser();
    const { id, inviteCode } = await createHousehold("X", u1);
    await joinHousehold(inviteCode, u2);
    await expect(verifyHouseholdAccess(id, u2)).resolves.toHaveProperty("role");
    await expect(verifyHouseholdAccess(id, u3)).rejects.toHaveProperty(
      "status",
      403,
    );
  });
});
