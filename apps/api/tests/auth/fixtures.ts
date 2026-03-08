import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function resetDb() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // truncate tables in order that avoids FK issues
    await client.query(
      'TRUNCATE household_members, households, account, "user", users CASCADE',
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function insertInviteHousehold(inviteCode: string) {
  const client = await pool.connect();
  try {
    // create a dummy owner user first (households.created_by is NOT NULL and UUID)
    const ownerId = uuidv4();
    await client.query(
      'INSERT INTO "user" (id, email, name, "emailVerified", "createdAt", "updatedAt") VALUES ($1,$2,$3,false,NOW(),NOW()) ON CONFLICT DO NOTHING',
      [ownerId, `owner-${ownerId}@test.com`, "Test Owner"],
    );
    await client.query(
      "INSERT INTO users (id, email, display_name, skill_level, dietary_profile) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",
      [ownerId, `owner-${ownerId}@test.com`, "Test Owner", "beginner", "{}"],
    );
    const res = await client.query(
      "INSERT INTO households (id, invite_code, name, created_by) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id",
      [inviteCode, "Test House", ownerId],
    );
    return res.rows[0].id as string;
  } finally {
    client.release();
  }
}
