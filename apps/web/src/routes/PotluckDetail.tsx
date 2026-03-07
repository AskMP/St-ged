import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient } from '../lib/api-client'
import type { PotluckEvent, PotluckSlot } from '@staged/types'

export default function PotluckDetail() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<PotluckEvent | null>(null)
  const [loading, setLoading] = useState(false)
  const [guestName, setGuestName] = useState('')

  const load = async () => {
    if (!id) return
    setLoading(true)
    try {
      const evt = await apiClient.potluck.get(id)
      setEvent(evt)
    } catch {
      setEvent(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const handleClaim = async (slotId: string) => {
    if (!id || !guestName) return
    try {
      await apiClient.potluck.claim(id, slotId, guestName)
      setGuestName('')
      load()
    } catch {
      // ignore
    }
  }

  if (loading) return <p>Loading...</p>
  if (!event) return <p>Event not found</p>

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4">{event.title || '(untitled)'}</h1>
      <ul className="space-y-2">
        {event.slots.map((slot) => (
          <li key={slot.id} className="border p-3 rounded flex justify-between items-center">
            <span>{slot.description || 'slot'}</span>
            {slot.guestName ? (
              <span className="text-stone-500">Taken by {slot.guestName}</span>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="border rounded p-1"
                />
                <button
                  onClick={() => handleClaim(slot.id)}
                  className="px-2 py-1 bg-green-500 text-white rounded"
                >
                  Claim
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
