/**
 * Example of generated report format
 * This demonstrates the exact output format of generateFormattedReport()
 */

import { Report } from "@/types/report";
import { generateFormattedReport } from "@/lib/report-formatter";
import { createEmptyReport, createEmptyTask } from "@/lib/report-utils";

// Create a sample report
const sampleReport: Report = createEmptyReport("2026-02-04");

// Add tasks to Internal Valid Bug section
const internalValidBugSection = sampleReport.sections.find(
  (s) => s.name === "Internal Valid Bug"
);

if (internalValidBugSection && internalValidBugSection.tasks) {
  internalValidBugSection.tasks.push({
    ...createEmptyTask(),
    link: "https://app.clickup.com/t/86d1ukvez",
    status: "D&T",
    timeSpent: "1hr 40min",
    comment: "Milan works on it",
  });

  internalValidBugSection.tasks.push({
    ...createEmptyTask(),
    link: "https://app.clickup.com/t/86d1ukv11",
    status: "DONE",
    timeSpent: "2hr",
    comment: "Fixed validation bug",
  });

  internalValidBugSection.tasks.push({
    ...createEmptyTask(),
    link: "https://app.clickup.com/t/86d1ukv22",
    status: "MR RAISED",
    timeSpent: "45min",
    comment: "Updated API endpoints",
  });

  internalValidBugSection.tasks.push({
    ...createEmptyTask(),
    link: "https://app.clickup.com/t/86d1ukv33",
    status: "IN PROGRESS",
    timeSpent: "23min",
  });
}

// Add tasks to Testing section
const testingSection = sampleReport.sections.find((s) => s.name === "Testing");

if (testingSection && testingSection.tasks) {
  testingSection.tasks.push({
    ...createEmptyTask(),
    link: "https://app.clickup.com/t/86d07682p",
    status: "COMPLETED",
    timeSpent: "41min",
  });
}

// Add next plan
sampleReport.nextPlanDate = "2026-02-05";
sampleReport.nextPlanTasks = [
  {
    ...createEmptyTask(),
    link: "https://app.clickup.com/t/86d1v1n43",
    status: "IN PROGRESS",
  },
  {
    ...createEmptyTask(),
    link: "https://app.clickup.com/t/86d1v1n44",
    status: "IN PROGRESS",
    comment: "Continue working on feature",
  },
];

// Generate the formatted report
const formattedReport = generateFormattedReport(sampleReport);

console.log("=== Generated Report ===\n");
console.log(formattedReport);
console.log("\n=== End of Report ===");

// Expected output format:
/*
Today's Update || 04-02-2026
[Internal Valid Bug] [4] >>> Total: 4.88 hours
    => https://app.clickup.com/t/86d1ukvez >> D&T >> 1hr 40min >> Milan works on it
    => https://app.clickup.com/t/86d1ukv11 >> DONE >> 2hr >> Fixed validation bug
    => https://app.clickup.com/t/86d1ukv22 >> MR RAISED >> 45min >> Updated API endpoints
    => https://app.clickup.com/t/86d1ukv33 >> IN PROGRESS >> 23min

[Testing] [1] >>> Total: 0.68 hours
    => https://app.clickup.com/t/86d07682p >> COMPLETED >> 41min

Overall Total: 5.56 hours

Next Plan || 05-02-2026
    => https://app.clickup.com/t/86d1v1n43 >> IN PROGRESS
    => https://app.clickup.com/t/86d1v1n44 >> IN PROGRESS >> Continue working on feature
*/

export { sampleReport, formattedReport };
