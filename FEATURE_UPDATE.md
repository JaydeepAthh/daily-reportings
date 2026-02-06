# Feature Update: Dynamic Subsection Management

## Overview
This update adds powerful new functionality for managing subsections dynamically in your daily report application. Users can now create custom subsections for any section and automatically move tasks between subsections by changing their status.

## New Features

### 1. **Add Subsections to Any Section**
- Sections that already have subsections now display an "Add Subsection" button
- Click the button to open a dialog where you can name your new subsection
- Perfect for creating custom workflow stages beyond the default (DONE, MR RAISED, IN PROGRESS, D&T)

### 2. **Delete Custom Subsections**
- Non-fixed (custom) subsections can now be deleted
- A trash icon appears next to the "Add Task" button for custom subsections
- Fixed subsections (from default templates) cannot be deleted to maintain consistency

### 3. **Convert Flat Sections to Subsections**
- Sections without subsections now show a grid icon button (⊞)
- Click this button to convert the section into a subsection-based structure
- Existing tasks are automatically moved to the "IN PROGRESS" subsection
- Four default subsections are created: DONE, MR RAISED, IN PROGRESS, D&T

### 4. **Automatic Task Movement on Status Change**
- **This is the key feature!** When you change a task's status, it automatically moves to the matching subsection
- For example:
  - Task in "IN PROGRESS" subsection → Change status to "DONE" → Task moves to "DONE" subsection
  - Task in "MR RAISED" subsection → Change status to "D&T" → Task moves to "D&T" subsection
- This creates a visual Kanban-style workflow where tasks flow through stages

## How It Works

### Status-Based Task Movement
The system uses smart matching to move tasks:
1. When you update a task's status in a section with subsections
2. The system looks for a subsection whose name matches the new status
3. If found, the task is removed from its current subsection and added to the target subsection
4. The task's status is updated accordingly

### Example Workflow
```
Section: "Panel Valid Bugs"
├── Subsections:
│   ├── IN PROGRESS (2 tasks)
│   ├── MR RAISED (1 task)
│   ├── DONE (3 tasks)
│   └── D&T (0 tasks)

User Action: Change task status from "IN PROGRESS" to "MR RAISED"
Result: Task moves from "IN PROGRESS" subsection to "MR RAISED" subsection
```

## UI Changes

### SectionCard Component
- **Sections with subsections:**
  - Show "Add Subsection" button (folder plus icon)
  - Each custom subsection shows a delete button (trash icon)
  
- **Sections without subsections:**
  - Show "Add Task" button (as before)
  - Show "Convert to Subsections" button (grid icon)

### Visual Indicators
- Subsection count badges show number of tasks
- Total time per subsection displayed
- Delete buttons only appear on non-fixed subsections

## Technical Implementation

### New Functions in `report-utils.ts`
1. **`addSubSectionToSection()`** - Adds a new subsection to a section
2. **`deleteSubSectionFromSection()`** - Removes a subsection from a section
3. **`convertSectionToSubSections()`** - Converts flat section to subsection structure
4. **`moveTaskBetweenSubSections()`** - Handles automatic task movement based on status

### Updated Components
1. **`SectionCard.tsx`**
   - Added dialog for creating subsections
   - Added convert button for flat sections
   - Pass delete handlers to SubSectionCard

2. **`SubSectionCard.tsx`**
   - Added delete button for custom subsections
   - Updated layout to accommodate new actions

3. **`page.tsx`**
   - New handlers: `handleAddSubSection`, `handleDeleteSubSection`, `handleConvertToSubSections`
   - Updated `handleUpdateTask` to detect status changes and trigger task movement

## Usage Examples

### Creating a Custom Workflow
1. Create a custom section: "Feature Development"
2. Convert it to subsections (click grid icon)
3. Add custom subsections: "BACKLOG", "CODE REVIEW", "QA"
4. As you work, change task status and watch them flow through the workflow

### Managing Technical Debt
1. Create section: "Technical Debt"
2. Add subsections: "IDENTIFIED", "PLANNED", "IN WORK", "COMPLETED"
3. Tasks automatically move as you update their status

## Benefits

✅ **Visual Task Flow** - See your work progress through different stages
✅ **Automatic Organization** - No manual drag-and-drop needed
✅ **Flexible Workflows** - Create sections that match your team's process
✅ **Status Synchronization** - Task status and location stay in sync
✅ **Reduced Errors** - Can't have a task marked "DONE" sitting in "IN PROGRESS"

## Notes

- Fixed subsections (from default templates) maintain their structure
- Custom subsections and sections can be freely added/removed
- If no matching subsection exists for a status, the task stays in place but updates its status
- Converting a section to subsections preserves all existing tasks

## Future Enhancements

Potential improvements for future versions:
- Drag-and-drop task movement between subsections
- Custom status definitions per section
- Subsection ordering/reordering
- Collapsible subsections
- Subsection-level time tracking and statistics
