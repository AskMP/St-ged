import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiClient } from '../lib/api-client'
import type { FulfillmentLink, FulfillmentProvider, SponsoredItem } from '@staged/types'

interface Bundle {
  name: string
  description: string
}

export default function FulfillmentPage() {
  const [searchParams] = useSearchParams()
  const listId = searchParams.get('listId')

  const [providers, setProviders] = useState<FulfillmentProvider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<FulfillmentProvider>('instacart')

  const [linkData, setLinkData] = useState<FulfillmentLink | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  // fetch available providers once
  useEffect(() => {
    if (!listId) return
    apiClient.fulfillment
      .getProviders()
      .then((res) => {
        setProviders(res.providers)
        if (res.default) setSelectedProvider(res.default as FulfillmentProvider)
        else if (res.providers.includes('instacart')) {
          setSelectedProvider('instacart')
        }
      })
      .catch(() => {
        // ignore; providers list is optional
      })
  }, [listId])

  // whenever listId or selectedProvider changes, regenerate link
  useEffect(() => {
    if (!listId) return
    setLoading(true)
    setError(null)
    setNote(null)
    apiClient.fulfillment
      .generateLink(listId, selectedProvider)
      .then((data) => {
        setLinkData(data)
        if (data.provider && data.provider !== selectedProvider) {
          setNote(`Using available provider: ${data.provider.replace('-', ' ')}`)
          setSelectedProvider(data.provider as FulfillmentProvider)
        }
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to generate link')
      )
      .finally(() => setLoading(false))
  }, [listId, selectedProvider])

  return (
    <div data-testid="fulfillment-page" className="max-w-lg mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/planning"
          className="text-sm text-stone-400 hover:text-stone-600 mb-3 inline-block"
        >
          &larr; Back to plan
        </Link>
        <h1 className="text-2xl font-bold text-stone-900">Deliver Me This</h1>
        <p className="text-sm text-stone-500 mt-1">
          Review your grocery order before heading to Instacart.
        </p>
      </div>

      {/* Attribution disclosure -- always visible */}
      <div
        data-testid="attribution-disclosure"
        className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800"
      >
        <strong>Affiliate disclosure:</strong> Staged earns a small commission on qualifying
        Instacart orders placed through this link. Your price is the same.
      </div>

      {/* Provider selector */}
      {providers.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Order with
          </label>
          <select
            data-testid="provider-select"
            value={selectedProvider}
            onChange={(e) =>
              setSelectedProvider(e.target.value as FulfillmentProvider)
            }
            className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            {providers.map((p) => (
              <option key={p} value={p}>
                {p.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      )}

      {note && (
        <div
          data-testid="provider-note"
          className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800"
        >
          {note}
        </div>
      )}

      {/* No list selected */}
      {!listId && (
        <div
          data-testid="no-list-message"
          className="text-center py-12 text-stone-400"
        >
          <p className="text-sm">No grocery list selected.</p>
          <Link
            to="/planning"
            className="mt-3 inline-block text-sm text-green-600 hover:underline"
          >
            Go to your meal plan
          </Link>
        </div>
      )}

      {/* Loading */}
      {listId && loading && (
        <div
          data-testid="fulfillment-loading"
          className="text-center py-12 text-stone-400 text-sm"
        >
          Preparing your Instacart order...
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          data-testid="fulfillment-error"
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
        >
          <strong>Could not generate link:</strong> {error}
        </div>
      )}

      {/* Link data ready */}
      {linkData && (
        <>
          {/* Smart Bundle upsells */}
          {linkData.bundles && linkData.bundles.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-stone-700 mb-2">
                Smart Bundle suggestions
              </h2>
              <ul
                data-testid="bundle-list"
                className="space-y-2"
              >
                {linkData.bundles.map((bundle) => (
                  <li
                    key={bundle.name}
                    data-testid="bundle-item"
                    className="p-3 bg-green-50 border border-green-200 rounded-xl"
                  >
                    <p className="text-sm font-medium text-green-900">{bundle.name}</p>
                    <p className="text-xs text-green-700 mt-0.5">{bundle.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Partner attribution metadata */}
          <div
            data-testid="partner-attribution"
            className="mb-6 text-xs text-stone-400"
          >
            Affiliate ID: {linkData.attribution.affiliate}
          </div>

          {/* Sponsored placements (Chicory) */}
          {linkData.sponsoredItems && linkData.sponsoredItems.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-stone-700 mb-2">
                Sponsored items
              </h2>
              <ul className="space-y-2" data-testid="sponsored-list">
                {linkData.sponsoredItems.map((item) => (
                  <li
                    key={item.name + item.brand}
                    className="p-2 bg-yellow-50 border border-yellow-200 rounded"
                  >
                    <p className="text-sm font-medium text-yellow-800">
                      {item.name} ({item.brand}) - ${item.price.toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <a
            data-testid="instacart-cta"
            href={linkData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 rounded-xl bg-green-600 text-white font-semibold text-center text-lg hover:bg-green-700 active:scale-95 transition-transform"
          >
            Order with {linkData.provider.replace('-', ' ')}
          </a>
          <p className="text-center text-xs text-stone-400 mt-2">
            Opens {linkData.provider.replace('-', ' ')} in a new tab
          </p>
        </>
      )}
    </div>
  )
}
