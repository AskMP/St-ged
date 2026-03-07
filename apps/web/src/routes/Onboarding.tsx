import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api-client'
import {
  isInstallAvailable,
  onInstallAvailable,
  promptInstall,
  requestPersistentStorage,
} from '../lib/install'
import {
  type DietaryFlag,
  type SkillLevel,
  useOnboardingStore,
} from '../lib/onboarding-store'

// ---- helpers ----

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1 mb-6" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full ${i < current ? 'bg-green-500' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">{children}</div>
    </div>
  )
}

// ---- Steps ----

function WelcomeStep() {
  const { setStep, setUser, setDisplayName } = useOnboardingStore()
  const [mode, setMode] = useState<'signup' | 'signin' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setError('')
    setLoading(true)
    try {
      await apiClient.auth.signup(email, password, name)
      const me = await apiClient.auth.me()
      setDisplayName(me.name)
      setUser(me.id, null)
      setStep('skill')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign-up failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = async () => {
    setError('')
    setLoading(true)
    try {
      const { userId } = await apiClient.auth.guest()
      setDisplayName('Guest')
      setUser(userId, null)
      setStep('skill')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not start guest session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Stàged</h1>
        <p className="mt-2 text-stone-500">Cook together, shop smarter.</p>
      </div>

      {!mode && (
        <div className="space-y-3">
          <button
            onClick={() => setMode('signup')}
            className="w-full py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700"
          >
            Create account
          </button>
          <button
            onClick={handleGuest}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-stone-200 text-stone-700 font-medium hover:bg-stone-50"
          >
            {loading ? 'Starting...' : 'Continue as guest'}
          </button>
        </div>
      )}

      {mode === 'signup' && (
        <div className="space-y-4">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            placeholder="Password (8+ chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
          <button onClick={() => setMode(null)} className="w-full text-sm text-stone-400">
            Back
          </button>
        </div>
      )}
    </Card>
  )
}

function SkillStep() {
  const { skillLevel, setSkillLevel, setStep } = useOnboardingStore()

  const options: { value: SkillLevel; label: string; desc: string }[] = [
    { value: 'beginner', label: 'Beginner', desc: 'I follow recipes step by step' },
    { value: 'intermediate', label: 'Intermediate', desc: 'I can improvise a bit' },
    { value: 'advanced', label: 'Advanced', desc: 'I cook from memory' },
  ]

  return (
    <Card>
      <StepIndicator current={1} total={5} />
      <h2 className="text-2xl font-bold text-stone-900 mb-2">Your skill level</h2>
      <p className="text-stone-500 text-sm mb-6">We'll tailor recipe guidance for you.</p>
      <div className="space-y-3">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => setSkillLevel(o.value)}
            className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-colors ${
              skillLevel === o.value
                ? 'border-green-500 bg-green-50'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="font-medium text-stone-900">{o.label}</div>
            <div className="text-sm text-stone-500">{o.desc}</div>
          </button>
        ))}
      </div>
      <button
        onClick={() => setStep('household')}
        disabled={!skillLevel}
        className="mt-6 w-full py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-40"
      >
        Next
      </button>
    </Card>
  )
}

function HouseholdStep() {
  const { householdSize, setHouseholdSize, setStep } = useOnboardingStore()

  const sizes = [1, 2, 3, 4, 5]

  return (
    <Card>
      <StepIndicator current={2} total={5} />
      <h2 className="text-2xl font-bold text-stone-900 mb-2">Household size</h2>
      <p className="text-stone-500 text-sm mb-6">We'll scale recipes and portions for you.</p>
      <div className="flex gap-3 flex-wrap">
        {sizes.map((n) => (
          <button
            key={n}
            onClick={() => setHouseholdSize(n)}
            className={`w-16 h-16 rounded-xl border-2 font-bold text-lg transition-colors ${
              householdSize === n
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-stone-200 text-stone-700 hover:border-stone-300'
            }`}
          >
            {n === 5 ? '5+' : n}
          </button>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setStep('skill')}
          className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-medium"
        >
          Back
        </button>
        <button
          onClick={() => setStep('dietary')}
          disabled={!householdSize}
          className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </Card>
  )
}

function DietaryStep() {
  const { dietary, toggleDietary, setStep } = useOnboardingStore()

  const flags: { value: DietaryFlag; label: string }[] = [
    { value: 'vegan', label: 'Vegan' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'gluten-free', label: 'Gluten-free' },
    { value: 'dairy-free', label: 'Dairy-free' },
    { value: 'nut-free', label: 'Nut-free' },
  ]

  return (
    <Card>
      <StepIndicator current={3} total={5} />
      <h2 className="text-2xl font-bold text-stone-900 mb-2">Dietary preferences</h2>
      <p className="text-stone-500 text-sm mb-6">Select all that apply. Skip to continue.</p>
      <div className="flex flex-wrap gap-2">
        {flags.map((f) => (
          <button
            key={f.value}
            onClick={() => toggleDietary(f.value)}
            className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors ${
              dietary.includes(f.value)
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setStep('household')}
          className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-medium"
        >
          Back
        </button>
        <button
          onClick={() => setStep('pantry')}
          className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700"
        >
          Next
        </button>
      </div>
    </Card>
  )
}

function PantryStep() {
  const { pantryTemplate, setPantryTemplate, householdId, setStep } = useOnboardingStore()
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')

  const templates = [
    {
      value: 'basic',
      label: 'Essential kitchen',
      desc: 'Salt, flour, sugar — the basics everyone needs.',
    },
    {
      value: 'vegan',
      label: 'Plant-based',
      desc: 'Oils, beans, and staples for plant-based cooking.',
    },
  ]

  const handleNext = async () => {
    if (pantryTemplate && householdId) {
      setApplying(true)
      try {
        await apiClient.pantry.applyTemplate(householdId, pantryTemplate)
      } catch {
        setError('Could not save pantry — you can update it later.')
      } finally {
        setApplying(false)
      }
    }
    setStep('install')
  }

  return (
    <Card>
      <StepIndicator current={4} total={5} />
      <h2 className="text-2xl font-bold text-stone-900 mb-2">Starter pantry</h2>
      <p className="text-stone-500 text-sm mb-6">
        Stock your virtual pantry so recipes know what you have. Skip to set it up later.
      </p>
      <div className="space-y-3">
        {templates.map((t) => (
          <button
            key={t.value}
            onClick={() => setPantryTemplate(pantryTemplate === t.value ? null : t.value)}
            className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-colors ${
              pantryTemplate === t.value
                ? 'border-green-500 bg-green-50'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="font-medium text-stone-900">{t.label}</div>
            <div className="text-sm text-stone-500">{t.desc}</div>
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setStep('dietary')}
          className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-medium"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={applying}
          className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {applying ? 'Saving...' : 'Next'}
        </button>
      </div>
    </Card>
  )
}

function InstallStep() {
  const { setStep } = useOnboardingStore()
  const [installable, setInstallable] = useState(isInstallAvailable())
  const [installed, setInstalled] = useState(false)
  const [storageGranted, setStorageGranted] = useState<boolean | null>(null)

  useEffect(() => {
    const unsub = onInstallAvailable(() => setInstallable(true))
    requestPersistentStorage().then((granted) => setStorageGranted(granted))
    return unsub
  }, [])

  const handleInstall = async () => {
    const result = await promptInstall()
    if (result !== 'unavailable') setInstalled(true)
  }

  return (
    <Card>
      <StepIndicator current={5} total={5} />
      <h2 className="text-2xl font-bold text-stone-900 mb-2">Add to Home Screen</h2>
      <p className="text-stone-500 text-sm mb-4">
        Install Stàged to keep your recipes available offline -- even without signal. iOS clears
        browser cache after 7 days; installing prevents this.
      </p>

      {storageGranted === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
          Your browser did not grant persistent storage. Recipes may be cleared if you run low on
          space. Installing the app helps.
        </div>
      )}

      {installable && !installed && (
        <button
          onClick={handleInstall}
          className="w-full py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 mb-3"
        >
          Add to Home Screen
        </button>
      )}

      {installed && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-sm text-green-800 font-medium">
          Installed! Your recipes will be available offline.
        </div>
      )}

      <button
        onClick={() => setStep('done')}
        className="w-full py-3 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50"
      >
        {installed ? 'Continue' : 'Skip for now'}
      </button>
    </Card>
  )
}

// ---- Root Component ----

export default function Onboarding() {
  const { step, setStep } = useOnboardingStore()
  const navigate = useNavigate()

  // If onboarding is done, redirect to recipes
  useEffect(() => {
    if (step === 'done') {
      navigate('/recipes')
    }
  }, [step, navigate])

  // Allow skipping back to welcome if userId not yet set
  if (step === 'done') return null

  return (
    <div data-testid="onboarding">
      {step === 'welcome' && <WelcomeStep />}
      {step === 'skill' && <SkillStep />}
      {step === 'household' && <HouseholdStep />}
      {step === 'dietary' && <DietaryStep />}
      {step === 'pantry' && <PantryStep />}
      {step === 'install' && <InstallStep />}
    </div>
  )
}
