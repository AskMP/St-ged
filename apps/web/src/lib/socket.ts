// Socket.io client singleton for real-time household sync.
// Follows CLAUDE.md: one room per household; typed via ServerToClientEvents.

import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@staged/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    socket = io(BASE_URL, {
      autoConnect: false,
      withCredentials: true,
    })
  }
  return socket
}

export function joinHousehold(householdId: string): void {
  const s = getSocket()
  if (!s.connected) s.connect()
  s.emit('household:join', householdId)
}

export function leaveHousehold(householdId: string): void {
  const s = getSocket()
  s.emit('household:leave', householdId)
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

export function onConnectionChange(cb: (status: ConnectionStatus) => void): () => void {
  const s = getSocket()
  const onConnect = () => cb('connected')
  const onDisconnect = () => cb('disconnected')
  const onConnecting = () => cb('connecting')
  s.on('connect', onConnect)
  s.on('disconnect', onDisconnect)
  s.io.on('reconnect_attempt', onConnecting)
  return () => {
    s.off('connect', onConnect)
    s.off('disconnect', onDisconnect)
    s.io.off('reconnect_attempt', onConnecting)
  }
}
