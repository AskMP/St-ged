import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import {
  isInstallAvailable,
  promptInstall,
  requestPersistentStorage,
} from "@/lib/install";

// ---- Types ----

type SkillLevel = "beginner" | "home_cook" | "confident";
type DietaryFlag =
  | "vegan"
  | "vegetarian"
  | "gluten-free"
  | "dairy-free"
  | "nut-free"
  | "halal"
  | "kosher"
  | "low-carb";

const DIETARY_OPTIONS: { value: DietaryFlag; label: string }[] = [
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "gluten-free", label: "Gluten-free" },
  { value: "dairy-free", label: "Dairy-free" },
  { value: "nut-free", label: "Nut-free" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "low-carb", label: "Low-carb" },
];

const PANTRY_STAPLES = [
  "Olive oil",
  "Salt",
  "Black pepper",
  "Garlic",
  "Onions",
  "Butter",
  "Eggs",
  "All-purpose flour",
  "Sugar",
  "Soy sauce",
  "Chicken or vegetable stock",
  "Canned tomatoes",
  "Pasta",
  "Rice",
  "Dried lentils or beans",
  "Chili flakes",
  "Cumin",
  "Paprika",
  "Bay leaves",
  "Dijon mustard",
  "Apple cider vinegar",
  "Honey",
  "Oats",
  "Canned coconut milk",
];

// ---- Helpers ----

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5 mb-6" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < step ? "bg-green-500" : "bg-stone-200"
          }`}
        />
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        {children}
      </div>
    </div>
  );
}

// ---- Step 1: Skill Level (Jordan's Confidence Rule) ----

function SkillStep({ onNext }: { onNext: (skill: SkillLevel) => void }) {
  const [selected, setSelected] = useState<SkillLevel | null>(null);

  const options: {
    value: SkillLevel;
    emoji: string;
    label: string;
    desc: string;
  }[] = [
    {
      value: "beginner",
      emoji: "🌱",
      label: "Beginner",
      desc: "I follow recipes carefully. Simple dishes only.",
    },
    {
      value: "home_cook",
      emoji: "🍳",
      label: "Home Cook",
      desc: "I improvise sometimes. Most recipes work for me.",
    },
    {
      value: "confident",
      emoji: "👨‍🍳",
      label: "Confident Cook",
      desc: "I adapt recipes and handle complex techniques.",
    },
  ];

  return (
    <Card>
      <StepIndicator step={1} total={4} />
      <h2 className="text-2xl font-bold text-stone-900 mb-1">
        How comfortable are you in the kitchen?
      </h2>
      <p className="text-stone-500 text-sm mb-6">
        We&apos;ll show recipes that match your skill level. You can always
        change this later.
      </p>

      <div className="space-y-3" data-testid="skill-step">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-colors ${
              selected === opt.value
                ? "border-green-500 bg-green-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
            data-testid={`skill-${opt.value}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{opt.emoji}</span>
              <div>
                <div className="font-semibold text-stone-900">{opt.label}</div>
                <div className="text-sm text-stone-500">{opt.desc}</div>
              </div>
              {selected === opt.value && (
                <span className="ml-auto text-green-500 text-lg">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onNext(selected)}
        disabled={!selected}
        className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold rounded-lg transition-colors"
        data-testid="skill-continue"
      >
        Continue
      </button>
    </Card>
  );
}

// ---- Step 2: Household Setup (Darius's Rule) ----

function HouseholdStep({ onNext }: { onNext: (householdId: string) => void }) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [mode, setMode] = useState<"solo" | "group" | null>(null);
  const [householdName, setHouseholdName] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAndProceed = async (name: string) => {
    setError(null);
    setLoading(true);
    try {
      const hh = await apiClient.households.create(name);
      // Refresh auth store with new householdId
      if (user) {
        setUser({ ...user, householdId: hh.id });
      }
      if (mode === "group") {
        const link = `${window.location.origin}/join/${hh.id}`;
        setInviteLink(link);
      } else {
        onNext(hh.id);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Could not create household.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (inviteLink) {
    const householdId = user?.householdId ?? "";
    return (
      <Card>
        <StepIndicator step={2} total={4} />
        <h2 className="text-2xl font-bold text-stone-900 mb-2">
          Invite your household
        </h2>
        <p className="text-stone-500 text-sm mb-4">
          Share this link with the people you cook with.
        </p>
        <div className="bg-stone-100 rounded-lg px-4 py-3 text-sm text-stone-700 font-mono break-all mb-6">
          {inviteLink}
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(inviteLink)}
          className="w-full py-2.5 border border-stone-300 rounded-lg text-stone-700 text-sm hover:bg-stone-50 mb-4"
        >
          Copy link
        </button>
        <button
          onClick={() => onNext(householdId)}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          data-testid="household-continue"
        >
          Continue
        </button>
      </Card>
    );
  }

  return (
    <Card>
      <StepIndicator step={2} total={4} />
      <h2 className="text-2xl font-bold text-stone-900 mb-1">
        Is anyone else eating with you?
      </h2>
      <p className="text-stone-500 text-sm mb-6">
        Set up a shared household so everyone stays on the same meal plan.
      </p>

      <div className="space-y-3" data-testid="household-step">
        <button
          onClick={() => setMode("solo")}
          className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-colors ${
            mode === "solo"
              ? "border-green-500 bg-green-50"
              : "border-stone-200 hover:border-stone-300"
          }`}
          data-testid="household-solo"
        >
          <div className="font-semibold text-stone-900">Just me</div>
          <div className="text-sm text-stone-500">
            Solo household. Fast setup.
          </div>
        </button>

        <button
          onClick={() => setMode("group")}
          className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-colors ${
            mode === "group"
              ? "border-green-500 bg-green-50"
              : "border-stone-200 hover:border-stone-300"
          }`}
          data-testid="household-group"
        >
          <div className="font-semibold text-stone-900">I cook for others</div>
          <div className="text-sm text-stone-500">
            Create a shared household. Share an invite link.
          </div>
        </button>
      </div>

      {mode === "group" && (
        <div className="mt-4">
          <label
            htmlFor="householdName"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Household name
          </label>
          <input
            id="householdName"
            type="text"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            placeholder="e.g. The Park Family"
            className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      <button
        onClick={() => {
          if (!mode) return;
          const name =
            mode === "solo"
              ? `${user?.name ?? "My"}'s Household`
              : householdName.trim() || "My Household";
          createAndProceed(name);
        }}
        disabled={
          !mode || loading || (mode === "group" && !householdName.trim())
        }
        className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold rounded-lg transition-colors"
        data-testid="household-continue"
      >
        {loading ? "Setting up..." : "Continue"}
      </button>
    </Card>
  );
}

// ---- Step 3: Dietary Profile (Maya's Zero-Waste Signal) ----

function DietaryStep({ onNext }: { onNext: (dietary: DietaryFlag[]) => void }) {
  const [selected, setSelected] = useState<DietaryFlag[]>([]);

  const toggle = (flag: DietaryFlag) => {
    setSelected((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag],
    );
  };

  return (
    <Card>
      <StepIndicator step={3} total={4} />
      <h2 className="text-2xl font-bold text-stone-900 mb-1">
        Any dietary needs?
      </h2>
      <p className="text-stone-500 text-sm mb-6">
        We&apos;ll filter recipes to match. You can always update this.
      </p>

      <div className="flex flex-wrap gap-2" data-testid="dietary-step">
        {DIETARY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              selected.includes(opt.value)
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
            data-testid={`dietary-${opt.value}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <button
          onClick={() => onNext(selected)}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          data-testid="dietary-continue"
        >
          Continue
        </button>
        <button
          onClick={() => onNext([])}
          className="w-full py-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
          data-testid="dietary-skip"
        >
          Skip for now
        </button>
      </div>
    </Card>
  );
}

// ---- Step 4: Starter Pantry + A2HS (Sam's Fridge Rule) ----

function PantryStep({
  householdId,
  onDone,
}: {
  householdId: string;
  onDone: () => void;
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showA2HS, setShowA2HS] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (item: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (checked.size > 0 && householdId) {
        // Save each checked item individually to the pantry
        await Promise.all(
          Array.from(checked).map((name) =>
            fetch(`/api/households/${householdId}/pantry/items`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ name, quantity: 1 }),
            }),
          ),
        );
      }
    } catch (err: unknown) {
      // Pantry save is best-effort; don't block onboarding completion
      console.warn("Pantry save failed:", err);
    } finally {
      setLoading(false);
    }

    // Trigger A2HS prompt
    if (isInstallAvailable()) {
      setShowA2HS(true);
    } else {
      onDone();
    }
  };

  if (showA2HS) {
    return (
      <Card>
        <div className="text-center">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            Add Stàged to your Home Screen
          </h2>
          <p className="text-stone-500 text-sm mb-8">
            Keep your recipes available offline -- even without signal. iOS
            removes browser data after 7 days without installation.
          </p>
          <button
            onClick={async () => {
              await promptInstall();
              await requestPersistentStorage();
              onDone();
            }}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors mb-3"
            data-testid="a2hs-add"
          >
            Add to Home Screen
          </button>
          <button
            onClick={onDone}
            className="w-full py-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
            data-testid="a2hs-skip"
          >
            Maybe later
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <StepIndicator step={4} total={4} />
      <h2 className="text-2xl font-bold text-stone-900 mb-1">
        Let&apos;s stock your pantry
      </h2>
      <p className="text-stone-500 text-sm mb-6">
        Check what you have. We&apos;ll use this to find recipes you can make
        today.
      </p>

      <div
        className="space-y-2 max-h-72 overflow-y-auto pr-1"
        data-testid="pantry-step"
      >
        {PANTRY_STAPLES.map((item) => (
          <label
            key={item}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-stone-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={checked.has(item)}
              onChange={() => toggle(item)}
              className="w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500"
              data-testid={`pantry-item-${item.toLowerCase().replace(/\s+/g, "-")}`}
            />
            <span className="text-stone-700 text-sm">{item}</span>
          </label>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
        data-testid="pantry-continue"
      >
        {loading
          ? "Saving..."
          : checked.size > 0
            ? `Add ${checked.size} item${checked.size > 1 ? "s" : ""} to my pantry`
            : "Skip for now"}
      </button>
    </Card>
  );
}

// ---- Main Onboarding Orchestrator ----

type Step = "skill" | "household" | "dietary" | "pantry";

export default function Onboarding() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState<Step>("skill");
  const [skill, setSkill] = useState<SkillLevel | null>(null);
  const [householdId, setHouseholdId] = useState<string>(
    user?.householdId ?? "",
  );
  const [dietary, setDietary] = useState<DietaryFlag[]>([]);

  const handleSkill = (s: SkillLevel) => {
    setSkill(s);
    setStep("household");
  };

  const handleHousehold = (hId: string) => {
    setHouseholdId(hId);
    setStep("dietary");
  };

  const handleDietary = (flags: DietaryFlag[]) => {
    setDietary(flags);
    setStep("pantry");
  };

  const handleDone = () => {
    void skill; // captured for future PATCH /api/users/me
    void dietary;
    navigate("/planning");
  };

  if (step === "skill") {
    return <SkillStep onNext={handleSkill} />;
  }
  if (step === "household") {
    return <HouseholdStep onNext={handleHousehold} />;
  }
  if (step === "dietary") {
    return <DietaryStep onNext={handleDietary} />;
  }
  return <PantryStep householdId={householdId} onDone={handleDone} />;
}
