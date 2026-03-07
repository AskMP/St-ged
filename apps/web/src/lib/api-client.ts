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

// the fridgeClearance helper belongs on the client, not inside request

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
    addCost(householdId: string, total: number, weights?: Record<string, number>) {
      return request<any>(`/households/${householdId}/costs`, {
        method: 'POST',
        body: JSON.stringify({ total, weights }),
      })
    },
    costHistory(householdId: string) {
      return request<any>(`/households/${householdId}/costs`)
    },
    setRotation(
      householdId: string,
      frequency: 'weekly' | 'biweekly',
      members: string[],
      startDate?: string,
    ) {
      return request<any>(`/households/${householdId}/rotation`, {
        method: 'POST',
        body: JSON.stringify({ frequency, members, startDate }),
      })
    },
    getRotation(householdId: string) {
      return request<any>(`/households/${householdId}/rotation`)
    },
    getRotationAssignments(householdId: string, weeks = 4) {
      return request<any>(
        `/households/${householdId}/rotation/assignments?weeks=${weeks}`,
      )
    },
  },
  pantry: {
    applyTemplate(householdId: string, template: string) {
      return request<unknown>(`/households/${householdId}/pantry/templates/${template}`, {
        method: 'POST',
      })
    },
  },
  fridgeClearance: {
    getSuggestions(householdId: string) {
      return request<unknown>(`/fridge-clearance?householdId=${encodeURIComponent(householdId)}`)
    },
  },
  plans: {
    getWeek(householdId: string, start: string) {
      return request<{ plan: { id: string }; entries: unknown[] }>(
        `/households/${householdId}/plans/week?start=${encodeURIComponent(start)}`
      )
    },
    addEntry(planId: string, data: { recipeId: string; date: string; mealType: string }) {
      return request<unknown>(`/plans/${planId}/entries`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    removeEntry(planId: string, entryId: string) {
      return request<{ success: boolean }>(`/plans/${planId}/entries/${entryId}`, {
        method: 'DELETE',
      })
    },
    generateList(planId: string) {
      return request<unknown>(`/plans/${planId}/generate-list`, { method: 'POST' })
    },
    copyWeek(householdId: string, from: string, to: string) {
      return request<unknown>(`/households/${householdId}/plans/copy`, {
        method: 'POST',
        body: JSON.stringify({ from, to }),
      })
    },
  },
  lists: {
    getAll(householdId: string) {
      return request<unknown[]>(`/households/${householdId}/lists`)
    },
    get(listId: string) {
      return request<{ id: string; name?: string; items: unknown[] }>(`/lists/${listId}`)
    },
    addItem(listId: string, name: string) {
      return request<unknown>(`/lists/${listId}/items`, {
        method: 'POST',
        body: JSON.stringify({ name }),
      })
    },
    toggleItem(listId: string, itemId: string) {
      return request<unknown>(`/lists/${listId}/items/${itemId}`, { method: 'PATCH' })
    },
    deleteItem(listId: string, itemId: string) {
      return request<{ success: boolean }>(`/lists/${listId}/items/${itemId}`, {
        method: 'DELETE',
      })
    },
  },
  fulfillment: {
    generateLink(listId: string) {
      return request<{ url: string; token: string; attribution: { affiliate: string }; bundles?: Array<{ name: string; description: string }> }>(
        '/fulfillment/instacart-link',
        { method: 'POST', body: JSON.stringify({ listId }) }
      )
    },
  },
  recipes: {
    list(params?: { diet?: string; search?: string }) {
      const qs = new URLSearchParams()
      if (params?.diet) qs.set('diet', params.diet)
      if (params?.search) qs.set('search', params.search)
      const query = qs.toString()
      return request<unknown[]>(`/api/recipes${query ? `?${query}` : ''}`)
    },
    get(id: string) {
      return request<Record<string, unknown>>(`/api/recipes/${id}`)
    },
    create(data: Record<string, unknown>) {
      return request<Record<string, unknown>>('/api/recipes', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    import(url: string) {
      return request<Record<string, unknown>>('/api/recipes/import', {
        method: 'POST',
        body: JSON.stringify({ url }),
      })
    },
    scale(recipe: unknown, factor: number) {
      return request<Record<string, unknown>>('/api/recipes/scale', {
        method: 'POST',
        body: JSON.stringify({ recipe, factor }),
      })
    },
    substitute(ingredient: string) {
      return request<{ substitutions: string[] }>('/api/recipes/substitute', {
        method: 'POST',
        body: JSON.stringify({ ingredient }),
      })
    },
    cost(recipeId: string, householdId?: string) {
      const qs = householdId ? `?householdId=${encodeURIComponent(householdId)}` : ''
      return request<{ costPerServing: number; pantryDeduction: number }>(
        `/api/recipes/${recipeId}/cost${qs}`
      )
    },
  },
  potluck: {
    create(event: Partial<Record<string, any>>) {
      return request<any>('/potluck', { method: 'POST', body: JSON.stringify(event) })
    },
    list() {
      return request<{ events: any[] }>('/potluck')
    },
    get(id: string) {
      return request<any>(`/potluck/${id}`)
    },
    claim(eventId: string, slotId: string, guestName: string) {
      return request<any>(`/potluck/${eventId}/slots/${slotId}/claim`, {
        method: 'POST',
        body: JSON.stringify({ guestName }),
      })
    },
  },
  batchPrep: {
    combine(recipeIds: string[]) {
      return request<{ items: any[]; sequence: string[] }>('/batch-prep/combine', {
        method: 'POST',
        body: JSON.stringify({ recipeIds }),
      })
    },
  },
  dietary: {
    adapt(recipeId: string, profile: string) {
      return request<any>('/dietary/adapt', {
        method: 'POST',
        body: JSON.stringify({ recipeId, profile }),
      })
    },
    getProfiles() {
      return request<{ profiles: string[] }>('/dietary/profiles')
    },
    explain(substitution: { original: string; replacement: string; reason: string }) {
      return request<{ explanation: string }>('/dietary/explain', {
        method: 'POST',
        body: JSON.stringify({ substitution }),
      })
    },
  },
}
