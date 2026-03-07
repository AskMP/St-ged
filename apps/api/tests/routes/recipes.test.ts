import { describe, it, expect } from 'vitest'

const API_URL = 'http://localhost:3000'

describe('Recipes route', () => {
  it('returns 501 Not Implemented for GET /api/recipes', async () => {
    const response = await fetch(`${API_URL}/api/recipes`, {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    })
    
    expect(response.status).toBe(501)
    const data = await response.json()
    expect(data.message).toBe('Not implemented')
  })
})
