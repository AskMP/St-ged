import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { pool } from '../lib/auth'
import { requireAuth } from '../middleware/auth'
import { createGuestSession, redeemInvite } from '../services/auth-service'

// we duplicate the shape here to avoid Hono context typing conflicts
interface SessionUser {
  id: string
  role: string
  email?: string | null
  name?: string | null
  image?: string | null
}

const authRouter = new Hono()

// returns session user + profile; require authentication
authRouter.get('/me', requireAuth, async (c) => {
  const user = ((c as any).get('user') as unknown) as SessionUser
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }
  return c.json(user)
})

// sign-up route for credentials provider
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

// sign-up endpoint -- runs before Auth.js handles its own routes
authRouter.post('/signup', async (c) => {
  const body = await c.req.json()
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().min(1),
  })
  const { email, password, displayName } = schema.parse(body)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // ensure not already registered in auth user table
    const existing = await client.query('SELECT id FROM "user" WHERE email = $1', [email])
    if ((existing.rowCount ?? 0) > 0) {
      throw new HTTPException(409, { message: 'Email already registered' })
    }
    const hashed = await bcrypt.hash(password, 12)
    // insert into Auth.js user table
    const userRes = await client.query(
      'INSERT INTO "user" (id, email, name, createdAt, updatedAt) VALUES ($1,$2,$3,NOW(),NOW()) RETURNING id',
      [uuidv4(), email, displayName]
    )
    const userId = userRes.rows[0].id
    // insert credential account record
    await client.query(
      `INSERT INTO account ("id","providerId","accountId","userId","password","createdAt","updatedAt") VALUES ($1,'credentials',$2,$3,$4,NOW(),NOW())`,
      [uuidv4(), email, userId, hashed]
    )
    // insert app-level profile row
    await client.query(
      'INSERT INTO users (id,email,display_name,skill_level,dietary_profile) VALUES ($1,$2,$3,$4,$5)',
      [userId, email, displayName, 'beginner', {}]
    )
    await client.query('COMMIT')
    return c.json({ message: 'Account created' }, 201)
  } catch (err: any) {
    await client.query('ROLLBACK')
    if (err instanceof HTTPException) throw err
    // rethrow or wrap other errors
    throw err
  } finally {
    client.release()
  }
})

// create a guest session (public endpoint)
authRouter.post('/guest', async (c) => {
  const { token, guestId } = await createGuestSession()
  return c.json({ token, guestId })
})

// redeem household invite code; user must be authenticated
authRouter.post('/invite/:code', requireAuth, async (c) => {
  const user = ((c as any).get('user') as unknown) as SessionUser
  const code = c.req.param('code')
  try {
    if (!user?.id) throw new HTTPException(401, { message: 'Unauthorized' })
    await redeemInvite(code, user.id)
    return c.text('ok')
  } catch (e) {
    throw new HTTPException(404, { message: 'Invite not found' })
  }
})

export default authRouter
