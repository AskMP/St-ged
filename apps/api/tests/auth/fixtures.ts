import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function resetDb() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // truncate tables in order that avoids FK issues
    await client.query('TRUNCATE household_members, households, account, "user", users CASCADE')
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function insertInviteHousehold(inviteCode: string) {
  const client = await pool.connect()
  try {
    const res = await client.query(
      'INSERT INTO households (id, invite_code, name) VALUES (gen_random_uuid(), $1, $2) RETURNING id',
      [inviteCode, 'Test House']
    )
    return res.rows[0].id as string
  } finally {
    client.release()
  }
}
