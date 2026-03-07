// ensure required environment variables are set for the test run
process.env.NEXTAUTH_SECRET ||= 'test-secret'
process.env.DATABASE_URL ||= 'postgresql://staged:staged_dev_password@localhost:5432/staged_dev'
process.env.NEXTAUTH_URL ||= 'http://localhost:3000'

import jwt from 'jsonwebtoken'
import { app } from '../../src/index'
import { insertInviteHousehold, resetDb } from './fixtures'

const BASE = 'http://localhost'

async function signup(email: string, password: string, displayName: string) {
  return app.fetch(`${BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, displayName }),
  })
}

async function signin(email: string, password: string) {
  return app.fetch(`${BASE}/api/auth/signin`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

describe('auth routes', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('signup works and rejects duplicate/weak password', async () => {
    const res = await signup('a@b.com', 'password123', 'Alice')
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.message).toBe('Account created')

    const dup = await signup('a@b.com', 'password123', 'Alice')
    expect(dup.status).toBe(409)

    const weak = await signup('b@c.com', 'short', 'Bob')
    expect(weak.status).toBe(400)
  })

  it('signin returns session cookie and /me works', async () => {
    await signup('c@d.com', 'strongpass', 'Cindy')
    const res = await signin('c@d.com', 'strongpass')
    expect(res.status).toBe(200)
    const cookies = res.headers.get('set-cookie')
    expect(cookies).toBeTruthy()
    // extract session token cookie
    const match = /next-auth\.session-token=([^;]+)/.exec(cookies!)
    expect(match).toBeTruthy()
    const token = match![1]

    // call /me with cookie
    const me = await app.fetch(`${BASE}/api/auth/me`, {
      headers: { cookie: `next-auth.session-token=${token}` }
    })
    expect(me.status).toBe(200)
    const user = await me.json()
    expect(user.email).toBe('c@d.com')
  })

  it('guest route returns valid jwt with guest role', async () => {
    const res = await app.fetch(`${BASE}/api/auth/guest`, { method: 'POST' })
    expect(res.status).toBe(200)
    const { token, guestId } = await res.json()
    expect(typeof token).toBe('string')
    expect(typeof guestId).toBe('string')
    const decoded: any = jwt.verify(token, process.env.NEXTAUTH_SECRET!)
    expect(decoded.role).toBe('guest')
    expect(decoded.guestId).toBe(guestId)
  })

  it('invite route adds user to household and blocks unauthenticated', async () => {
    const inviteCode = 'INV123'
    const householdId = await insertInviteHousehold(inviteCode)

    // unauthenticated should 401 when hitting /invite
    const anon = await app.fetch(`${BASE}/api/auth/invite/${inviteCode}`, { method: 'POST' })
    expect(anon.status).toBe(401)

    // register and sign in
    await signup('e@f.com', 'passw0rd', 'Eve')
    const login = await signin('e@f.com', 'passw0rd')
    const cookies = login.headers.get('set-cookie')!
    const match = /next-auth\.session-token=([^;]+)/.exec(cookies)!
    const token = match[1]

    const inv = await app.fetch(`${BASE}/api/auth/invite/${inviteCode}`, {
      method: 'POST',
      headers: { cookie: `next-auth.session-token=${token}` }
    })
    expect(inv.status).toBe(200)
  })
})
