export interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved" | "closed";
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  environment: string;
  createdAt: Date;
}

export interface BugReportFormData {
  title: string;
  description: string;
  severity: BugReport["severity"];
  status: BugReport["status"];
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  environment: string;
}
