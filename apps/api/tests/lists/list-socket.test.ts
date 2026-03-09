// socket tests will require server running; we can simulate via io-client

process.env.NEXTAUTH_SECRET ||= "test-secret";
process.env.DATABASE_URL ||=
  "postgresql://staged:staged_dev_password@localhost:5432/staged_dev";
process.env.NEXTAUTH_URL ||= "http://localhost:3000";

import http from "node:http";
import { randomUUID } from "crypto";
import { io as clientIo } from "socket.io-client";
import { app } from "../../src/index";
import { createSocketIOserver } from "../../src/lib/socket";
import { db } from "../../src/lib/db";
import { users } from "@staged/db";
import { createHousehold } from "../../src/services/household-service";
import * as listService from "../../src/services/list-service";

async function createTestUser(): Promise<string> {
  const id = randomUUID();
  await db
    .insert(users)
    .values({ id, email: `test-${id}@example.com`, displayName: "Test" })
    .onConflictDoNothing();
  return id;
}

let httpServer: http.Server;
let client: any;

beforeAll(async () => {
  httpServer = http.createServer(app.fetch as any);
  // initialize shared IO instance for service and tests
  createSocketIOserver(httpServer);
  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  const port = (httpServer.address() as any).port;
  client = clientIo(`http://localhost:${port}`);
});

afterAll(async () => {
  if (client) client.close();
  await new Promise<void>((resolve) => httpServer.close(resolve));
});

describe("list socket integration", () => {
  it("emits mutation events to household room", async () => {
    const userId = await createTestUser();
    const { id: hid } = await createHousehold("SocketHouse", userId);

    // wait for connection and join; handle both "already connected" and "not yet connected"
    await new Promise<void>((resolve) => {
      const joinRoom = () => {
        client.emit("household:join", hid, () => {
          resolve();
        });
      };
      if (client.connected) {
        joinRoom();
      } else {
        client.once("connect", joinRoom);
      }
    });

    const list = await listService.createList(hid, userId);

    const added = new Promise<any>((res) => {
      client.on("list:item:add", (data: any) => res(data));
    });
    const toggled = new Promise<any>((res) => {
      client.on("list:item:check", (data: any) => res(data));
    });
    const removed = new Promise<any>((res) => {
      client.on("list:item:remove", (data: any) => res(data));
    });

    const item = await listService.addItem(list.id, "Eggs", userId);
    const addedData = await added;
    expect(addedData.item.id).toBe(item.id);

    const toggledItem = await listService.toggleItem(item.id, userId);
    const toggledData = await toggled;
    expect(toggledData.itemId).toBe(item.id);
    expect(toggledData.checked).toBe(toggledItem.checked);

    await listService.deleteItem(item.id, userId);
    const removedData = await removed;
    expect(removedData.itemId).toBe(item.id);
  });
});
