import jwt from 'jsonwebtoken'
import { Session } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import { Pool } from 'pg'
import { v4 as uuidv4 } from 'uuid'

// reuse same pool as auth.ts (could factor into shared lib)
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export type SessionUser = Session['user']

export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
  if (!token || !token.user) return null
  return token.user as SessionUser
}

export async function createGuestSession(): Promise<{ token: string; guestId: string }> {
  const guestId = uuidv4()
  const payload = { role: 'guest', guestId }
  const token = jwt.sign(payload, process.env.NEXTAUTH_SECRET || '', {
    expiresIn: '7d',
  })
  return { token, guestId }
}

export async function redeemInvite(inviteCode: string, userId: string): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // find household by invite code
    const res = await client.query('SELECT id FROM households WHERE invite_code = $1', [inviteCode])
    if (res.rowCount === 0) {
      throw new Error('invite not found')
    }
    const householdId = res.rows[0].id
    // add member
    await client.query(
      'INSERT INTO household_members (household_id, user_id, role, joined_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT DO NOTHING',
      [householdId, userId, 'member']
    )
    // update user's householdId
    await client.query('UPDATE users SET household_id = $1 WHERE id = $2', [householdId, userId])
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
