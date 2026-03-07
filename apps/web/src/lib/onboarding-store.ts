import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'
export type DietaryFlag = 'vegan' | 'vegetarian' | 'gluten-free' | 'dairy-free' | 'nut-free'

export type OnboardingStep =
  | 'welcome'
  | 'skill'
  | 'household'
  | 'dietary'
  | 'pantry'
  | 'install'
  | 'done'

export interface OnboardingState {
  step: OnboardingStep
  userId: string | null
  householdId: string | null
  displayName: string
  skillLevel: SkillLevel | null
  householdSize: number | null
  dietary: DietaryFlag[]
  pantryTemplate: string | null
  setStep: (s: OnboardingStep) => void
  setUser: (userId: string, householdId: string | null) => void
  setDisplayName: (n: string) => void
  setSkillLevel: (s: SkillLevel) => void
  setHouseholdSize: (n: number) => void
  toggleDietary: (f: DietaryFlag) => void
  setPantryTemplate: (t: string) => void
  reset: () => void
}

const DEFAULT_STATE = {
  step: 'welcome' as OnboardingStep,
  userId: null,
  householdId: null,
  displayName: '',
  skillLevel: null,
  householdSize: null,
  dietary: [] as DietaryFlag[],
  pantryTemplate: null,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setStep: (step) => set({ step }),
      setUser: (userId, householdId) => set({ userId, householdId }),
      setDisplayName: (displayName) => set({ displayName }),
      setSkillLevel: (skillLevel) => set({ skillLevel }),
      setHouseholdSize: (householdSize) => set({ householdSize }),
      toggleDietary: (flag) =>
        set((s) => ({
          dietary: s.dietary.includes(flag)
            ? s.dietary.filter((f) => f !== flag)
            : [...s.dietary, flag],
        })),
      setPantryTemplate: (pantryTemplate) => set({ pantryTemplate }),
      reset: () => set(DEFAULT_STATE),
    }),
    {
      name: 'staged-onboarding',
      partialize: (s) => ({
        step: s.step,
        userId: s.userId,
        householdId: s.householdId,
        displayName: s.displayName,
        skillLevel: s.skillLevel,
        householdSize: s.householdSize,
        dietary: s.dietary,
        pantryTemplate: s.pantryTemplate,
      }),
    }
  )
)
