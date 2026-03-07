import { useEffect, useState } from 'react'
import { apiClient } from '../lib/api-client'
import { Link } from 'react-router-dom'
import type { PotluckEvent, PotluckSlot } from '@staged/types'

export default function Potluck() {
  const [events, setEvents] = useState<PotluckEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const resp = await apiClient.potluck.list()
      setEvents(resp.events)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    if (!newTitle) return
    try {
      await apiClient.potluck.create({ title: newTitle, slots: [] })
      setNewTitle('')
      load()
    } catch {
      // ignore for now
    }
  }

  return (
    <div data-testid="potluck-page" className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4">Potluck Events</h1>
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="New event title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 border rounded p-2"
        />
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {events.map((evt) => (
            <li key={evt.id} className="border p-3 rounded">
              <Link to={`/potluck/${evt.id}`} data-testid="event-link" className="text-blue-600">
                {evt.title || '(untitled)'}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
