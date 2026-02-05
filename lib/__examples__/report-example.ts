/**
 * Example usage of the reporting system types and utilities
 * This file demonstrates how to use the types and utility functions
 */

import { Report, Task } from "@/types/report";
import {
  convertTimeToDecimal,
  formatTimeFromDecimal,
  calculateSectionTotal,
  calculateSectionTotalFormatted,
  isValidTimeFormat,
  normalizeTimeString,
} from "@/lib/time-utils";
import {
  createEmptyReport,
  createEmptyTask,
  calculateSectionTotalTime,
  calculateReportTotalTime,
  countTasksByStatus,
  addTaskToSection,
} from "@/lib/report-utils";

// ============================================
// Example 1: Time Conversion Utilities
// ============================================

console.log("=== Time Conversion Examples ===");

// Convert time strings to decimal hours
console.log(convertTimeToDecimal("1hr 40min")); // 1.67
console.log(convertTimeToDecimal("34min")); // 0.57
console.log(convertTimeToDecimal("2hr")); // 2.00
console.log(convertTimeToDecimal("1hr40min")); // 1.67 (without space)

// Convert decimal back to formatted time
console.log(formatTimeFromDecimal(1.67)); // "1hr 40min"
console.log(formatTimeFromDecimal(0.57)); // "34min"
console.log(formatTimeFromDecimal(2.0)); // "2hr"
console.log(formatTimeFromDecimal(0.08)); // "5min"

// Validate time format
console.log(isValidTimeFormat("1hr 40min")); // true
console.log(isValidTimeFormat("34min")); // true
console.log(isValidTimeFormat("invalid")); // false

// Normalize time strings
console.log(normalizeTimeString("1hr40min")); // "1hr 40min"
console.log(normalizeTimeString("90min")); // "90min" (as entered)

// ============================================
// Example 2: Creating a Report
// ============================================

console.log("\n=== Creating a Report ===");

// Create an empty report with default sections
const report: Report = createEmptyReport("2026-02-05");

console.log("Report date:", report.date);
console.log("Number of sections:", report.sections.length);
console.log(
  "Section names:",
  report.sections.map((s) => s.name)
);

// ============================================
// Example 3: Adding Tasks
// ============================================

console.log("\n=== Adding Tasks ===");

// Create tasks
const task1: Task = {
  ...createEmptyTask(),
  link: "https://jira.example.com/PROJ-123",
  status: "DONE",
  comment: "Fixed authentication bug",
  timeSpent: "1hr 40min",
};

const task2: Task = {
  ...createEmptyTask(),
  link: "https://jira.example.com/PROJ-124",
  status: "IN PROGRESS",
  comment: "Working on payment gateway",
  timeSpent: "3hr 20min",
};

const task3: Task = {
  ...createEmptyTask(),
  link: "https://jira.example.com/PROJ-125",
  status: "MR RAISED",
  comment: "Added validation for user input",
  timeSpent: "45min",
};

// Add tasks to Panel Valid Bugs section (which has subsections)
const panelBugsSection = report.sections.find(
  (s) => s.name === "Panel Valid Bugs"
);

if (panelBugsSection && panelBugsSection.subSections) {
  // Find DONE subsection and add task1
  const doneSubSection = panelBugsSection.subSections.find(
    (ss) => ss.name === "DONE"
  );
  if (doneSubSection) {
    doneSubSection.tasks.push(task1);
  }

  // Find IN PROGRESS subsection and add task2
  const inProgressSubSection = panelBugsSection.subSections.find(
    (ss) => ss.name === "IN PROGRESS"
  );
  if (inProgressSubSection) {
    inProgressSubSection.tasks.push(task2);
  }

  // Find MR RAISED subsection and add task3
  const mrRaisedSubSection = panelBugsSection.subSections.find(
    (ss) => ss.name === "MR RAISED"
  );
  if (mrRaisedSubSection) {
    mrRaisedSubSection.tasks.push(task3);
  }
}

// ============================================
// Example 4: Calculating Totals
// ============================================

console.log("\n=== Calculating Totals ===");

// Calculate section total
if (panelBugsSection) {
  const sectionTotal = calculateSectionTotalTime(panelBugsSection);
  console.log(
    "Panel Valid Bugs total time:",
    formatTimeFromDecimal(sectionTotal)
  );
  // Output: "5hr 45min" (1hr 40min + 3hr 20min + 45min)
}

// Calculate report total
const reportTotal = calculateReportTotalTime(report);
console.log("Total report time:", formatTimeFromDecimal(reportTotal));

// ============================================
// Example 5: Task Statistics
// ============================================

console.log("\n=== Task Statistics ===");

const statusCounts = countTasksByStatus(report);
console.log("Tasks by status:", statusCounts);
// Output: { DONE: 1, 'MR RAISED': 1, 'IN PROGRESS': 1, 'D&T': 0, ... }

// ============================================
// Example 6: Array of Tasks - Calculate Total
// ============================================

console.log("\n=== Calculate Total for Array of Tasks ===");

const tasks: Task[] = [task1, task2, task3];
const totalDecimal = calculateSectionTotal(tasks);
const totalFormatted = calculateSectionTotalFormatted(tasks);

console.log("Total time (decimal):", totalDecimal.toFixed(2), "hours");
console.log("Total time (formatted):", totalFormatted);

// ============================================
// Example 7: Next Plan Tasks
// ============================================

console.log("\n=== Next Plan Tasks ===");

report.nextPlanDate = "2026-02-06";
report.nextPlanTasks = [
  {
    ...createEmptyTask(),
    link: "https://jira.example.com/PROJ-126",
    status: "IN PROGRESS",
    comment: "Plan to implement search feature",
    timeSpent: "2hr",
  },
  {
    ...createEmptyTask(),
    link: "https://jira.example.com/PROJ-127",
    status: "IN PROGRESS",
    comment: "Plan to fix responsive layout",
    timeSpent: "1hr 30min",
  },
];

console.log("Next plan date:", report.nextPlanDate);
console.log("Next plan tasks count:", report.nextPlanTasks.length);

// ============================================
// Example 8: Working with Direct Tasks (No Subsections)
// ============================================

console.log("\n=== Sections with Direct Tasks ===");

const liveValidBugSection = report.sections.find(
  (s) => s.name === "Live Valid Bug"
);

if (liveValidBugSection && liveValidBugSection.tasks) {
  const liveTask: Task = {
    ...createEmptyTask(),
    link: "https://jira.example.com/LIVE-001",
    status: "COMPLETED",
    comment: "Fixed critical production bug",
    timeSpent: "4hr 15min",
  };

  liveValidBugSection.tasks.push(liveTask);

  const liveTotal = calculateSectionTotal(liveValidBugSection.tasks);
  console.log(
    "Live Valid Bug section total:",
    formatTimeFromDecimal(liveTotal)
  );
}

// ============================================
// Example 9: Using Helper Functions
// ============================================

console.log("\n=== Using Helper Functions ===");

// Add task using helper
const testingSection = report.sections.find((s) => s.name === "Testing");
if (testingSection) {
  const testTask: Task = {
    ...createEmptyTask(),
    link: "https://jira.example.com/TEST-001",
    status: "D&T",
    comment: "Testing new features",
    timeSpent: "2hr 30min",
  };

  const updatedSection = addTaskToSection(testingSection, testTask);
  console.log("Added task to Testing section");
  console.log(
    "Testing section task count:",
    updatedSection.tasks?.length || 0
  );
}

// ============================================
// Example 10: Complete Report Summary
// ============================================

console.log("\n=== Complete Report Summary ===");
console.log("Report Date:", report.date);
console.log("Total Sections:", report.sections.length);
console.log(
  "Total Time Spent:",
  formatTimeFromDecimal(calculateReportTotalTime(report))
);
console.log("Task Status Breakdown:", countTasksByStatus(report));
console.log("Next Plan Date:", report.nextPlanDate);
console.log("Next Plan Tasks:", report.nextPlanTasks.length);

export { report };
