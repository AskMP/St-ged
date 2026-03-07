import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Onboarding from '../../src/routes/Onboarding'
import { useOnboardingStore } from '../../src/lib/onboarding-store'

// Reset onboarding store between tests
beforeEach(() => {
  useOnboardingStore.getState().reset()
})

function renderOnboarding() {
  return render(
    <MemoryRouter initialEntries={['/onboarding']}>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/recipes" element={<div>Recipes page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Onboarding', () => {
  it('renders the welcome step by default', () => {
    renderOnboarding()
    expect(screen.getByRole('heading', { name: /Stàged/i })).toBeInTheDocument()
    expect(screen.getByText(/Create account/i)).toBeInTheDocument()
    expect(screen.getByText(/Continue as guest/i)).toBeInTheDocument()
  })

  it('shows the sign-up form on "Create account" click', () => {
    renderOnboarding()
    fireEvent.click(screen.getByText('Create account'))
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password (8+ chars)')).toBeInTheDocument()
  })

  it('returns to choice view on Back click from sign-up form', () => {
    renderOnboarding()
    fireEvent.click(screen.getByText('Create account'))
    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByText('Create account')).toBeInTheDocument()
  })

  it('renders skill step when store step is skill', () => {
    act(() => useOnboardingStore.getState().setStep('skill'))
    renderOnboarding()
    expect(screen.getByText('Your skill level')).toBeInTheDocument()
    expect(screen.getByText('Beginner')).toBeInTheDocument()
    expect(screen.getByText('Intermediate')).toBeInTheDocument()
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })

  it('advances from skill to household on Next', () => {
    act(() => {
      useOnboardingStore.getState().setStep('skill')
      useOnboardingStore.getState().setSkillLevel('beginner')
    })
    renderOnboarding()
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText('Household size')).toBeInTheDocument()
  })

  it('Next is disabled on skill step until a level is selected', () => {
    act(() => useOnboardingStore.getState().setStep('skill'))
    renderOnboarding()
    expect(screen.getByText('Next')).toBeDisabled()
    fireEvent.click(screen.getByText('Beginner'))
    expect(screen.getByText('Next')).not.toBeDisabled()
  })

  it('renders dietary step with correct options', () => {
    act(() => useOnboardingStore.getState().setStep('dietary'))
    renderOnboarding()
    expect(screen.getByText('Dietary preferences')).toBeInTheDocument()
    expect(screen.getByText('Vegan')).toBeInTheDocument()
    expect(screen.getByText('Gluten-free')).toBeInTheDocument()
    expect(screen.getByText('Nut-free')).toBeInTheDocument()
  })

  it('toggles dietary flags', () => {
    act(() => useOnboardingStore.getState().setStep('dietary'))
    renderOnboarding()
    const veganBtn = screen.getByText('Vegan')
    fireEvent.click(veganBtn)
    expect(useOnboardingStore.getState().dietary).toContain('vegan')
    fireEvent.click(veganBtn)
    expect(useOnboardingStore.getState().dietary).not.toContain('vegan')
  })

  it('renders pantry step with template options', () => {
    act(() => useOnboardingStore.getState().setStep('pantry'))
    renderOnboarding()
    expect(screen.getByText('Starter pantry')).toBeInTheDocument()
    expect(screen.getByText('Essential kitchen')).toBeInTheDocument()
    expect(screen.getByText('Plant-based')).toBeInTheDocument()
  })

  it('renders install step with A2HS guidance', () => {
    act(() => useOnboardingStore.getState().setStep('install'))
    renderOnboarding()
    expect(screen.getByText('Add to Home Screen')).toBeInTheDocument()
    expect(screen.getByText(/offline/i)).toBeInTheDocument()
  })

  it('redirects to /recipes when step is done', () => {
    act(() => useOnboardingStore.getState().setStep('done'))
    renderOnboarding()
    expect(screen.getByText('Recipes page')).toBeInTheDocument()
  })

  it('renders step indicators for multi-step screens', () => {
    act(() => {
      useOnboardingStore.getState().setStep('skill')
      useOnboardingStore.getState().setSkillLevel('beginner')
    })
    renderOnboarding()
    expect(screen.getByLabelText('Step 1 of 5')).toBeInTheDocument()
  })
})
