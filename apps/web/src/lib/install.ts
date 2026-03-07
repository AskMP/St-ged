// Singleton for capturing the beforeinstallprompt event.
// Components subscribe to this to trigger the A2HS prompt on demand.

type InstallPromptEvent = Event & { prompt: () => Promise<void> }

let deferred: InstallPromptEvent | null = null
const listeners = new Set<() => void>()

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferred = e as InstallPromptEvent
  listeners.forEach((l) => l())
})

export function onInstallAvailable(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function isInstallAvailable(): boolean {
  return deferred !== null
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferred) return 'unavailable'
  await deferred.prompt()
  deferred = null
  return 'accepted'
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  return navigator.storage.persist()
}
