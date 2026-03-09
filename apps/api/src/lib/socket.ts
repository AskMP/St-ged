import { Server as SocketIOServer } from "socket.io";

export interface ServerToClientEvents {
  "list:item:add": (data: { item: unknown }) => void;
  "list:item:check": (data: { itemId: string; checked: boolean }) => void;
  "list:item:remove": (data: { itemId: string }) => void;
  "plan:recipe:assign": (data: { entry: unknown }) => void;
  "plan:recipe:remove": (data: { entryId: string }) => void;
}

export interface ClientToServerEvents {
  "household:join": (householdId: string) => void;
  "household:leave": (householdId: string) => void;
}

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null =
  null;

export function createSocketIOserver(
  httpServer: ReturnType<typeof import("http").createServer>,
) {
  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      cors: {
        origin: process.env.WEB_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
      },
    },
  );

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("household:join", (householdId: string, cb?: () => void) => {
      socket.join(`household:${householdId}`);
      console.log(`Socket ${socket.id} joined household:${householdId}`);
      if (cb) cb();
    });

    socket.on("household:leave", (householdId: string, cb?: () => void) => {
      socket.leave(`household:${householdId}`);
      console.log(`Socket ${socket.id} left household:${householdId}`);
      if (cb) cb();
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error(
      "Socket.io not initialized. Call createSocketIOserver first.",
    );
  }
  return io;
}

export function getIOInstance() {
  return io;
}
