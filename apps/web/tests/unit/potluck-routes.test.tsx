import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import Potluck from '../../src/routes/Potluck'
import PotluckDetail from '../../src/routes/PotluckDetail'
import { apiClient } from '../../src/lib/api-client'

vi.mock('../../src/lib/api-client', () => ({
  apiClient: {
    potluck: {
      list: vi.fn(),
      create: vi.fn(),
      get: vi.fn(),
      claim: vi.fn(),
    },
  },
}))

beforeEach(() => {
  // reset mocks
  vi.mocked(apiClient.potluck.list).mockReset()
  vi.mocked(apiClient.potluck.create).mockReset()
  vi.mocked(apiClient.potluck.get).mockReset()
  vi.mocked(apiClient.potluck.claim).mockReset()
})

describe('Potluck pages', () => {
  it('renders event list and create button', async () => {
    vi.mocked(apiClient.potluck.list).mockResolvedValue({ events: [] })
    render(
      <MemoryRouter initialEntries={["/potluck"]}>
        <Routes>
          <Route path="/potluck" element={<Potluck />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText(/Potluck Events/)).toBeInTheDocument()
    await waitFor(() => {
      expect(apiClient.potluck.list).toHaveBeenCalled()
    })
  })

  it('shows event detail with slots and allows claim', async () => {
    const evt = { id: 'e1', title: 'Party', slots: [{ id: 's1', description: 'Salad' }] }
    vi.mocked(apiClient.potluck.get).mockResolvedValue(evt)
    vi.mocked(apiClient.potluck.claim).mockResolvedValue(evt)
    render(
      <MemoryRouter initialEntries={["/potluck/e1"]}>
        <Routes>
          <Route path="/potluck/:id" element={<PotluckDetail />} />
        </Routes>
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(apiClient.potluck.get).toHaveBeenCalledWith('e1')
    })
    expect(screen.getByText('Party')).toBeInTheDocument()
    const input = screen.getByPlaceholderText('Your name')
    fireEvent.change(input, { target: { value: 'Sam' } })
    const btn = screen.getByText('Claim')
    fireEvent.click(btn)
    await waitFor(() => {
      expect(apiClient.potluck.claim).toHaveBeenCalledWith('e1', 's1', 'Sam')
    })
  })

  it('shows locked state when slot has lockedUntil', async () => {
    const future = new Date(Date.now() + 60000).toISOString()
    const evt = { id: 'e2', title: 'Locked Event', slots: [{ id: 's1', description: 'Dish', lockedUntil: future }] }
    vi.mocked(apiClient.potluck.get).mockResolvedValue(evt)
    render(
      <MemoryRouter initialEntries={["/potluck/e2"]}>
        <Routes>
          <Route path="/potluck/:id" element={<PotluckDetail />} />
        </Routes>
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(apiClient.potluck.get).toHaveBeenCalledWith('e2')
    })
    expect(screen.getByText(/Locked until/)).toBeInTheDocument()
  })
})