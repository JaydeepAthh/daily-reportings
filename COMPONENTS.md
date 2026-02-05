# Components Documentation

## Overview

The Daily Report Generator includes 5 main components that work together to create a comprehensive task tracking interface.

## Component Structure

```
components/
├── DateSelector.tsx        # Date selection for report and next plan
├── TaskRow.tsx            # Individual task input row
├── SubSectionCard.tsx     # Subsection container with tasks
├── SectionCard.tsx        # Main section container (expandable)
└── AddSectionButton.tsx   # Dialog to add custom sections
```

## Components

### 1. DateSelector

**Purpose:** Allows users to set today's report date and next plan date.

**Props:**
```typescript
interface DateSelectorProps {
  todayDate: string;          // ISO format: YYYY-MM-DD
  nextPlanDate: string;       // ISO format: YYYY-MM-DD
  onTodayDateChange: (date: string) => void;
  onNextPlanDateChange: (date: string) => void;
}
```

**Features:**
- Native HTML5 date inputs
- Display format preview (DD-MM-YYYY)
- Default to current date
- Responsive grid layout (2 columns on desktop)

**Usage:**
```tsx
<DateSelector
  todayDate={report.date}
  nextPlanDate={report.nextPlanDate}
  onTodayDateChange={handleTodayDateChange}
  onNextPlanDateChange={handleNextPlanDateChange}
/>
```

---

### 2. TaskRow

**Purpose:** Single task input with all fields (link, status, time, comment).

**Props:**
```typescript
interface TaskRowProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}
```

**Features:**
- **ClickUp Link Input:** Text input for task URL
- **Status Dropdown:** Select from 6 status options
  - DONE
  - MR RAISED
  - IN PROGRESS
  - D&T
  - COMPLETED
  - DEV REPLIED
- **Time Input:** Flexible format support
  - "1hr 40min"
  - "34min"
  - "2hr"
  - Real-time validation
  - Shows decimal time inline (e.g., "1.67h")
- **Comment Field:** Optional text input
- **Delete Button:** Remove task
- **Validation Feedback:** Red border and error message for invalid time

**Layout:**
- 4-column grid on desktop (link, status, time, delete)
- Full-width comment field below
- Responsive: stacks on mobile

**Usage:**
```tsx
<TaskRow
  task={task}
  onUpdate={(taskId, updates) => handleUpdate(taskId, updates)}
  onDelete={(taskId) => handleDelete(taskId)}
/>
```

---

### 3. SubSectionCard

**Purpose:** Container for tasks within a subsection (e.g., DONE, MR RAISED).

**Props:**
```typescript
interface SubSectionCardProps {
  subSection: SubSection;
  onAddTask: (subSectionId: string) => void;
  onUpdateTask: (subSectionId: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (subSectionId: string, taskId: string) => void;
}
```

**Features:**
- Subsection header with name
- Task count badge
- Subtotal time display (decimal hours)
- "Add Task" button
- List of TaskRow components
- Empty state message
- Left border accent (primary color)
- Muted background

**Usage:**
```tsx
<SubSectionCard
  subSection={subSection}
  onAddTask={handleAddTask}
  onUpdateTask={handleUpdateTask}
  onDeleteTask={handleDeleteTask}
/>
```

---

### 4. SectionCard

**Purpose:** Main organizational unit that can contain either subsections or direct tasks.

**Props:**
```typescript
interface SectionCardProps {
  section: Section;
  onAddTask: (sectionId: string, subSectionId?: string) => void;
  onUpdateTask: (
    sectionId: string,
    taskId: string,
    updates: Partial<Task>,
    subSectionId?: string
  ) => void;
  onDeleteTask: (sectionId: string, taskId: string, subSectionId?: string) => void;
  onDeleteSection?: (sectionId: string) => void;
}
```

**Features:**
- **Expandable/Collapsible:** Click chevron to toggle
- **Header Information:**
  - Section name
  - Task count
  - Total time (decimal hours)
- **Actions:**
  - "Add Task" button (for sections without subsections)
  - "Delete Section" button (only for non-fixed sections)
- **Content:**
  - Multiple SubSectionCards (if has subsections)
  - Multiple TaskRows (if no subsections)
  - Empty state message
- **Visual Indicators:**
  - ChevronDown/ChevronRight icons
  - Highlighted total time in primary color
  - Separator line below header

**Behavior:**
- Fixed sections (from defaults) cannot be deleted
- Custom sections show delete button
- Collapses to save space
- Defaults to expanded state

**Usage:**
```tsx
<SectionCard
  section={section}
  onAddTask={handleAddTask}
  onUpdateTask={handleUpdateTask}
  onDeleteTask={handleDeleteTask}
  onDeleteSection={handleDeleteSection}
/>
```

---

### 5. AddSectionButton

**Purpose:** Dialog to create custom sections with or without subsections.

**Props:**
```typescript
interface AddSectionButtonProps {
  onAddSection: (name: string, withSubSections: boolean) => void;
}
```

**Features:**
- Full-width button with icon
- Modal dialog on click
- **Form Fields:**
  - Section name input (required)
  - Checkbox for subsections
  - Helper text explaining subsections
- **Dialog Actions:**
  - Cancel button
  - Submit button (disabled until name entered)
- Auto-creates 4 subsections if checked:
  - DONE
  - MR RAISED
  - IN PROGRESS
  - D&T

**Usage:**
```tsx
<AddSectionButton onAddSection={handleAddSection} />
```

---

## Main Page Integration

The `app/page.tsx` integrates all components:

### Layout

```
┌─────────────────────────────────────┬─────────────┐
│ Header (Title + Description)        │             │
├─────────────────────────────────────┤             │
│ Date Selectors Card                 │ Statistics  │
├─────────────────────────────────────┤    Card     │
│ Section Cards (Expandable)          │             │
│   - Panel Valid Bugs                ├─────────────┤
│   - Panel Invalid/Dev Reply         │   Actions   │
│   - Live Valid Bug                  │    Card     │
│   - Live Invalid Bug                │             │
│   - Internal Valid Bug              │             │
│   - Internal Invalid Bug            │             │
│   - Testing                         │             │
│   - [Custom Sections]               │             │
├─────────────────────────────────────┤             │
│ Add Custom Section Button           │             │
└─────────────────────────────────────┴─────────────┘
```

### State Management

**Single Report State:**
```typescript
const [report, setReport] = useState<Report>(() =>
  createEmptyReport(new Date().toISOString().split("T")[0])
);
```

**Core Handlers:**
- `handleTodayDateChange` - Update report date
- `handleNextPlanDateChange` - Update next plan date
- `handleAddTask` - Add task to section/subsection
- `handleUpdateTask` - Update task fields
- `handleDeleteTask` - Remove task
- `handleAddSection` - Create custom section
- `handleDeleteSection` - Remove custom section
- `generateReport` - Create markdown output
- `handleCopyReport` - Copy to clipboard

### Features

**Statistics Sidebar:**
- Total time (formatted and decimal)
- Task breakdown by status
- Real-time updates

**Report Generation:**
- Markdown formatted output
- Includes all sections and tasks
- Task statistics summary
- Next plan section
- Copy to clipboard

---

## Styling

All components use:
- **shadcn/ui** components for consistency
- **Tailwind CSS** for styling
- **lucide-react** for icons
- Responsive design patterns
- Dark mode support (automatic)

### Color Scheme

- Primary: Used for accents, totals, badges
- Muted: Used for subsection backgrounds
- Destructive: Used for delete buttons
- Card: Used for section backgrounds

### Spacing

- Consistent `gap-*` utilities
- `space-y-*` for vertical stacking
- `px-*` and `py-*` for padding
- Responsive breakpoints (sm, lg)

---

## Time Display

All components show time in **two formats**:

1. **Human-readable:** "1hr 40min", "34min", "2hr"
2. **Decimal:** 1.67h, 0.57h, 2.00h

### Conversion Flow

```
User Input → Validation → Storage → Display
"1hr 40min" → ✓ Valid → "1hr 40min" → "1hr 40min (1.67h)"
```

### Validation

- Real-time validation in TaskRow
- Red border for invalid input
- Error message below field
- Accepts flexible formats

---

## Data Flow

```
User Action
    ↓
Event Handler (in page.tsx)
    ↓
State Update (setReport)
    ↓
Re-render Components
    ↓
Display Updated Data
```

### Immutability

All updates use immutable patterns:

```typescript
setReport((prev) => ({
  ...prev,
  sections: prev.sections.map((section) =>
    section.id === sectionId
      ? { ...section, /* updates */ }
      : section
  ),
}));
```

---

## Icons Used

From `lucide-react`:

- `Plus` - Add buttons
- `Trash2` - Delete buttons
- `ChevronDown/ChevronRight` - Expand/collapse
- `FileDown` - Copy report
- `BarChart3` - Statistics header

---

## Accessibility

- Semantic HTML elements
- Proper label associations
- Keyboard navigation support
- Focus indicators
- ARIA labels (from shadcn/ui)

---

## Responsive Behavior

### Desktop (lg+)
- 2-column layout (main + sidebar)
- 4-column task input grid
- 2-column date selector

### Tablet (md)
- Stacked layout
- 2-column task inputs
- Full-width sidebar

### Mobile (sm)
- Single column
- Stacked task inputs
- Full-width all elements

---

## Performance Optimizations

- State updates batched by React
- Minimal re-renders (isolated state)
- Lazy expansion (collapsed by default option)
- Efficient list rendering with keys

---

## Future Enhancements

Potential improvements:

1. **Drag & Drop:** Reorder sections and tasks
2. **Search/Filter:** Find tasks by link or comment
3. **Export Options:** PDF, CSV, JSON
4. **Templates:** Save custom section layouts
5. **Keyboard Shortcuts:** Quick actions
6. **Undo/Redo:** State history
7. **Auto-save:** localStorage persistence
8. **Dark Mode Toggle:** Manual override

---

## Component Dependencies

```
page.tsx
├── DateSelector
├── SectionCard
│   ├── SubSectionCard
│   │   └── TaskRow
│   └── TaskRow
└── AddSectionButton
```

**shadcn/ui Components Used:**
- Button
- Input
- Select
- Card
- Dialog
- Label
- Separator

**Utility Dependencies:**
- `@/lib/time-utils`
- `@/lib/report-utils`
- `@/types/report`

---

## Testing Components

Each component can be tested independently:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskRow } from '@/components/TaskRow';

test('renders task row with inputs', () => {
  const mockTask = {
    id: '1',
    link: 'https://example.com',
    status: 'DONE',
    timeSpent: '1hr',
    comment: 'Test comment',
  };

  render(
    <TaskRow
      task={mockTask}
      onUpdate={jest.fn()}
      onDelete={jest.fn()}
    />
  );

  expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
});
```

---

## Quick Reference

### Adding a Task

1. User clicks "Add Task" in SectionCard or SubSectionCard
2. Calls `onAddTask(sectionId, subSectionId?)`
3. Parent creates new task with `createEmptyTask()`
4. Adds to appropriate array in state
5. TaskRow renders for editing

### Updating a Task

1. User edits field in TaskRow
2. Calls `onUpdate(taskId, updates)`
3. Parent updates task in state immutably
4. Component re-renders with new values

### Deleting a Task

1. User clicks delete button in TaskRow
2. Calls `onDelete(taskId)`
3. Parent filters task from array
4. Component re-renders without task

### Adding a Section

1. User clicks "Add Custom Section"
2. Dialog opens with form
3. User enters name and options
4. Calls `onAddSection(name, withSubSections)`
5. Parent creates section with subsections if requested
6. New SectionCard renders

---

This documentation provides a complete reference for understanding and working with all components in the Daily Report Generator.
