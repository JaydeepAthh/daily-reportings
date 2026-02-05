import { Section, SubSection, Report, DEFAULT_SECTIONS, Task } from "@/types/report";
import { calculateSectionTotal } from "./time-utils";

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Initialize sections with unique IDs
 */
export function initializeDefaultSections(): Section[] {
  return DEFAULT_SECTIONS.map((section) => ({
    ...section,
    id: generateId(),
    subSections: section.subSections?.map((subSection) => ({
      ...subSection,
      id: generateId(),
      tasks: [],
    })),
    tasks: section.tasks ? [] : undefined,
  }));
}

/**
 * Create an empty report with default structure
 */
export function createEmptyReport(date: string = new Date().toISOString().split("T")[0]): Report {
  return {
    date,
    sections: initializeDefaultSections(),
    nextPlanDate: "",
    nextPlanTasks: [],
  };
}

/**
 * Create a new empty task
 */
export function createEmptyTask(): Task {
  return {
    id: generateId(),
    link: "",
    status: "IN PROGRESS",
    comment: "",
    timeSpent: "",
  };
}

/**
 * Calculate total time for a section (including all subsections)
 */
export function calculateSectionTotalTime(section: Section): number {
  let total = 0;

  // Add time from direct tasks
  if (section.tasks) {
    total += calculateSectionTotal(section.tasks);
  }

  // Add time from subsection tasks
  if (section.subSections) {
    section.subSections.forEach((subSection) => {
      total += calculateSectionTotal(subSection.tasks);
    });
  }

  return total;
}

/**
 * Calculate total time for entire report
 */
export function calculateReportTotalTime(report: Report): number {
  return report.sections.reduce((total, section) => {
    return total + calculateSectionTotalTime(section);
  }, 0);
}

/**
 * Get all tasks from a section (including subsections)
 */
export function getAllTasksFromSection(section: Section): Task[] {
  const tasks: Task[] = [];

  if (section.tasks) {
    tasks.push(...section.tasks);
  }

  if (section.subSections) {
    section.subSections.forEach((subSection) => {
      tasks.push(...subSection.tasks);
    });
  }

  return tasks;
}

/**
 * Find a task by ID in a report
 */
export function findTaskById(report: Report, taskId: string): Task | undefined {
  for (const section of report.sections) {
    const allTasks = getAllTasksFromSection(section);
    const task = allTasks.find((t) => t.id === taskId);
    if (task) return task;
  }

  // Check next plan tasks
  return report.nextPlanTasks.find((t) => t.id === taskId);
}

/**
 * Count tasks by status in a report
 */
export function countTasksByStatus(report: Report): Record<string, number> {
  const counts: Record<string, number> = {
    DONE: 0,
    "MR RAISED": 0,
    "IN PROGRESS": 0,
    "D&T": 0,
    COMPLETED: 0,
    "DEV REPLIED": 0,
  };

  report.sections.forEach((section) => {
    const tasks = getAllTasksFromSection(section);
    tasks.forEach((task) => {
      counts[task.status] = (counts[task.status] || 0) + 1;
    });
  });

  return counts;
}

/**
 * Add a task to a section or subsection
 */
export function addTaskToSection(
  section: Section,
  task: Task,
  subSectionId?: string
): Section {
  if (subSectionId && section.subSections) {
    return {
      ...section,
      subSections: section.subSections.map((subSection) =>
        subSection.id === subSectionId
          ? { ...subSection, tasks: [...subSection.tasks, task] }
          : subSection
      ),
    };
  }

  if (section.tasks) {
    return {
      ...section,
      tasks: [...section.tasks, task],
    };
  }

  return section;
}

/**
 * Remove a task from a section or subsection
 */
export function removeTaskFromSection(
  section: Section,
  taskId: string
): Section {
  if (section.subSections) {
    return {
      ...section,
      subSections: section.subSections.map((subSection) => ({
        ...subSection,
        tasks: subSection.tasks.filter((task) => task.id !== taskId),
      })),
    };
  }

  if (section.tasks) {
    return {
      ...section,
      tasks: section.tasks.filter((task) => task.id !== taskId),
    };
  }

  return section;
}

/**
 * Update a task in a section or subsection
 */
export function updateTaskInSection(
  section: Section,
  taskId: string,
  updates: Partial<Task>
): Section {
  if (section.subSections) {
    return {
      ...section,
      subSections: section.subSections.map((subSection) => ({
        ...subSection,
        tasks: subSection.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      })),
    };
  }

  if (section.tasks) {
    return {
      ...section,
      tasks: section.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    };
  }

  return section;
}
