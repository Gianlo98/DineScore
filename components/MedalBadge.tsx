import { getScoreRating } from "@/lib/score-utils";

interface MedalBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

/**
 * A medallion-style badge for displaying scores with consistent styling
 */
export function MedalBadge({ score, size = "md" }: MedalBadgeProps) {
  // Size classes
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  // Color classes based on score
  let bgColor = "bg-red-500";
  let textColor = "text-white";
  let borderColor = "border-red-600";

  if (score >= 4.5) {
    bgColor = "bg-emerald-500";
    borderColor = "border-emerald-600";
    textColor = "text-white";
  } else if (score >= 3.8) {
    bgColor = "bg-blue-500";
    borderColor = "border-blue-600";
    textColor = "text-white";
  } else if (score >= 3.0) {
    bgColor = "bg-amber-500";
    borderColor = "border-amber-600";
    textColor = "text-white";
  } else if (score >= 2.0) {
    bgColor = "bg-purple-500";
    borderColor = "border-purple-600";
    textColor = "text-white";
  }

  return (
    <div
      className={`${sizeClasses[size]} ${bgColor} ${textColor} rounded-full flex items-center justify-center font-bold border-2 ${borderColor}`}
      title={getScoreRating(score)}
    >
      {score.toFixed(1)}
    </div>
  );
}
