# Report Generation Documentation

## Overview

The Daily Report Generator includes powerful report generation functionality that creates formatted text reports ready to copy and share.

## Components

### 1. GenerateReportButton

A button component that generates and copies the formatted report to clipboard.

**Features:**
- Generates formatted report on click
- Automatically copies to clipboard
- Visual feedback (checkmark) when copied
- 2-second success indicator

**Props:**
```typescript
interface GenerateReportButtonProps {
  report: Report;
  onGenerate?: (formattedReport: string) => void;
}
```

**Usage:**
```tsx
<GenerateReportButton
  report={report}
  onGenerate={(formatted) => console.log(formatted)}
/>
```

**Visual States:**
- Default: "Generate & Copy Report" with Copy icon
- Success: "Copied to Clipboard!" with Check icon

---

### 2. ReportPreview

A collapsible card that shows the generated report preview.

**Features:**
- Expandable/collapsible preview
- Monospace font for formatted text
- Scrollable preview area (max 500px)
- Copy button
- Show/hide on demand

**Props:**
```typescript
interface ReportPreviewProps {
  report: Report;
}
```

**Usage:**
```tsx
<ReportPreview report={report} />
```

**Preview Area:**
- Dark/light theme support
- Monospace font (preserves formatting)
- Scrollable for long reports
- Word wrapping for long URLs

---

## Report Formatting

### Format Specification

The report follows a specific text format designed for clarity and consistency.

#### Header
```
Today's Update || DD-MM-YYYY
```

#### Sections with Tasks
```
[Section Name] [count] >>> Total: X.XX hours
    => {link} >> {status} >> {time} >> {comment}
    => {link} >> {status} >> {time}
```

#### Sections with Subsections
```
[Section Name] [count] >>> Total: X.XX hours
    SUBSECTION[count] >>>
    => {link} >> {status} >> {time} >> {comment}
    SUBSECTION2[count] >>>
    => {link} >> {status} >> {time}
```

#### Overall Total
```
Overall Total: X.XX hours
```

#### Next Plan (Optional)
```
Next Plan || DD-MM-YYYY
    => {link} >> {status}
    => {link} >> {status} >> {comment}
```

### Complete Example

```
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
```

---

## Formatting Logic

### 1. Date Formatting

**Function:** `formatDate(isoDate: string): string`

Converts ISO format (YYYY-MM-DD) to display format (DD-MM-YYYY).

```typescript
formatDate("2026-02-04") // "04-02-2026"
```

### 2. Section Filtering

**Function:** `sectionHasTasks(section: Section): boolean`

Only includes sections that have at least one task.

- Sections with no tasks are excluded
- Empty subsections are skipped
- Clean output without empty sections

### 3. Task Counting

**Function:** `countSectionTasks(section: Section): number`

Counts total tasks in a section (including all subsections).

### 4. Task Formatting

**Function:** `formatTask(task: Task): string`

Formats individual tasks:

```
    => {link} >> {status} >> {time} >> {comment}
```

**Rules:**
- Always includes: link, status
- Optional: time (if provided)
- Optional: comment (if provided and not empty)
- Fields separated by " >> "
- Indented with 4 spaces

### 5. SubSection Formatting

**Function:** `formatSubSection(subSection: SubSection): string`

Formats subsections within sections:

```
    SUBSECTION[count] >>>
    => task1
    => task2
```

**Rules:**
- Only includes subsections with tasks
- Shows task count in brackets
- Tasks indented under subsection

### 6. Section Formatting

**Function:** `formatSection(section: Section): string`

Formats complete sections:

```
[Section Name] [count] >>> Total: X.XX hours
```

**Rules:**
- Includes task count
- Shows total time (decimal, 2 places)
- Followed by subsections OR direct tasks

### 7. Next Plan Formatting

**Function:** `formatNextPlan(report: Report): string`

Formats next plan section:

```
Next Plan || DD-MM-YYYY
    => task1
    => task2
```

**Rules:**
- Only included if nextPlanDate is set
- Only included if nextPlanTasks has items
- Tasks formatted same as regular tasks

---

## Utility Functions

### generateFormattedReport

Main function that generates the complete formatted report.

```typescript
function generateFormattedReport(report: Report): string
```

**Process:**
1. Add header with today's date
2. Loop through sections
3. Format each section with tasks
4. Calculate overall total
5. Add next plan (if exists)
6. Return complete string

**Example:**
```typescript
import { generateFormattedReport } from "@/lib/report-formatter";

const formatted = generateFormattedReport(report);
console.log(formatted);
```

### copyToClipboard

Async function to copy text to clipboard.

```typescript
async function copyToClipboard(text: string): Promise<boolean>
```

**Returns:**
- `true` if successful
- `false` if failed

**Example:**
```typescript
import { copyToClipboard } from "@/lib/report-formatter";

const success = await copyToClipboard(formattedReport);
if (success) {
  console.log("Copied!");
}
```

---

## Integration

### In Main Page

The components are integrated in the sidebar:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Actions</CardTitle>
  </CardHeader>
  <CardContent>
    <GenerateReportButton report={report} />
  </CardContent>
</Card>

<ReportPreview report={report} />
```

### Workflow

1. User fills in tasks throughout sections
2. User clicks "Generate & Copy Report"
3. Report is formatted using `generateFormattedReport()`
4. Text is copied to clipboard
5. Success indicator shows for 2 seconds
6. User can paste report anywhere

**Alternative:**
1. User clicks "Expand" on Report Preview
2. Preview shows formatted report
3. User clicks "Copy Report"
4. Report copied to clipboard

---

## Features

### Smart Filtering

- **Empty sections skipped:** Only sections with tasks appear
- **Empty subsections skipped:** Only subsections with tasks appear
- **Optional fields:** Comment only included if provided
- **Next plan optional:** Only included if date and tasks exist

### Accurate Totals

- **Section totals:** Sum of all tasks in section (including subsections)
- **Overall total:** Sum of all section totals
- **Decimal precision:** Always 2 decimal places (e.g., 4.88 hours)

### Format Consistency

- **Date format:** Always DD-MM-YYYY
- **Indentation:** Consistent 4-space indentation
- **Separators:** Always " >> " between fields
- **Line endings:** Proper newlines for readability

---

## Examples

### Example 1: Simple Report

**Input:**
- 1 section with 2 tasks
- No next plan

**Output:**
```
Today's Update || 05-02-2026
[Testing] [2] >>> Total: 2.50 hours
    => https://example.com/task1 >> DONE >> 1hr 30min
    => https://example.com/task2 >> DONE >> 1hr

Overall Total: 2.50 hours
```

### Example 2: Complex Report

**Input:**
- Multiple sections
- Sections with subsections
- Next plan with tasks

**Output:**
```
Today's Update || 05-02-2026
[Panel Valid Bugs] [3] >>> Total: 4.25 hours
    DONE[1] >>>
    => https://example.com/task1 >> DONE >> 2hr
    IN PROGRESS[2] >>>
    => https://example.com/task2 >> IN PROGRESS >> 1hr 30min
    => https://example.com/task3 >> IN PROGRESS >> 45min

[Testing] [1] >>> Total: 1.00 hours
    => https://example.com/task4 >> COMPLETED >> 1hr

Overall Total: 5.25 hours

Next Plan || 06-02-2026
    => https://example.com/task5 >> IN PROGRESS
```

### Example 3: With Comments

**Input:**
- Tasks with comments

**Output:**
```
Today's Update || 05-02-2026
[Internal Valid Bug] [2] >>> Total: 3.50 hours
    => https://example.com/task1 >> DONE >> 2hr >> Fixed authentication issue
    => https://example.com/task2 >> MR RAISED >> 1hr 30min >> Added validation

Overall Total: 3.50 hours
```

---

## Testing

### Manual Testing

1. Create tasks in different sections
2. Add tasks with and without comments
3. Set next plan date and tasks
4. Click "Generate & Copy Report"
5. Paste in text editor
6. Verify format matches specification

### Format Validation

- Check date format (DD-MM-YYYY)
- Verify section totals match task times
- Confirm overall total is correct
- Ensure empty sections are excluded
- Verify indentation is consistent

---

## File Structure

```
lib/
├── report-formatter.ts           # Core formatting logic
└── __examples__/
    └── report-format-example.ts  # Example usage

components/
├── GenerateReportButton.tsx      # Generate & copy button
└── ReportPreview.tsx            # Preview component
```

---

## Best Practices

1. **Always preview first:** Expand preview before copying
2. **Verify totals:** Check that time calculations are correct
3. **Test formatting:** Paste in text editor to verify
4. **Use comments:** Add context to tasks for better reports
5. **Set next plan:** Include next day's tasks for continuity

---

## Troubleshooting

### Report is empty
- **Cause:** No sections have tasks
- **Solution:** Add tasks to at least one section

### Totals don't match
- **Cause:** Invalid time format in tasks
- **Solution:** Use valid format (e.g., "1hr 40min")

### Copy fails
- **Cause:** Browser permissions
- **Solution:** Manually allow clipboard access

### Format looks wrong
- **Cause:** Viewing in rich text editor
- **Solution:** Paste in plain text editor or monospace font

---

## Future Enhancements

Potential improvements:

1. **Export formats:** PDF, CSV, JSON
2. **Template system:** Custom report formats
3. **Email integration:** Send report directly
4. **History:** Save previous reports
5. **Comparison:** Compare reports over time
6. **Charts:** Visual representation of data

---

This documentation provides complete information about the report generation functionality, including formatting rules, components, and usage examples.
