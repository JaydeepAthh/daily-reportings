import { Task, ParsedTime } from "@/types/report";

/**
 * Parse time string to hours and minutes
 * Supports formats: "1hr 40min", "34min", "2hr", "1hr40min"
 */
export function parseTimeString(timeString: string): ParsedTime {
  const cleaned = timeString.toLowerCase().trim();

  // Match patterns: "1hr 40min", "1hr40min", "2hr", "34min"
  const hrMatch = cleaned.match(/(\d+)\s*hr/);
  const minMatch = cleaned.match(/(\d+)\s*min/);

  const hours = hrMatch ? parseInt(hrMatch[1], 10) : 0;
  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;

  return { hours, minutes };
}

/**
 * Convert time string to decimal hours
 * Examples:
 * - "1hr 40min" -> 1.67
 * - "34min" -> 0.57
 * - "2hr" -> 2.00
 */
export function convertTimeToDecimal(timeString: string): number {
  if (!timeString || timeString.trim() === "") {
    return 0;
  }

  const { hours, minutes } = parseTimeString(timeString);
  return hours + minutes / 60;
}

/**
 * Format decimal hours back to time string
 * Examples:
 * - 1.67 -> "1hr 40min"
 * - 0.57 -> "34min"
 * - 2.00 -> "2hr"
 * - 0.08 -> "5min"
 */
export function formatTimeFromDecimal(decimal: number): string {
  if (decimal === 0) {
    return "0min";
  }

  const totalMinutes = Math.round(decimal * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}min`;
  }

  if (minutes === 0) {
    return `${hours}hr`;
  }

  return `${hours}hr ${minutes}min`;
}

/**
 * Calculate total time spent for an array of tasks (in decimal hours)
 */
export function calculateSectionTotal(tasks: Task[]): number {
  return tasks.reduce((total, task) => {
    return total + convertTimeToDecimal(task.timeSpent);
  }, 0);
}

/**
 * Calculate total time spent for an array of tasks and return formatted string
 */
export function calculateSectionTotalFormatted(tasks: Task[]): string {
  const total = calculateSectionTotal(tasks);
  return formatTimeFromDecimal(total);
}

/**
 * Validate time string format
 */
export function isValidTimeFormat(timeString: string): boolean {
  if (!timeString || timeString.trim() === "") {
    return false;
  }

  const cleaned = timeString.toLowerCase().trim();
  // Match formats: "1hr 40min", "1hr40min", "2hr", "34min", "1hr 40 min", etc.
  const pattern = /^(\d+\s*hr\s*)?(\d+\s*min)?$/;

  if (!pattern.test(cleaned)) {
    return false;
  }

  // Ensure at least one value is present
  const hrMatch = cleaned.match(/(\d+)\s*hr/);
  const minMatch = cleaned.match(/(\d+)\s*min/);

  return !!(hrMatch || minMatch);
}

/**
 * Normalize time string to consistent format
 * Converts various formats to "Xhr Ymin" or "Xhr" or "Ymin"
 */
export function normalizeTimeString(timeString: string): string {
  if (!timeString || timeString.trim() === "") {
    return "0min";
  }

  const { hours, minutes } = parseTimeString(timeString);

  if (hours === 0 && minutes === 0) {
    return "0min";
  }

  if (hours === 0) {
    return `${minutes}min`;
  }

  if (minutes === 0) {
    return `${hours}hr`;
  }

  return `${hours}hr ${minutes}min`;
}
