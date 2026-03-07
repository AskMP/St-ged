// Socket.io event types

export interface ServerToClientEvents {
  'list:item:add': (data: { item: unknown }) => void
  'list:item:check': (data: { itemId: string; checked: boolean }) => void
  'list:item:remove': (data: { itemId: string }) => void
  'plan:recipe:assign': (data: { entry: unknown }) => void
  'plan:recipe:remove': (data: { entryId: string }) => void
}

export interface ClientToServerEvents {
  'household:join': (householdId: string) => void
  'household:leave': (householdId: string) => void
}
