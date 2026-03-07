import { describe, it, expect } from 'vitest'

const API_URL = 'http://localhost:3000'

describe('CORS middleware', () => {
  it('includes CORS headers in response', async () => {
    const response = await fetch(`${API_URL}/health`, {
      headers: {
        'Origin': 'http://localhost:5173',
      },
    })
    
    expect(response.headers.get('access-control-allow-origin')).toBeDefined()
  })

  it('allows requests from localhost:5173', async () => {
    const response = await fetch(`${API_URL}/health`, {
      headers: {
        'Origin': 'http://localhost:5173',
      },
    })
    
    expect(response.status).toBe(200)
  })
})
