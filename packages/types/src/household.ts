// Household types - see prd-01-data-schema
export interface Household {
  id: string;
  name: string;
}

// A user's membership in a household, returned by GET /api/users/me/households
export interface HouseholdMembership {
  id: string;
  name: string;
  inviteCode: string;
  role: "owner" | "member" | "guest";
  isActive: boolean;
}
