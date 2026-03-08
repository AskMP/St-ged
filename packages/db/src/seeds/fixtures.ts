// Deterministic seed fixtures for development and E2E testing.
// All IDs are fixed UUIDs so tests can reference them by constant.
// Run: pnpm --filter @staged/db seed

export const SEED = {
  households: {
    primary: {
      id: "11111111-0000-0000-0000-000000000001",
      name: "The Demo Household",
      inviteCode: "demo-invite-01",
    },
    guest: {
      id: "11111111-0000-0000-0000-000000000002",
      name: "Guest Household",
      inviteCode: "guest-invite-01",
    },
  },
  users: {
    owner: {
      id: "22222222-0000-0000-0000-000000000001",
      email: "owner@staged.test",
      displayName: "Demo Owner",
      skillLevel: "intermediate",
    },
    member: {
      id: "22222222-0000-0000-0000-000000000002",
      email: "member@staged.test",
      displayName: "Demo Member",
      skillLevel: "beginner",
    },
  },
  recipes: {
    pasta: {
      id: "33333333-0000-0000-0000-000000000001",
      title: "Classic Pasta Carbonara",
      skillLevel: "intermediate",
      servingsBase: 4,
    },
    salad: {
      id: "33333333-0000-0000-0000-000000000002",
      title: "Simple Green Salad",
      skillLevel: "beginner",
      servingsBase: 2,
    },
  },
};
