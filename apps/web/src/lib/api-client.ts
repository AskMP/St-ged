import type { HouseholdMembership, StagedEvent } from "@staged/types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

// the fridgeClearance helper belongs on the client, not inside request

export const apiClient = {
  auth: {
    signup(email: string, password: string, displayName: string) {
      return request<{ message: string }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, displayName }),
      });
    },
    signin(email: string, password: string) {
      return request<{
        user: {
          id: string;
          email: string;
          name: string;
          householdId: string | null;
          skillLevel: string;
          role: string;
        };
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    guest() {
      return request<{ token: string; userId: string }>("/api/auth/guest", {
        method: "POST",
      });
    },
    me() {
      return request<{
        id: string;
        email: string;
        name: string;
        householdId: string | null;
        skillLevel: string;
        role: string;
      }>("/api/auth/me");
    },
    signout() {
      return request<{ message: string }>("/api/auth/signout", {
        method: "POST",
      });
    },
  },
  users: {
    getHouseholds() {
      return request<{ households: HouseholdMembership[] }>(
        "/api/users/me/households",
      );
    },
    switchHousehold(householdId: string) {
      return request<{
        user: {
          id: string;
          email: string;
          name: string;
          householdId: string | null;
          role: string;
        };
      }>("/api/users/me/active-household", {
        method: "PATCH",
        body: JSON.stringify({ householdId }),
      });
    },
  },
  households: {
    create(name: string) {
      return request<{
        id: string;
        inviteCode: string;
        user: {
          id: string;
          email: string | null;
          name: string | null;
          householdId: string | null;
          role: string;
        } | null;
      }>("/api/households", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
    },
    join(code: string) {
      return request<{ success: boolean }>("/api/households/join", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
    },
    addCost(
      householdId: string,
      total: number,
      weights?: Record<string, number>,
    ) {
      return request<any>(`/api/households/${householdId}/costs`, {
        method: "POST",
        body: JSON.stringify({ total, weights }),
      });
    },
    costHistory(householdId: string) {
      return request<any>(`/api/households/${householdId}/costs`);
    },
    setRotation(
      householdId: string,
      frequency: "weekly" | "biweekly",
      members: string[],
      startDate?: string,
    ) {
      return request<any>(`/api/households/${householdId}/rotation`, {
        method: "POST",
        body: JSON.stringify({ frequency, members, startDate }),
      });
    },
    getRotation(householdId: string) {
      return request<any>(`/api/households/${householdId}/rotation`);
    },
    getRotationAssignments(householdId: string, weeks = 4) {
      return request<any>(
        `/api/households/${householdId}/rotation/assignments?weeks=${weeks}`,
      );
    },
  },
  pantry: {
    applyTemplate(householdId: string, template: string) {
      return request<unknown>(
        `/api/households/${householdId}/pantry/templates/${template}`,
        {
          method: "POST",
        },
      );
    },
  },
  fridgeClearance: {
    getSuggestions(householdId: string) {
      return request<unknown>(
        `/api/fridge-clearance?householdId=${encodeURIComponent(householdId)}`,
      );
    },
  },
  plans: {
    getWeek(householdId: string, start: string) {
      return request<{ plan: { id: string }; entries: unknown[] }>(
        `/api/households/${householdId}/plans/week?start=${encodeURIComponent(start)}`,
      );
    },
    addEntry(
      planId: string,
      data: { recipeId: string; date: string; mealType: string },
    ) {
      return request<unknown>(`/api/plans/${planId}/entries`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    removeEntry(planId: string, entryId: string) {
      return request<{ success: boolean }>(
        `/api/plans/${planId}/entries/${entryId}`,
        {
          method: "DELETE",
        },
      );
    },
    generateList(planId: string) {
      return request<unknown>(`/api/plans/${planId}/generate-list`, {
        method: "POST",
      });
    },
    copyWeek(householdId: string, from: string, to: string) {
      return request<unknown>(`/api/households/${householdId}/plans/copy`, {
        method: "POST",
        body: JSON.stringify({ from, to }),
      });
    },
  },
  lists: {
    getAll(householdId: string) {
      return request<unknown[]>(`/api/households/${householdId}/lists`);
    },
    get(listId: string) {
      return request<{ id: string; name?: string; items: unknown[] }>(
        `/api/lists/${listId}`,
      );
    },
    addItem(listId: string, name: string) {
      return request<unknown>(`/api/lists/${listId}/items`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
    },
    toggleItem(listId: string, itemId: string) {
      return request<unknown>(`/api/lists/${listId}/items/${itemId}`, {
        method: "PATCH",
      });
    },
    deleteItem(listId: string, itemId: string) {
      return request<{ success: boolean }>(
        `/api/lists/${listId}/items/${itemId}`,
        {
          method: "DELETE",
        },
      );
    },
  },
  fulfillment: {
    // returns available providers; may be empty if service doesn't support selection
    getProviders() {
      return request<{ providers: string[] }>("/api/fulfillment/providers");
    },
    // generic link generation with optional provider choice
    generateLink(listId: string, provider?: string) {
      return request<any>("/api/fulfillment/link", {
        method: "POST",
        body: JSON.stringify({ listId, provider }),
      });
    },
    // legacy helper kept for compatibility
    generateInstacartLink(listId: string) {
      return request<any>("/api/fulfillment/instacart-link", {
        method: "POST",
        body: JSON.stringify({ listId }),
      });
    },
  },
  recipes: {
    list(params?: {
      dietaryTag?: string;
      skillLevel?: string;
      search?: string;
    }) {
      const qs = new URLSearchParams();
      if (params?.dietaryTag) qs.set("dietaryTag", params.dietaryTag);
      if (params?.skillLevel) qs.set("skillLevel", params.skillLevel);
      if (params?.search) qs.set("search", params.search);
      const query = qs.toString();
      return request<unknown[]>(`/api/recipes${query ? `?${query}` : ""}`);
    },
    get(id: string) {
      return request<Record<string, unknown>>(`/api/recipes/${id}`);
    },
    create(data: Record<string, unknown>) {
      return request<Record<string, unknown>>("/api/recipes", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    import(url: string) {
      return request<Record<string, unknown>>("/api/recipes/import", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
    },
    scale(recipe: unknown, factor: number) {
      return request<Record<string, unknown>>("/api/recipes/scale", {
        method: "POST",
        body: JSON.stringify({ recipe, factor }),
      });
    },
    substitute(ingredient: string) {
      return request<{ substitutions: string[] }>("/api/recipes/substitute", {
        method: "POST",
        body: JSON.stringify({ ingredient }),
      });
    },
    cost(recipeId: string, householdId?: string) {
      const qs = householdId
        ? `?householdId=${encodeURIComponent(householdId)}`
        : "";
      return request<{ costPerServing: number; pantryDeduction: number }>(
        `/api/recipes/${recipeId}/cost${qs}`,
      );
    },
  },
  potluck: {
    create(event: Partial<Record<string, any>>) {
      return request<any>("/api/potluck", {
        method: "POST",
        body: JSON.stringify(event),
      });
    },
    list() {
      return request<{ events: any[] }>("/api/potluck");
    },
    get(id: string) {
      return request<any>(`/api/potluck/${id}`);
    },
    claim(eventId: string, slotId: string, guestName: string) {
      return request<any>(`/api/potluck/${eventId}/slots/${slotId}/claim`, {
        method: "POST",
        body: JSON.stringify({ guestName }),
      });
    },
  },
  events: {
    list() {
      return request<{ events: StagedEvent[] }>("/api/events");
    },
    get(id: string) {
      return request<StagedEvent>(`/api/events/${id}`);
    },
    create(body: { title: string; priceCents: number }) {
      return request<{ event: StagedEvent }>("/api/events", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    book(eventId: string) {
      return request<any>(`/api/events/${eventId}/book`, { method: "POST" });
    },
  },
  batchPrep: {
    combine(recipeIds: string[]) {
      return request<{ items: any[]; sequence: string[] }>(
        "/api/batch-prep/combine",
        {
          method: "POST",
          body: JSON.stringify({ recipeIds }),
        },
      );
    },
  },
  dietary: {
    adapt(recipeId: string, profile: string) {
      return request<any>("/api/dietary/adapt", {
        method: "POST",
        body: JSON.stringify({ recipeId, profile }),
      });
    },
    getProfiles() {
      return request<{ profiles: string[] }>("/api/dietary/profiles");
    },
    explain(substitution: {
      original: string;
      replacement: string;
      reason: string;
    }) {
      return request<{ explanation: string }>("/api/dietary/explain", {
        method: "POST",
        body: JSON.stringify({ substitution }),
      });
    },
  },
};
