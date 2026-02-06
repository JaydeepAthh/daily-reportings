import {
  Section,
  SubSection,
  Report,
  DEFAULT_SECTIONS,
  Task,
} from "@/types/report";
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
export function createEmptyReport(
  date: string = new Date().toISOString().split("T")[0],
): Report {
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
  subSectionId?: string,
): Section {
  if (subSectionId && section.subSections) {
    return {
      ...section,
      subSections: section.subSections.map((subSection) =>
        subSection.id === subSectionId
          ? { ...subSection, tasks: [...subSection.tasks, task] }
          : subSection,
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
  taskId: string,
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
  updates: Partial<Task>,
): Section {
  if (section.subSections) {
    return {
      ...section,
      subSections: section.subSections.map((subSection) => ({
        ...subSection,
        tasks: subSection.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task,
        ),
      })),
    };
  }

  if (section.tasks) {
    return {
      ...section,
      tasks: section.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    };
  }

  return section;
}

/**
 * Add a subsection to a section
 */
export function addSubSectionToSection(
  section: Section,
  subSectionName: string,
): Section {
  if (!section.subSections) {
    return section;
  }

  const newSubSection: SubSection = {
    id: generateId(),
    name: subSectionName,
    tasks: [],
    isFixed: false,
  };

  return {
    ...section,
    subSections: [...section.subSections, newSubSection],
  };
}

/**
 * Delete a subsection from a section
 */
export function deleteSubSectionFromSection(
  section: Section,
  subSectionId: string,
): Section {
  if (!section.subSections) {
    return section;
  }

  return {
    ...section,
    subSections: section.subSections.filter((sub) => sub.id !== subSectionId),
  };
}

/**
 * Convert a section with direct tasks to have subsections
 */
export function convertSectionToSubSections(section: Section): Section {
  if (section.subSections) {
    return section; // Already has subsections
  }

  return {
    ...section,
    subSections: [
      {
        id: generateId(),
        name: "DONE",
        tasks: [],
        isFixed: false,
      },
      {
        id: generateId(),
        name: "MR RAISED",
        tasks: [],
        isFixed: false,
      },
      {
        id: generateId(),
        name: "IN PROGRESS",
        tasks: section.tasks || [], // Move existing tasks to IN PROGRESS
        isFixed: false,
      },
      {
        id: generateId(),
        name: "D&T",
        tasks: [],
        isFixed: false,
      },
    ],
    tasks: undefined,
  };
}

/**
 * Move a task between subsections based on status change
 */
export function moveTaskBetweenSubSections(
  section: Section,
  taskId: string,
  newStatus: string,
  oldSubSectionId: string,
): Section {
  if (!section.subSections) {
    return section;
  }

  // Find the task
  let taskToMove: Task | undefined;
  let sourceSubSection: SubSection | undefined;

  for (const subSection of section.subSections) {
    const task = subSection.tasks.find((t) => t.id === taskId);
    if (task) {
      taskToMove = task;
      sourceSubSection = subSection;
      break;
    }
  }

  if (!taskToMove || !sourceSubSection) {
    return section;
  }

  // Find target subsection by name matching the new status
  const targetSubSection = section.subSections.find(
    (sub) => sub.name.toUpperCase() === newStatus.toUpperCase(),
  );

  if (!targetSubSection || targetSubSection.id === sourceSubSection.id) {
    // No matching subsection or same subsection, just update the task
    return {
      ...section,
      subSections: section.subSections.map((subSection) => ({
        ...subSection,
        tasks: subSection.tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus as any } : task,
        ),
      })),
    };
  }

  // Move task to target subsection
  const updatedTask = { ...taskToMove, status: newStatus as any };

  return {
    ...section,
    subSections: section.subSections.map((subSection) => {
      if (subSection.id === sourceSubSection.id) {
        // Remove from source
        return {
          ...subSection,
          tasks: subSection.tasks.filter((t) => t.id !== taskId),
        };
      } else if (subSection.id === targetSubSection.id) {
        // Add to target
        return {
          ...subSection,
          tasks: [...subSection.tasks, updatedTask],
        };
      }
      return subSection;
    }),
  };
}
