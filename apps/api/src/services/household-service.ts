import { db } from "../lib/db";
import {
  households,
  householdMembers,
  users,
  householdCosts,
  cookRotations,
} from "@staged/db";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

// ---- Household CRUD ----

export async function createHousehold(name: string, creatorId: string) {
  const inviteCode = nanoid(10);

  const [household] = await db
    .insert(households)
    .values({ name, inviteCode, createdBy: creatorId })
    .returning({ id: households.id, inviteCode: households.inviteCode });

  if (!household) throw new Error("Failed to create household");

  await db.insert(householdMembers).values({
    householdId: household.id,
    userId: creatorId,
    role: "owner",
  });

  // Set this as the user's active household if they have none
  await db
    .update(users)
    .set({ householdId: household.id })
    .where(eq(users.id, creatorId));

  return { id: household.id, inviteCode: household.inviteCode };
}

export async function joinHousehold(code: string, userId: string) {
  const [household] = await db
    .select({ id: households.id })
    .from(households)
    .where(eq(households.inviteCode, code))
    .limit(1);

  if (!household) {
    const err: any = new Error("Not found");
    err.status = 404;
    throw err;
  }

  // Idempotent: skip if already a member
  await db
    .insert(householdMembers)
    .values({ householdId: household.id, userId, role: "member" })
    .onConflictDoNothing();

  // Set active household if user has none
  await db
    .update(users)
    .set({ householdId: household.id })
    .where(and(eq(users.id, userId)));

  return { success: true };
}

export async function listMembers(householdId: string) {
  const rows = await db
    .select({
      userId: householdMembers.userId,
      role: householdMembers.role,
      displayName: users.displayName,
      email: users.email,
    })
    .from(householdMembers)
    .innerJoin(users, eq(householdMembers.userId, users.id))
    .where(eq(householdMembers.householdId, householdId));

  if (rows.length === 0) {
    // Check if household exists at all
    const [h] = await db
      .select({ id: households.id })
      .from(households)
      .where(eq(households.id, householdId))
      .limit(1);
    if (!h) {
      const err: any = new Error("Household not found");
      err.status = 404;
      throw err;
    }
  }

  return rows.map((r) => ({
    userId: r.userId,
    role: r.role,
    name: r.displayName,
    email: r.email,
  }));
}

export async function changeMemberRole(
  householdId: string,
  userId: string,
  role: string,
  requesterId: string,
) {
  // Verify requester is owner
  const [requester] = await db
    .select({ role: householdMembers.role })
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.householdId, householdId),
        eq(householdMembers.userId, requesterId),
      ),
    )
    .limit(1);

  if (!requester || requester.role !== "owner") {
    const err: any = new Error("Unauthorized");
    err.status = 403;
    throw err;
  }

  const result = await db
    .update(householdMembers)
    .set({ role })
    .where(
      and(
        eq(householdMembers.householdId, householdId),
        eq(householdMembers.userId, userId),
      ),
    )
    .returning({ userId: householdMembers.userId });

  if (result.length === 0) {
    const err: any = new Error("Member not found");
    err.status = 404;
    throw err;
  }

  return { success: true };
}

export async function getUserHouseholds(userId: string) {
  const rows = await db
    .select({
      id: households.id,
      name: households.name,
      inviteCode: households.inviteCode,
      role: householdMembers.role,
      activeHouseholdId: users.householdId,
    })
    .from(householdMembers)
    .innerJoin(households, eq(householdMembers.householdId, households.id))
    .innerJoin(users, eq(householdMembers.userId, users.id))
    .where(eq(householdMembers.userId, userId));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    inviteCode: r.inviteCode,
    role: r.role as "owner" | "member" | "guest",
    isActive: r.id === r.activeHouseholdId,
  }));
}

export async function getHouseholdByInvite(code: string) {
  const [h] = await db
    .select()
    .from(households)
    .where(eq(households.inviteCode, code))
    .limit(1);
  return h;
}

export async function canAddGuest(
  householdId: string,
  userId: string,
): Promise<boolean> {
  const [member] = await db
    .select({ role: householdMembers.role })
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.householdId, householdId),
        eq(householdMembers.userId, userId),
      ),
    )
    .limit(1);

  if (!member) return false;
  return member.role === "owner" || member.role === "member";
}

export async function verifyHouseholdAccess(
  householdId: string,
  userId: string,
) {
  const [member] = await db
    .select({ role: householdMembers.role })
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.householdId, householdId),
        eq(householdMembers.userId, userId),
      ),
    )
    .limit(1);

  if (!member) {
    const err: any = new Error("Not a member");
    err.status = 403;
    throw err;
  }

  return { role: member.role };
}

// ---- Household ops: cost splitting & rotation ----

interface CostEntry {
  id: string;
  householdId: string;
  total: number;
  splits: Record<string, number>;
  date: string;
}

function roundCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function computeSplits(
  members: string[],
  total: number,
  weights?: Record<string, number>,
): Record<string, number> {
  const splits: Record<string, number> = {};

  if (weights && Object.keys(weights).length > 0) {
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    if (sum === 0) {
      // fallback to even split
      const each = members.length > 0 ? total / members.length : 0;
      let assigned = 0;
      for (const member of members) {
        splits[member] = roundCents(each);
        assigned += splits[member]!;
      }
      let remainder = roundCents(total - assigned);
      let i = 0;
      while (Math.abs(remainder) >= 0.005) {
        const key = members[i % members.length]!;
        splits[key] = roundCents(splits[key]! + (remainder > 0 ? 0.01 : -0.01));
        remainder += remainder > 0 ? -0.01 : 0.01;
        i++;
      }
    } else {
      // weighted split with rounding and remainder distribution
      let assigned = 0;
      for (const member of members) {
        const w = weights[member] ?? 0;
        const raw = (total * w) / sum;
        splits[member] = roundCents(raw);
        assigned += splits[member]!;
      }
      let remainder = roundCents(total - assigned);
      let idx = 0;
      while (Math.abs(remainder) >= 0.005) {
        const key = members[idx % members.length]!;
        splits[key] = roundCents(splits[key]! + (remainder > 0 ? 0.01 : -0.01));
        remainder += remainder > 0 ? -0.01 : 0.01;
        idx++;
      }
    }
  } else {
    const each = members.length > 0 ? total / members.length : 0;
    let assigned = 0;
    for (const member of members) {
      splits[member] = roundCents(each);
      assigned += splits[member]!;
    }
    let remainder = roundCents(total - assigned);
    let i = 0;
    while (Math.abs(remainder) >= 0.005) {
      const key = members[i % members.length]!;
      splits[key] = roundCents(splits[key]! + (remainder > 0 ? 0.01 : -0.01));
      remainder += remainder > 0 ? -0.01 : 0.01;
      i++;
    }
  }

  return splits;
}

export async function addCostEntry(
  householdId: string,
  total: number,
  weights?: Record<string, number>,
): Promise<CostEntry> {
  // Get members from DB to compute splits
  const memberRows = await db
    .select({ userId: householdMembers.userId })
    .from(householdMembers)
    .where(eq(householdMembers.householdId, householdId));

  if (memberRows.length === 0) {
    const err: any = new Error("Household not found");
    err.status = 404;
    throw err;
  }

  const memberIds = memberRows.map((m) => m.userId);
  const splits = computeSplits(memberIds, total, weights);

  const [entry] = await db
    .insert(householdCosts)
    .values({ householdId, total, splits, date: new Date() })
    .returning({
      id: householdCosts.id,
      householdId: householdCosts.householdId,
      total: householdCosts.total,
      splits: householdCosts.splits,
      date: householdCosts.date,
    });

  if (!entry) throw new Error("Failed to insert cost entry");

  return {
    id: entry.id,
    householdId: entry.householdId,
    total: entry.total,
    splits: entry.splits as Record<string, number>,
    date: entry.date.toISOString(),
  };
}

export async function getCostHistory(
  householdId: string,
): Promise<CostEntry[]> {
  const rows = await db
    .select()
    .from(householdCosts)
    .where(eq(householdCosts.householdId, householdId))
    .orderBy(householdCosts.date);

  return rows.map((r) => ({
    id: r.id,
    householdId: r.householdId,
    total: r.total,
    splits: r.splits as Record<string, number>,
    date: r.date.toISOString(),
  }));
}

// ---- Cook rotation ----

interface RotationSettings {
  householdId: string;
  frequency: "weekly" | "biweekly";
  members: string[];
  startDate: string; // ISO date string
}

export async function setRotation(
  householdId: string,
  frequency: "weekly" | "biweekly",
  members: string[],
  startDate?: string,
): Promise<RotationSettings> {
  const start = startDate
    ? new Date(startDate).toISOString().split("T")[0]!
    : new Date().toISOString().split("T")[0]!;

  await db
    .insert(cookRotations)
    .values({ householdId, frequency, members, startDate: start })
    .onConflictDoUpdate({
      target: cookRotations.householdId,
      set: { frequency, members, startDate: start },
    });

  return { householdId, frequency, members, startDate: start };
}

export async function getRotation(
  householdId: string,
): Promise<RotationSettings | undefined> {
  const [row] = await db
    .select()
    .from(cookRotations)
    .where(eq(cookRotations.householdId, householdId))
    .limit(1);

  if (!row) return undefined;

  return {
    householdId: row.householdId,
    frequency: row.frequency as "weekly" | "biweekly",
    members: row.members as string[],
    startDate: row.startDate,
  };
}

// compute upcoming assignments for next N weeks (default 4)
export async function getRotationAssignments(
  householdId: string,
  weeks = 4,
): Promise<{ date: string; userId: string }[]> {
  const rotation = await getRotation(householdId);
  if (!rotation || rotation.members.length === 0) return [];

  const result: { date: string; userId: string }[] = [];
  const start = new Date(rotation.startDate);

  for (let i = 0; i < weeks; i++) {
    const offsetDays = i * 7 * (rotation.frequency === "biweekly" ? 2 : 1);
    const d = new Date(start);
    d.setDate(d.getDate() + offsetDays);
    const idx = i % rotation.members.length;
    result.push({
      date: d.toISOString().split("T")[0]!,
      userId: rotation.members[idx]!,
    });
  }

  return result;
}
