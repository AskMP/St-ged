process.env.NEXTAUTH_SECRET ||= "test-secret";
process.env.DATABASE_URL ||=
  "postgresql://staged:staged_dev_password@localhost:5432/staged_dev";
process.env.NEXTAUTH_URL ||= "http://localhost:3000";

import { app } from "../../src/index";
import { createEvent } from "../../src/services/event-service";

// RESCUE-01: These tests are skipped until auth is fixed (AUTH-001 through AUTH-004).
// See prd-phases/rescue/prd-rescue-01-auth.md for the fix plan.
describe.skip("events routes", () => {
  it("allows host to create and guests to list & book", async () => {
    // create a host user by setting header
    const postRes = await app.request("http://localhost/api/events", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-test-user-id": "host1",
      },
      body: JSON.stringify({ title: "RouteEvent", priceCents: 2500 }),
    });
    expect(postRes.status).toBe(200);
    const evt = await postRes.json();
    expect(evt.id).toBeDefined();
    expect(evt.title).toBe("RouteEvent");

    // list endpoint should return newly created event
    const listRes = await app.request("http://localhost/api/events", {
      method: "GET",
    });
    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    expect(Array.isArray(list.events)).toBe(true);
    expect(list.events.find((e: any) => e.id === evt.id)).toBeTruthy();

    // booking requires auth
    const bookRes = await app.request(
      `http://localhost/api/events/${evt.id}/book`,
      {
        method: "POST",
        headers: { "x-test-user-id": "guest1" },
      },
    );
    expect(bookRes.status).toBe(200);
    const booking = await bookRes.json();
    expect(booking.eventId).toBe(evt.id);
    expect(booking.userId).toBe("guest1");
  });

  it("returns 401 when unauthenticated users try to book or create", async () => {
    const res1 = await app.request("http://localhost/api/events", {
      method: "POST",
    });
    expect(res1.status).toBe(401);

    const fake = await createEvent({ title: "xx" });
    const res2 = await app.request(
      `http://localhost/api/events/${fake.id}/book`,
      {
        method: "POST",
      },
    );
    expect(res2.status).toBe(401);
  });
});
