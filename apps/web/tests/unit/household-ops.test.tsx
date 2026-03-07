import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import HouseholdOps from '../../src/routes/HouseholdOps'
import { apiClient } from '../../src/lib/api-client'

vi.mock('../../src/lib/api-client')

describe('HouseholdOps page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // stub onboarding store hook to return fixed householdId
    vi.mock('../../src/lib/onboarding-store', () => ({
      useOnboardingStore: () => ({ householdId: 'hid' }),
    }))
  })

  it('renders forms and fetches history/rotation on load', async () => {
    vi.mocked(apiClient.households.costHistory).mockResolvedValue([])
    vi.mocked(apiClient.households.getRotation).mockResolvedValue(null)
    vi.mocked(apiClient.households.getRotationAssignments).mockResolvedValue([])

    render(<HouseholdOps />)
    expect(await screen.findByTestId('household-ops')).toBeTruthy()
    expect(apiClient.households.costHistory).toHaveBeenCalledWith('hid')
    expect(apiClient.households.getRotation).toHaveBeenCalledWith('hid')
  })

  it('submits cost and updates history display', async () => {
    const entry = { id: 'e1', date: '2025-01-01T00:00:00Z', total: 50, splits: { user1: 50 } }
    vi.mocked(apiClient.households.costHistory).mockResolvedValue([])
    vi.mocked(apiClient.households.addCost).mockResolvedValue(entry)

    render(<HouseholdOps />)
    fireEvent.change(screen.getByTestId('cost-input'), { target: { value: '50' } })
    fireEvent.click(screen.getByTestId('cost-submit'))

    expect(await screen.findByText('user1: $50.00')).toBeVisible()
  })

  it('sets rotation and shows assignments', async () => {
    vi.mocked(apiClient.households.costHistory).mockResolvedValue([])
    vi.mocked(apiClient.households.getRotation).mockResolvedValue(null)
    vi.mocked(apiClient.households.getRotationAssignments).mockResolvedValue([])
    const settings = { householdId: 'hid', frequency: 'weekly', members: ['a','b'], startDate: '2025-01-01' }
    const assigns = [{ date: '2025-01-01', userId: 'a' }]
    vi.mocked(apiClient.households.setRotation).mockResolvedValue(settings)
    vi.mocked(apiClient.households.getRotationAssignments).mockResolvedValue(assigns)

    render(<HouseholdOps />)
    fireEvent.change(screen.getByTestId('rotation-members'), { target: { value: 'a,b' } })
    fireEvent.click(screen.getByTestId('rotation-submit'))

    expect(await screen.findByTestId('rotation-settings')).toBeVisible()
    expect(screen.getByText('a')).toBeVisible()
    expect(await screen.findByTestId('rotation-assignments')).toBeVisible()
  })
})