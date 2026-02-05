# Reporting System Documentation

## Overview

The Daily Reports application includes a comprehensive type-safe reporting system for tracking tasks, time spent, and work progress across different bug categories and testing activities.

## Type System

### Task Type

Represents a single work item with tracking information.

```typescript
interface Task {
  id: string;                    // Unique identifier (UUID)
  link: string;                  // JIRA/ticket link
  status: TaskStatus;            // Current status
  comment?: string;              // Optional description
  timeSpent: string;            // Time in format: "1hr 40min" or "34min" or "2hr"
}

type TaskStatus =
  | "DONE"
  | "MR RAISED"
  | "IN PROGRESS"
  | "D&T"              // Design & Testing
  | "COMPLETED"
  | "DEV REPLIED";
```

### SubSection Type

Groups tasks within a section (e.g., DONE, MR RAISED within Panel Valid Bugs).

```typescript
interface SubSection {
  id: string;
  name: string;
  tasks: Task[];
  isFixed: boolean;   // Whether this subsection is part of default structure
}
```

### Section Type

Main organizational unit for categorizing work.

```typescript
interface Section {
  id: string;
  name: string;
  isFixed: boolean;
  subSections?: SubSection[];  // For sections with subsections
  tasks?: Task[];              // For sections without subsections
}
```

### Report Type

Complete daily report structure.

```typescript
interface Report {
  date: string;              // Report date (ISO format)
  sections: Section[];       // All work sections
  nextPlanDate: string;      // Next plan date
  nextPlanTasks: Task[];     // Tasks planned for next day
}
```

## Default Sections Structure

The system includes 7 predefined sections:

1. **Panel Valid Bugs** (with subsections)
   - DONE
   - MR RAISED
   - IN PROGRESS
   - D&T

2. **Panel Invalid/Dev. Reply Bugs**
3. **Live Valid Bug**
4. **Live Invalid Bug**
5. **Internal Valid Bug**
6. **Internal Invalid Bug**
7. **Testing**

## Time Utilities

### Time Format

Time is stored as strings in flexible formats:
- `"1hr 40min"` - Hours and minutes
- `"34min"` - Minutes only
- `"2hr"` - Hours only
- `"1hr40min"` - Without space (also supported)

### Available Functions

#### `convertTimeToDecimal(timeString: string): number`

Converts time string to decimal hours.

```typescript
convertTimeToDecimal("1hr 40min")  // 1.67
convertTimeToDecimal("34min")      // 0.57
convertTimeToDecimal("2hr")        // 2.00
```

#### `formatTimeFromDecimal(decimal: number): string`

Converts decimal hours back to formatted string.

```typescript
formatTimeFromDecimal(1.67)  // "1hr 40min"
formatTimeFromDecimal(0.57)  // "34min"
formatTimeFromDecimal(2.0)   // "2hr"
```

#### `calculateSectionTotal(tasks: Task[]): number`

Calculates total time for an array of tasks (returns decimal hours).

```typescript
const tasks = [
  { timeSpent: "1hr 40min", ... },
  { timeSpent: "34min", ... },
];
calculateSectionTotal(tasks)  // 2.24
```

#### `calculateSectionTotalFormatted(tasks: Task[]): string`

Calculates and formats total time.

```typescript
calculateSectionTotalFormatted(tasks)  // "2hr 14min"
```

#### `isValidTimeFormat(timeString: string): boolean`

Validates time string format.

```typescript
isValidTimeFormat("1hr 40min")  // true
isValidTimeFormat("invalid")    // false
```

#### `normalizeTimeString(timeString: string): string`

Normalizes time format to consistent output.

```typescript
normalizeTimeString("1hr40min")  // "1hr 40min"
normalizeTimeString("90min")     // "90min"
```

## Report Utilities

### Creating Reports

#### `createEmptyReport(date?: string): Report`

Creates a new report with default structure.

```typescript
const report = createEmptyReport("2026-02-05");
```

#### `createEmptyTask(): Task`

Creates a new empty task with default values.

```typescript
const task = createEmptyTask();
task.link = "https://jira.example.com/PROJ-123";
task.status = "IN PROGRESS";
task.timeSpent = "1hr 30min";
```

### Calculations

#### `calculateSectionTotalTime(section: Section): number`

Calculates total time for a section (including all subsections).

```typescript
const total = calculateSectionTotalTime(section);
const formatted = formatTimeFromDecimal(total);
```

#### `calculateReportTotalTime(report: Report): number`

Calculates total time for entire report.

```typescript
const total = calculateReportTotalTime(report);
console.log(`Total: ${formatTimeFromDecimal(total)}`);
```

#### `countTasksByStatus(report: Report): Record<string, number>`

Counts tasks by status across entire report.

```typescript
const counts = countTasksByStatus(report);
// { DONE: 5, "IN PROGRESS": 3, "MR RAISED": 2, ... }
```

### Task Management

#### `addTaskToSection(section: Section, task: Task, subSectionId?: string): Section`

Adds a task to a section or subsection.

```typescript
const updatedSection = addTaskToSection(section, task, subSectionId);
```

#### `removeTaskFromSection(section: Section, taskId: string): Section`

Removes a task from a section.

```typescript
const updatedSection = removeTaskFromSection(section, taskId);
```

#### `updateTaskInSection(section: Section, taskId: string, updates: Partial<Task>): Section`

Updates a task in a section.

```typescript
const updatedSection = updateTaskInSection(section, taskId, {
  status: "DONE",
  timeSpent: "2hr",
});
```

### Query Functions

#### `getAllTasksFromSection(section: Section): Task[]`

Gets all tasks from a section (including subsections).

```typescript
const allTasks = getAllTasksFromSection(section);
```

#### `findTaskById(report: Report, taskId: string): Task | undefined`

Finds a task by ID anywhere in the report.

```typescript
const task = findTaskById(report, taskId);
```

## Usage Examples

### Example 1: Creating a Daily Report

```typescript
import { createEmptyReport, createEmptyTask } from "@/lib/report-utils";

// Create report
const report = createEmptyReport("2026-02-05");

// Add a task to Panel Valid Bugs > DONE
const task = {
  ...createEmptyTask(),
  link: "https://jira.example.com/BUG-123",
  status: "DONE" as const,
  comment: "Fixed authentication issue",
  timeSpent: "1hr 40min",
};

const panelBugsSection = report.sections.find(
  s => s.name === "Panel Valid Bugs"
);

if (panelBugsSection?.subSections) {
  const doneSubSection = panelBugsSection.subSections.find(
    ss => ss.name === "DONE"
  );
  doneSubSection?.tasks.push(task);
}
```

### Example 2: Calculating Daily Summary

```typescript
import {
  calculateReportTotalTime,
  countTasksByStatus,
} from "@/lib/report-utils";
import { formatTimeFromDecimal } from "@/lib/time-utils";

// Get total time
const totalHours = calculateReportTotalTime(report);
console.log(`Total time: ${formatTimeFromDecimal(totalHours)}`);

// Get task breakdown
const statusCounts = countTasksByStatus(report);
console.log("Tasks completed:", statusCounts.DONE);
console.log("Tasks in progress:", statusCounts["IN PROGRESS"]);
```

### Example 3: Working with Time

```typescript
import {
  convertTimeToDecimal,
  formatTimeFromDecimal,
  calculateSectionTotal,
} from "@/lib/time-utils";

// Convert individual times
const time1 = convertTimeToDecimal("1hr 40min");  // 1.67
const time2 = convertTimeToDecimal("2hr 30min");  // 2.50
const total = time1 + time2;                      // 4.17

// Format back
console.log(formatTimeFromDecimal(total));  // "4hr 10min"

// Or use with task arrays
const tasks = [...];
const totalFormatted = calculateSectionTotalFormatted(tasks);
```

## File Structure

```
├── types/
│   ├── report.ts           # Core type definitions
│   └── index.ts            # Type exports
├── lib/
│   ├── time-utils.ts       # Time conversion utilities
│   ├── report-utils.ts     # Report management utilities
│   └── __examples__/
│       └── report-example.ts  # Usage examples
```

## Best Practices

1. **Always validate time strings** before storing:
   ```typescript
   if (isValidTimeFormat(timeString)) {
     task.timeSpent = normalizeTimeString(timeString);
   }
   ```

2. **Use immutable updates** when modifying sections:
   ```typescript
   const updatedSection = addTaskToSection(section, task);
   // Don't mutate section directly
   ```

3. **Format time for display**:
   ```typescript
   const decimalHours = calculateSectionTotalTime(section);
   const displayTime = formatTimeFromDecimal(decimalHours);
   ```

4. **Use helper functions** for common operations:
   ```typescript
   // Good
   const task = createEmptyTask();

   // Avoid
   const task = { id: generateId(), link: "", ... };
   ```

## Integration with UI

These types and utilities are designed to work seamlessly with React state management:

```typescript
const [report, setReport] = useState<Report>(createEmptyReport());

const handleAddTask = (sectionId: string, task: Task) => {
  setReport(prevReport => ({
    ...prevReport,
    sections: prevReport.sections.map(section =>
      section.id === sectionId
        ? addTaskToSection(section, task)
        : section
    ),
  }));
};
```

## Type Safety

All types are fully typed with TypeScript, providing:
- IntelliSense autocomplete
- Compile-time type checking
- Runtime safety
- Clear API contracts

## Future Enhancements

Potential additions to the system:
- Export to PDF/CSV
- Historical report tracking
- Analytics and insights
- Time tracking with start/stop
- Integration with JIRA API
