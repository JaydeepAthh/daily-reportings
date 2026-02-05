import { Report, Section, SubSection, Task } from "@/types/report";
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

/**
 * Format a single task
 */
function formatTask(task: Task): string {
  const parts = [
    `    => ${task.link}`,
    task.status,
    task.timeSpent || "",
  ];

  if (task.comment && task.comment.trim()) {
    parts.push(task.comment.trim());
  }

  return parts.join(" >> ");
}

/**
 * Format a subsection with its tasks
 */
function formatSubSection(subSection: SubSection): string {
  if (subSection.tasks.length === 0) return "";

  let output = `    ${subSection.name}[${subSection.tasks.length}] >>>\n`;

  subSection.tasks.forEach((task) => {
    output += formatTask(task) + "\n";
  });

  return output;
}

/**
 * Format a section with its tasks or subsections
 */
function formatSection(section: Section): string {
  if (!sectionHasTasks(section)) return "";

  const taskCount = countSectionTasks(section);
  const totalTime = calculateSectionTotalTime(section);

  let output = `[${section.name}] [${taskCount}] >>> Total: ${totalTime.toFixed(
    2
  )} hours\n`;

  // Section with subsections
  if (section.subSections) {
    section.subSections.forEach((subSection) => {
      output += formatSubSection(subSection);
    });
  }
  // Section with direct tasks
  else if (section.tasks) {
    section.tasks.forEach((task) => {
      output += formatTask(task) + "\n";
    });
  }

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
 * Generate complete formatted report
 */
export function generateFormattedReport(report: Report): string {
  let output = `Today's Update || ${formatDate(report.date)}\n`;

  // Add all sections that have tasks
  report.sections.forEach((section) => {
    const formatted = formatSection(section);
    if (formatted) {
      output += formatted + "\n";
    }
  });

  // Calculate and add overall total
  let overallTotal = 0;
  report.sections.forEach((section) => {
    overallTotal += calculateSectionTotalTime(section);
  });

  output += `Overall Total: ${overallTotal.toFixed(2)} hours`;

  // Add next plan if exists
  const nextPlan = formatNextPlan(report);
  if (nextPlan) {
    output += nextPlan;
  }

  return output;
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
