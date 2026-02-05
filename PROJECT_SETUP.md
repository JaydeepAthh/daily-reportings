# Daily Bug Report Generator - Project Setup

## Tech Stack
- **Next.js**: 16.1.6 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x
- **Tailwind CSS**: v4
- **shadcn/ui**: Latest
- **Runtime**: Client-side only (no persistence)

## Project Structure

```
daily-reports/
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles with Tailwind v4
├── components/
│   └── ui/               # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       └── label.tsx
├── lib/
│   ├── utils.ts          # Utility functions (cn helper)
│   ├── time-utils.ts     # Time conversion utilities
│   ├── report-utils.ts   # Report management utilities
│   ├── __examples__/     # Usage examples
│   └── __tests__/        # Unit tests
├── types/
│   ├── index.ts          # Type exports
│   ├── bug-report.ts     # Bug report type definitions
│   └── report.ts         # Daily report type definitions
├── public/               # Static assets
├── PROJECT_SETUP.md      # This file
└── REPORTING_SYSTEM.md   # Comprehensive reporting system docs
```

## Features

### 1. Bug Report Form
- Title
- Description
- Severity (Low, Medium, High, Critical)
- Status (Open, In Progress, Resolved, Closed)
- Steps to Reproduce
- Expected Behavior
- Actual Behavior
- Environment

### 2. Report Generation
- Generates formatted markdown reports
- UUID for each report
- Timestamp tracking
- Copy to clipboard functionality

### 3. Report Display
- Real-time list of generated reports
- Color-coded severity badges
- Responsive card layout
- Clean, minimal UI

## Running the Application

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

## Development Server
The app runs on: http://localhost:3000

## Data Persistence
- All data stored in React state
- No database or localStorage
- Data resets on page refresh

## Styling
- Tailwind CSS v4 with custom theme
- Dark mode support
- Responsive design
- shadcn/ui components for consistent UX

## Reporting System

The project includes a comprehensive type-safe reporting system for daily task tracking.

### Core Types

1. **Task**: Individual work items with link, status, comment, and time tracking
2. **SubSection**: Groups of tasks (e.g., DONE, MR RAISED, IN PROGRESS)
3. **Section**: Main categories (Panel Valid Bugs, Live Bugs, Testing, etc.)
4. **Report**: Complete daily report with sections and next plan

### Default Sections

- Panel Valid Bugs (with subsections: DONE, MR RAISED, IN PROGRESS, D&T)
- Panel Invalid/Dev. Reply Bugs
- Live Valid Bug
- Live Invalid Bug
- Internal Valid Bug
- Internal Invalid Bug
- Testing

### Time Tracking

Flexible time format support: `"1hr 40min"`, `"34min"`, `"2hr"`

**Utility Functions:**
- `convertTimeToDecimal()` - Convert to decimal hours
- `formatTimeFromDecimal()` - Format back to readable time
- `calculateSectionTotal()` - Sum time for tasks
- `isValidTimeFormat()` - Validate time strings
- `normalizeTimeString()` - Standardize format

### Report Management

**Helper Functions:**
- `createEmptyReport()` - Initialize report with default structure
- `createEmptyTask()` - Create new task
- `calculateSectionTotalTime()` - Calculate section total (including subsections)
- `calculateReportTotalTime()` - Calculate entire report total
- `countTasksByStatus()` - Get task count breakdown
- `addTaskToSection()` - Immutably add tasks
- `removeTaskFromSection()` - Immutably remove tasks
- `updateTaskInSection()` - Immutably update tasks

### Documentation

See `REPORTING_SYSTEM.md` for:
- Complete API reference
- Usage examples
- Best practices
- Integration guides

### Examples

```typescript
import { createEmptyReport, createEmptyTask } from "@/lib/report-utils";
import { formatTimeFromDecimal, calculateSectionTotal } from "@/lib/time-utils";

// Create a report
const report = createEmptyReport("2026-02-05");

// Add a task
const task = {
  ...createEmptyTask(),
  link: "https://jira.example.com/PROJ-123",
  status: "DONE",
  timeSpent: "1hr 40min",
};

// Calculate totals
const total = calculateReportTotalTime(report);
console.log(formatTimeFromDecimal(total)); // "1hr 40min"
```
