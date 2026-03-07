import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../lib/api-client'
import {
  type ConnectionStatus,
  joinHousehold,
  leaveHousehold,
  onConnectionChange,
  getSocket,
} from '../lib/socket'
import { enqueue, flushQueue } from '../lib/sync-queue'
import { useOnboardingStore } from '../lib/onboarding-store'
import type { GroceryListItem } from '@staged/types'

// ---- Types (local, not crossing into packages/types) ----

interface MealEntry {
  id: string
  recipeId: string
  recipeTitle?: string
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner'
}

interface WeekPlan {
  plan: { id: string }
  entries: MealEntry[]
}

interface GroceryList {
  id: string
  name?: string
  items: GroceryListItem[]
}

// ---- Helpers ----

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d)
  result.setDate(result.getDate() + n)
  return result
}

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const colors: Record<ConnectionStatus, string> = {
    connected: 'bg-green-500',
    connecting: 'bg-yellow-400',
    disconnected: 'bg-stone-400',
  }
  return (
    <span
      data-testid="connection-badge"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${colors[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
      {status}
    </span>
  )
}

// ---- Main Component ----

export default function Planning() {
  const { householdId } = useOnboardingStore()
  const hid = householdId ?? 'demo-household'

  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(new Date()))
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null)
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const [pendingSync, setPendingSync] = useState(0)

  const startStr = formatDate(weekStart)

  // Load weekly plan
  const loadPlan = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.plans.getWeek(hid, startStr)
      setWeekPlan(data)
    } catch {
      setWeekPlan({ plan: { id: 'offline' }, entries: [] })
    } finally {
      setLoading(false)
    }
  }, [hid, startStr])

  useEffect(() => {
    loadPlan()
  }, [loadPlan])

  // Socket.io setup
  useEffect(() => {
    const unsub = onConnectionChange(setConnectionStatus)
    joinHousehold(hid)

    const socket = getSocket()
    const onAssign = (data: { entry: unknown }) => {
      setWeekPlan((prev) => {
        if (!prev) return prev
        return { ...prev, entries: [...prev.entries, data.entry as MealEntry] }
      })
    }
    const onRemove = (data: { entryId: string }) => {
      setWeekPlan((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          entries: prev.entries.filter((e) => e.id !== data.entryId),
        }
      })
    }
    socket.on('plan:recipe:assign', onAssign)
    socket.on('plan:recipe:remove', onRemove)

    return () => {
      unsub()
      leaveHousehold(hid)
      socket.off('plan:recipe:assign', onAssign)
      socket.off('plan:recipe:remove', onRemove)
    }
  }, [hid])

  const handleGenerateList = async () => {
    if (!weekPlan) return
    setListLoading(true)
    try {
      const generated = (await apiClient.plans.generateList(weekPlan.plan.id)) as GroceryList
      setGroceryList(generated)
    } catch {
      // queue for sync when offline
      await enqueue('generate-list', { planId: weekPlan.plan.id })
      setPendingSync((n) => n + 1)
    } finally {
      setListLoading(false)
    }
  }

  const handleToggleItem = async (item: GroceryListItem) => {
    if (!groceryList) return
    // optimistic update
    setGroceryList((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === item.id ? { ...i, checked: !i.checked } : i
        ),
      }
    })
    try {
      await apiClient.lists.toggleItem(groceryList.id, item.id)
    } catch {
      await enqueue('toggle-item', { listId: groceryList.id, itemId: item.id })
      setPendingSync((n) => n + 1)
    }
  }

  const handleCopyWeek = async () => {
    const nextWeek = formatDate(addDays(weekStart, 7))
    try {
      await apiClient.plans.copyWeek(hid, startStr, nextWeek)
      // Navigate to next week
      setWeekStart(addDays(weekStart, 7))
    } catch {
      await enqueue('copy-week', { from: startStr, to: nextWeek })
      setPendingSync((n) => n + 1)
    }
  }

  const handleFlushQueue = async () => {
    await flushQueue()
    setPendingSync(0)
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div data-testid="planning-page" className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-stone-900">Meal Plan</h1>
        <div className="flex items-center gap-3">
          <ConnectionBadge status={connectionStatus} />
          {pendingSync > 0 && (
            <button
              data-testid="sync-queue-badge"
              onClick={handleFlushQueue}
              className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full border border-amber-300"
            >
              {pendingSync} queued &mdash; tap to sync
            </button>
          )}
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-3 mb-6" data-testid="week-nav">
        <button
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm hover:bg-stone-50"
        >
          &larr; Prev
        </button>
        <span className="text-sm font-medium text-stone-700">
          {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &ndash;{' '}
          {addDays(weekStart, 6).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm hover:bg-stone-50"
        >
          Next &rarr;
        </button>
        <button
          onClick={handleCopyWeek}
          data-testid="copy-week-btn"
          className="ml-auto px-3 py-1.5 border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-50"
        >
          Copy to next week
        </button>
      </div>

      {/* Weekly calendar grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-400" data-testid="loading-indicator">
          Loading plan...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table
            data-testid="week-calendar"
            className="w-full border-collapse text-sm"
          >
            <thead>
              <tr>
                <th className="w-24 py-2 text-left text-stone-500 font-normal">Meal</th>
                {weekDays.map((d) => (
                  <th
                    key={formatDate(d)}
                    className="py-2 text-center text-stone-700 font-medium min-w-[100px]"
                  >
                    {d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEAL_TYPES.map((meal) => (
                <tr key={meal} className="border-t border-stone-100">
                  <td className="py-3 pr-3 text-stone-500 capitalize font-medium">{meal}</td>
                  {weekDays.map((d) => {
                    const dateStr = formatDate(d)
                    const entry = weekPlan?.entries.find(
                      (e) => e.date === dateStr && e.mealType === meal
                    )
                    return (
                      <td key={dateStr} className="py-2 px-1">
                        {entry ? (
                          <div
                            data-testid="meal-entry"
                            className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-800 font-medium leading-snug"
                          >
                            {entry.recipeTitle ?? entry.recipeId}
                          </div>
                        ) : (
                          <div className="h-10 border border-dashed border-stone-200 rounded-lg flex items-center justify-center text-stone-300 text-xs">
                            +
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate grocery list */}
      <div className="mt-8 border-t border-stone-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900">Grocery List</h2>
          <button
            data-testid="generate-list-btn"
            onClick={handleGenerateList}
            disabled={listLoading || !weekPlan}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {listLoading ? 'Generating...' : 'Generate from plan'}
          </button>
        </div>

        {groceryList ? (
          <ul data-testid="grocery-list" className="space-y-2">
            {groceryList.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 p-3 border border-stone-100 rounded-xl"
              >
                <button
                  onClick={() => handleToggleItem(item)}
                  data-testid={`item-check-${item.id}`}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    item.checked
                      ? 'border-green-500 bg-green-500'
                      : 'border-stone-300'
                  }`}
                >
                  {item.checked && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  )}
                </button>
                <span className={`text-sm ${item.checked ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                  {item.name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-400 text-sm">
            Generate a grocery list from your meal plan above.
          </p>
        )}
      </div>

      {/* Link to fulfillment */}
      {groceryList && groceryList.items.length > 0 && (
        <div className="mt-6">
          <Link
            to="/fulfillment"
            data-testid="fulfill-link"
            className="block w-full py-3 rounded-xl bg-green-600 text-white font-medium text-center hover:bg-green-700"
          >
            Order on Instacart &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}
