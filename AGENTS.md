# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 16 application for generating structured daily work reports. Users create reports by organizing tasks into sections/subsections, tracking time spent, and exporting formatted text reports. The app supports importing existing reports, template management, and localStorage persistence.

## Technology Stack

- **Framework**: Next.js 16.1.6 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 with PostCSS
- **UI Components**: Custom components built on Radix UI primitives
- **State Management**: React hooks + localStorage
- **Dev Server**: Runs on port 3001

## Development Commands

```bash
# Development server (port 3001)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Architecture

### Core Data Model (`types/report.ts`)

The application centers around a hierarchical report structure:

```
Report
├── date: string (ISO format)
├── sections: Section[]
│   ├── name: string
│   ├── isFixed: boolean (whether user can delete)
│   ├── subSections?: SubSection[] (for categorized tasks)
│   │   └── tasks: Task[]
│   └── tasks?: Task[] (for flat task lists)
├── nextPlanDate: string
└── nextPlanTasks: Task[]

Task
├── id: string (UUID)
├── link: string (task URL)
├── status: TaskStatus
├── timeSpent: string ("1hr 40min" | "34min" | "2hr")
└── comment?: string
```

**Key distinction**: Sections either have `subSections` (e.g., "Panel Valid Bugs" with DONE/MR RAISED/IN PROGRESS/D&T subsections) OR direct `tasks` (e.g., "Testing"). Never both.

### Report Format

The app generates/parses reports in this exact text format:

```
Today's Update || 04-02-2026
[Section Name] [task_count] >>>
    SUBSECTION[count] >>>
    => https://task-url >> STATUS >> 1hr 40min >> optional comment
Next Plan || 05-02-2026
    => https://task-url >> STATUS
```

### Key Libraries (`lib/`)

- **report-utils.ts**: CRUD operations for reports/sections/tasks, time calculations
- **report-formatter.ts**: Generates formatted report text, validates completeness
- **reportParser.ts**: Parses text reports back into data structures with fuzzy matching and validation
- **time-utils.ts**: Time string parsing ("1hr 40min" ↔ decimal hours)

### State Management Pattern

The app uses a custom localStorage hook system:

1. **useLocalStorage** (`hooks/useLocalStorage.ts`): Core hook for persisted state
2. **usePersistenceToggle**: Global toggle for localStorage on/off
3. **useHasStoredData**: Checks if data exists in storage

State updates use immutable patterns with React setState callbacks.

### Import/Export Flow

**Export**: Report → `generateFormattedReport()` → Text → Clipboard

**Import**: Text → `parseReport()` → Validation → State Update → History Save

The parser (`reportParser.ts`) is intelligent:
- Fuzzy status matching ("WIP" → "IN PROGRESS", "Done" → "DONE")
- Platform detection (ClickUp, Jira, GitHub, GitLab)
- Section name normalization
- Auto-formatting time strings
- Comprehensive error/warning tracking

## Component Structure

### Main Page (`app/page.tsx`)

The single-page application that orchestrates everything. Uses client-side rendering (`"use client"`).

**State Management**:
- Main report state with localStorage persistence
- Validation warnings tracking
- Import history management
- Compare view toggle

**Key Features**:
- Keyboard shortcuts (Ctrl+S: generate report, Ctrl+I: import)
- Real-time statistics calculation
- Beforeunload warning if unsaved data
- Toast notifications

### Component Organization

- **UI Components** (`components/ui/`): Reusable primitives (button, card, input, dialog, etc.)
- **Feature Components** (`components/`): Business logic components
  - `SectionCard`: Renders a section with add/edit/delete functionality
  - `TaskRow`: Individual task with inline editing
  - `DateSelector`: Date pickers for report and next plan dates
  - `ReportPreview`: Live preview of formatted output
  - `ImportReportDialog`: Modal for pasting and parsing reports
  - `ValidationWarnings`: Display incomplete tasks
  - `CompareView`: Side-by-side diff of imported vs current
  - `TemplateManager`: Save/load section structures

### Path Alias

All imports use `@/*` which resolves to project root (configured in `tsconfig.json`).

## Development Guidelines

### Adding New Task Statuses

1. Update `TaskStatus` type in `types/report.ts`
2. Add to `countTasksByStatus()` in `lib/report-utils.ts`
3. Update fuzzy matcher in `parseStatus()` in `lib/reportParser.ts`
4. Add to statistics display in `app/page.tsx`

### Adding New Sections

Sections come in two types:
1. **With subsections**: Use for categorized workflows (status-based)
2. **Flat tasks**: Use for simple lists (testing, bugs without workflow)

Default sections are defined in `types/report.ts` as `DEFAULT_SECTIONS`.

### Time Format Handling

Time values are stored as strings ("1hr 40min") but calculated as decimals:
- **Input**: User types flexible formats (1h 40m, 100min, 1.5hr)
- **Storage**: Normalized format (Xhr Ymin)
- **Calculation**: Convert to decimal, sum, convert back

Use `parseTimeToDecimal()` and `formatDecimalToTime()` from `time-utils.ts`.

### Parser Enhancements

When improving `reportParser.ts`:
- Add new patterns to regex matchers
- Update fuzzy matching dictionaries
- Add validation warnings (not errors) for recoverable issues
- Track statistics for UX feedback
- Preserve original line numbers for error reporting

### State Updates

Always use functional updates for nested state:

```typescript
setReport(prev => ({
  ...prev,
  sections: prev.sections.map(section =>
    section.id === targetId
      ? { ...section, /* updates */ }
      : section
  )
}))
```

### UUID Generation

Use `crypto.randomUUID()` for all ID generation (called via `generateId()` helper).

## Testing Approach

While no test suite exists, manually test:
1. Create report with various section types
2. Export and copy to clipboard
3. Import the exported text (round-trip test)
4. Toggle localStorage on/off
5. Test keyboard shortcuts
6. Validate incomplete task warnings

Test with edge cases:
- Empty sections
- Tasks without time
- Non-standard URLs
- Various time formats
- Fuzzy status matches

## Common Patterns

### Adding a New Component

1. Create in `components/` (or `components/ui/` if reusable primitive)
2. Import types from `@/types/report`
3. Use existing UI components from `components/ui/`
4. Follow existing prop patterns (onAdd, onUpdate, onDelete)

### Working with Forms

Use controlled components with React state. Time inputs and status selects should validate on blur.

### Styling

- Use Tailwind utility classes
- Follow existing component patterns for consistency
- Use `clsx` for conditional classes
- Use `tailwind-merge` (via `lib/utils.ts` `cn()` helper) to merge conflicting classes

## Known Behaviors

- Dev server runs on port 3001 (not default 3000)
- Strict TypeScript mode is enabled
- localStorage key: `"daily-report"`
- Date format internally: ISO (YYYY-MM-DD), displayed as DD-MM-YYYY
- The app is a single-page application (no routing)
