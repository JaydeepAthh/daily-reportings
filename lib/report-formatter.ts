import { Report, Section, Task } from "@/types/report";
import { calculateSectionTotalTime } from "./report-utils";
import { calculateSectionTotal } from "./time-utils";

/**
 * Format date from YYYY-MM-DD to DD-MM-YYYY
 */
function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
}

/**
 * Check if section has any tasks
 */
function sectionHasTasks(section: Section): boolean {
  if (section.subSections) {
    return section.subSections.some((sub) => sub.tasks.length > 0);
  }
  return (section.tasks?.length || 0) > 0;
}

/**
 * Count total tasks in a section
 */
function countSectionTasks(section: Section): number {
  if (section.subSections) {
    return section.subSections.reduce((acc, sub) => acc + sub.tasks.length, 0);
  }
  return section.tasks?.length || 0;
}

export interface FormatOptions {
  includeTotals?: boolean;
  includeOverallTotal?: boolean;
  validateBeforeFormat?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
}

export interface ValidationWarning {
  sectionName: string;
  taskIndex?: number;
  field: string;
  message: string;
}

/**
 * Validate report before formatting
 */
export function validateReport(report: Report): ValidationResult {
  const warnings: ValidationWarning[] = [];

  report.sections.forEach((section) => {
    const allTasks: Array<{ task: Task; index: number; subName?: string }> =
      section.subSections
        ? section.subSections.flatMap((sub) =>
            sub.tasks.map((t, i) => ({ task: t, index: i, subName: sub.name })),
          )
        : (section.tasks || []).map((t, i) => ({ task: t, index: i }));

    allTasks.forEach(({ task, index, subName }) => {
      const location = subName ? `${section.name} > ${subName}` : section.name;

      if (!task.link || !task.link.trim()) {
        warnings.push({
          sectionName: location,
          taskIndex: index,
          field: "link",
          message: "Missing task link",
        });
      }

      if (!task.status) {
        warnings.push({
          sectionName: location,
          taskIndex: index,
          field: "status",
          message: "Missing task status",
        });
      }

      if (!task.timeSpent || !task.timeSpent.trim()) {
        warnings.push({
          sectionName: location,
          taskIndex: index,
          field: "timeSpent",
          message: "Missing time spent",
        });
      }
    });
  });

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * Format a single task (exact import format)
 */
function formatTask(task: Task): string {
  const parts = [`    => ${task.link}`, task.status];

  // Only add time if it exists
  if (task.timeSpent && task.timeSpent.trim()) {
    parts.push(task.timeSpent.trim());
  }

  // Only add comment if it exists
  if (task.comment && task.comment.trim()) {
    parts.push(task.comment.trim());
  }

  return parts.join(" >> ");
}

/**
 * Format a section with its tasks or subsections
 */
function formatSection(section: Section, options: FormatOptions = {}): string {
  if (!sectionHasTasks(section)) return "";

  const taskCount = countSectionTasks(section);
  const totalTime = calculateSectionTotalTime(section);

  // Format section header
  let header = `[${section.name}] [${taskCount}] >>>`;

  // Optionally add total time (for display, not for reimport)
  if (options.includeTotals) {
    header += ` Total: ${totalTime.toFixed(2)} hours`;
  }

  let output = header + "\n";

  // Collect all tasks (flatten subsections)
  const allTasks: Task[] = section.subSections
    ? section.subSections.flatMap((sub) => sub.tasks)
    : section.tasks || [];

  allTasks.forEach((task) => {
    output += formatTask(task) + "\n";
  });

  return output;
}

/**
 * Format next plan section
 */
function formatNextPlan(report: Report): string {
  if (!report.nextPlanDate || report.nextPlanTasks.length === 0) {
    return "";
  }

  let output = `\nNext Plan || ${formatDate(report.nextPlanDate)}\n`;

  report.nextPlanTasks.forEach((task) => {
    output += formatTask(task) + "\n";
  });

  return output;
}

/**
 * Generate complete formatted report with options
 */
export function generateFormattedReport(
  report: Report,
  options: FormatOptions = { includeTotals: true, includeOverallTotal: true },
): string {
  // Validate if requested
  if (options.validateBeforeFormat) {
    const validation = validateReport(report);
    if (!validation.isValid) {
      console.warn("Report has validation warnings:", validation.warnings);
    }
  }

  let output = `Today's Update || ${formatDate(report.date)}\n`;

  // Add all sections that have tasks, separated by blank lines
  report.sections.forEach((section) => {
    const formatted = formatSection(section, options);
    if (formatted) {
      output += "\n" + formatted;
    }
  });

  // Calculate and add overall total (optional)
  if (options.includeOverallTotal) {
    let overallTotal = 0;
    report.sections.forEach((section) => {
      overallTotal += calculateSectionTotalTime(section);
    });

    output += `\nOverall Total: ${overallTotal.toFixed(2)} hours\n`;
  }

  // Add next plan if exists
  const nextPlan = formatNextPlan(report);
  if (nextPlan) {
    output += nextPlan;
  }

  return output.trim(); // Remove trailing newline
}

/**
 * Generate report in exact import format (for round-trip)
 */
export function generateImportableReport(report: Report): string {
  return generateFormattedReport(report, {
    includeTotals: false,
    includeOverallTotal: false,
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
}
