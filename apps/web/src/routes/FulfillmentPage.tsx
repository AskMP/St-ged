import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiClient } from '../lib/api-client'

interface Bundle {
  name: string
  description: string
}

interface FulfillmentLink {
  url: string
  token: string
  attribution: { affiliate: string }
  bundles?: Bundle[]
}

export default function FulfillmentPage() {
  const [searchParams] = useSearchParams()
  const listId = searchParams.get('listId')

  const [linkData, setLinkData] = useState<FulfillmentLink | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!listId) return
    setLoading(true)
    setError(null)
    apiClient.fulfillment
      .generateLink(listId)
      .then((data) => setLinkData(data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to generate link')
      )
      .finally(() => setLoading(false))
  }, [listId])

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

          {/* CTA */}
          <a
            data-testid="instacart-cta"
            href={linkData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 rounded-xl bg-green-600 text-white font-semibold text-center text-lg hover:bg-green-700 active:scale-95 transition-transform"
          >
            Order on Instacart
          </a>
          <p className="text-center text-xs text-stone-400 mt-2">
            Opens Instacart in a new tab
          </p>
        </>
      )}
    </div>
  )
}
