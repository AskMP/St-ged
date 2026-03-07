import { describe, it, expect, beforeAll, afterAll } from 'vitest'

const API_URL = 'http://localhost:3000'

describe('Health endpoint', () => {
  let server: ReturnType<typeof setTimeout>

  beforeAll(async () => {
    server = setTimeout(() => {}, 10000)
  })

  afterAll(() => {
    clearTimeout(server)
  })

  it('returns 200 with status ok when DB is available', async () => {
    const response = await fetch(`${API_URL}/health`)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.status).toBe('ok')
    expect(data.db).toBeDefined()
    expect(data.uptime).toBeDefined()
  })
})
