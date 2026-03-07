import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import FulfillmentPage from '../../src/routes/FulfillmentPage'
import * as apiClient from '../../src/lib/api-client'

vi.mock('../../src/lib/api-client', () => ({
  apiClient: {
    fulfillment: {
      generateLink: vi.fn(),
    },
  },
}))

const mockLinkData = {
  url: 'https://www.instacart.com/store/1234/cart?affiliate_id=test&items=pasta',
  token: 'tok-abc',
  attribution: { affiliate: 'affiliate-test' },
  bundles: [
    { name: 'Premium Spices Pack', description: 'Add gourmet spices for 5% off' },
  ],
}

function renderFulfillment(search = '?listId=list-1') {
  return render(
    <MemoryRouter initialEntries={[`/fulfillment${search}`]}>
      <Routes>
        <Route path="/fulfillment" element={<FulfillmentPage />} />
        <Route path="/planning" element={<div>Planning</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.mocked(apiClient.apiClient.fulfillment.generateLink).mockResolvedValue(mockLinkData)
})

describe('FulfillmentPage', () => {
  it('renders the page heading', async () => {
    renderFulfillment()
    await waitFor(() => {
      expect(screen.getByTestId('fulfillment-page')).toBeInTheDocument()
    })
    expect(screen.getByText('Deliver Me This')).toBeInTheDocument()
  })

  it('always shows attribution disclosure', async () => {
    renderFulfillment()
    expect(screen.getByTestId('attribution-disclosure')).toBeInTheDocument()
    expect(screen.getByText(/Affiliate disclosure/)).toBeInTheDocument()
  })

  it('shows no-list message when listId is absent', async () => {
    renderFulfillment('')
    expect(screen.getByTestId('no-list-message')).toBeInTheDocument()
  })

  it('shows loading state while fetching', async () => {
    vi.mocked(apiClient.apiClient.fulfillment.generateLink).mockImplementation(
      () => new Promise(() => {}) // never resolves
    )
    renderFulfillment()
    expect(screen.getByTestId('fulfillment-loading')).toBeInTheDocument()
  })

  it('renders bundle suggestions after link is generated', async () => {
    renderFulfillment()
    await waitFor(() => {
      expect(screen.getByTestId('bundle-list')).toBeInTheDocument()
    })
    expect(screen.getByText('Premium Spices Pack')).toBeInTheDocument()
    expect(screen.getByText('Add gourmet spices for 5% off')).toBeInTheDocument()
  })

  it('renders partner attribution metadata', async () => {
    renderFulfillment()
    await waitFor(() => {
      expect(screen.getByTestId('partner-attribution')).toBeInTheDocument()
    })
    expect(screen.getByText(/affiliate-test/)).toBeInTheDocument()
  })

  it('renders Instacart CTA with correct href', async () => {
    renderFulfillment()
    await waitFor(() => {
      expect(screen.getByTestId('instacart-cta')).toBeInTheDocument()
    })
    const cta = screen.getByTestId('instacart-cta') as HTMLAnchorElement
    expect(cta.href).toContain('instacart.com')
    expect(cta.target).toBe('_blank')
  })

  it('shows error when API call fails', async () => {
    vi.mocked(apiClient.apiClient.fulfillment.generateLink).mockRejectedValue(
      new Error('Network error')
    )
    renderFulfillment()
    await waitFor(() => {
      expect(screen.getByTestId('fulfillment-error')).toBeInTheDocument()
    })
    expect(screen.getByText(/Network error/)).toBeInTheDocument()
  })

  it('calls generateLink with the correct listId', async () => {
    renderFulfillment('?listId=my-list-42')
    await waitFor(() => {
      expect(apiClient.apiClient.fulfillment.generateLink).toHaveBeenCalledWith('my-list-42')
    })
  })
})
