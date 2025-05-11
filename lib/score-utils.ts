/**
 * Utility functions for handling scores throughout the application
 */

/**
 * Gets the color for a score based on a standardized scale
 * @param score The numeric score (typically between 1-5)
 * @returns A color identifier used consistently across the application
 */
export function getScoreColor(score: number) {
  if (score >= 4.5) return "success";
  if (score >= 3.8) return "primary";
  if (score >= 3.0) return "warning";
  if (score >= 2.0) return "secondary";

  return "danger";
}

/**
 * Gets a descriptive rating text for a score
 * @param score The numeric score (typically between 1-5)
 * @returns A text description of the score
 */
export function getScoreRating(score: number) {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.8) return "Great";
  if (score >= 3.0) return "Good";
  if (score >= 2.0) return "Average";
  if (score >= 1.0) return "Poor";

  return "Bad";
}

/**
 * Gets the medal theme colors for a score
 * @param score The numeric score (typically between 1-5)
 * @returns An object with various themed color values
 */
export function getMedalTheme(score: number) {
  if (score >= 4.5)
    return {
      background: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      border: "border-emerald-200",
      text: "text-emerald-900",
      score: "text-emerald-800",
      laurel: "text-emerald-500",
    };
  if (score >= 3.8)
    return {
      background: "bg-gradient-to-br from-blue-50 to-blue-100",
      border: "border-blue-200",
      text: "text-blue-900",
      score: "text-blue-800",
      laurel: "text-blue-500",
    };
  if (score >= 3.0)
    return {
      background: "bg-gradient-to-br from-amber-50 to-amber-100",
      border: "border-amber-200",
      text: "text-amber-900",
      score: "text-amber-800",
      laurel: "text-amber-500",
    };
  if (score >= 2.0)
    return {
      background: "bg-gradient-to-br from-purple-50 to-purple-100",
      border: "border-purple-200",
      text: "text-purple-900",
      score: "text-purple-800",
      laurel: "text-purple-400",
    };

  return {
    background: "bg-gradient-to-br from-red-50 to-red-100",
    border: "border-red-200",
    text: "text-red-900",
    score: "text-red-800",
    laurel: "text-red-400",
  };
}

/**
 * Gets the Google Maps marker color for a score
 * @param score The numeric score (typically between 1-5)
 * @returns A color string that can be used with Google Maps API
 */
export function getMapMarkerColor(score: number) {
  if (score >= 4.5) return "#10b981"; // emerald-500
  if (score >= 3.8) return "#3b82f6"; // blue-500
  if (score >= 3.0) return "#f59e0b"; // amber-500
  if (score >= 2.0) return "#a855f7"; // purple-500

  return "#ef4444"; // red-500
}
