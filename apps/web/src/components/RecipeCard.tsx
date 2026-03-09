import { Link } from "react-router-dom";
import type { Recipe } from "@staged/types";

/**
 * RecipeCard -- Jordan's Confidence Rule + Maya's Zero-Waste Signal.
 *
 * Every card shows:
 * - Title
 * - Skill level badge (green=beginner, yellow=intermediate/home_cook, red=advanced/confident)
 * - Cook + prep time
 * - Zero-waste leaf icon (Maya's Signal)
 * - Servings
 * - Save heart (future feature)
 */

type SkillLevel =
  | "beginner"
  | "home_cook"
  | "confident"
  | "intermediate"
  | "advanced";

function skillBadge(level: SkillLevel | string | undefined) {
  switch (level) {
    case "beginner":
      return { label: "Beginner", className: "bg-green-100 text-green-700" };
    case "home_cook":
    case "intermediate":
      return { label: "Home Cook", className: "bg-yellow-100 text-yellow-700" };
    case "confident":
    case "advanced":
      return {
        label: "Confident",
        className: "bg-red-100 text-red-700",
      };
    default:
      return null;
  }
}

function ZeroWasteLeaf() {
  return (
    <span
      className="text-green-500 text-base"
      title="Zero-waste eligible"
      aria-label="Zero-waste eligible"
      role="img"
    >
      🌿
    </span>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: (id: string) => void;
}

export function RecipeCard({ recipe, onSave }: RecipeCardProps) {
  const skill = skillBadge(recipe.skill_level as string | undefined);
  const isZeroWaste = !!recipe.zero_waste;
  const cookTime = recipe.cook_time_minutes as number | undefined;
  const prepTime = recipe.prep_time_minutes as number | undefined;
  const servings = recipe.servings as number | undefined;
  const totalTime = (cookTime ?? 0) + (prepTime ?? 0);

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="block bg-white rounded-xl border border-stone-200 hover:border-green-300 hover:shadow-sm transition-all overflow-hidden"
      data-testid={`recipe-card-${recipe.id}`}
    >
      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isZeroWaste && <ZeroWasteLeaf />}
            {onSave && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onSave(recipe.id);
                }}
                className="text-stone-300 hover:text-red-400 transition-colors"
                aria-label="Save recipe"
              >
                ♡
              </button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {skill && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${skill.className}`}
              data-testid="skill-badge"
            >
              {skill.label}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-stone-400">
          {totalTime > 0 && <span>{totalTime} min</span>}
          {servings && (
            <span>
              {servings} serving{servings > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
