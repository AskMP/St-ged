const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`${res.status} ${text}`)
  }
  return res.json() as Promise<T>
}

export const apiClient = {
  auth: {
    signup(email: string, password: string, displayName: string) {
      return request<{ message: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName }),
      })
    },
    guest() {
      return request<{ token: string; userId: string }>('/auth/guest', {
        method: 'POST',
      })
    },
    me() {
      return request<{ id: string; name: string; email: string | null }>('/auth/me')
    },
  },
  households: {
    create(name: string) {
      return request<{ id: string; name: string }>('/households', {
        method: 'POST',
        body: JSON.stringify({ name }),
      })
    },
  },
  pantry: {
    applyTemplate(householdId: string, template: string) {
      return request<unknown>(`/households/${householdId}/pantry/templates/${template}`, {
        method: 'POST',
      })
    },
  },
  recipes: {
    list(params?: { diet?: string; search?: string }) {
      const qs = new URLSearchParams()
      if (params?.diet) qs.set('diet', params.diet)
      if (params?.search) qs.set('search', params.search)
      const query = qs.toString()
      return request<unknown[]>(`/recipes${query ? `?${query}` : ''}`)
    },
    get(id: string) {
      return request<Record<string, unknown>>(`/recipes/${id}`)
    },
    import(url: string) {
      return request<Record<string, unknown>>('/recipes/import', {
        method: 'POST',
        body: JSON.stringify({ url }),
      })
    },
    scale(recipe: unknown, factor: number) {
      return request<Record<string, unknown>>('/recipes/scale', {
        method: 'POST',
        body: JSON.stringify({ recipe, factor }),
      })
    },
    substitute(ingredient: string) {
      return request<{ substitutions: string[] }>('/recipes/substitute', {
        method: 'POST',
        body: JSON.stringify({ ingredient }),
      })
    },
  },
}
