// Wake Lock API wrapper with graceful fallback.
// Prevents screen from turning off during cooking mode.
// CLAUDE.md: Screen Wake Lock required in cooking view.

type WakeLockSentinel = { release: () => Promise<void>; released: boolean }

let sentinel: WakeLockSentinel | null = null

export function isWakeLockSupported(): boolean {
  return 'wakeLock' in navigator
}

export async function acquireWakeLock(): Promise<boolean> {
  if (!isWakeLockSupported()) return false
  try {
    sentinel = await (navigator as any).wakeLock.request('screen')
    return true
  } catch {
    return false
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (sentinel && !sentinel.released) {
    await sentinel.release()
    sentinel = null
  }
}
