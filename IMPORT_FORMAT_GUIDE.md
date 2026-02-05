# Import Report Format Guide

## Overview

The Daily Report Generator now supports importing existing reports from text format. This allows you to:
- Quickly populate the app from existing daily update text
- Backup and restore your reports
- Share report templates with team members
- Migrate from text-based reporting to the app

## How to Use

### Opening the Import Dialog

1. **Click the Button**: Click "Import Existing Report" at the top of the page
2. **Keyboard Shortcut**: Press `Ctrl+I` (or `Cmd+I` on Mac)

### Importing a Report

1. Paste your report text into the textarea
2. The parser will validate in real-time
3. Review any warnings or errors
4. Click "Load into Editor" to import
5. If you have existing data, you'll be asked to confirm before overwriting

## Report Format

### Basic Structure

```
Today's Update || DD-MM-YYYY
[Section Name] [count] >>>
    => task_url >> STATUS >> time >> comment
Next Plan || DD-MM-YYYY
    => task_url >> STATUS
```

### Date Format

- **Required**: `DD-MM-YYYY` (e.g., `04-02-2026`)
- Must appear after `Today's Update ||`
- Example: `Today's Update || 04-02-2026`

### Sections

Sections can have two formats:

#### 1. Simple Sections (Direct Tasks)

```
[Section Name] [task_count] >>>
    => https://app.clickup.com/t/task1 >> COMPLETED >> 1hr 30min
    => https://app.clickup.com/t/task2 >> IN PROGRESS >> 45min >> Working on feature X
```

#### 2. Sections with Subsections

```
[Section Name] [total_count] >>>
    SUBSECTION_NAME[count] >>>
    => https://app.clickup.com/t/task1 >> DONE >> 2hr
    ANOTHER_SUBSECTION[count] >>>
    => https://app.clickup.com/t/task2 >> IN PROGRESS >> 1hr 15min
```

**Common Subsections:**
- `DONE[count] >>>`
- `MR RAISED[count] >>>`
- `IN PROGRESS[count] >>>`
- `D&T[count] >>>`

### Task Format

Tasks must follow this format:
```
=> {link} >> {status} >> {time} >> {comment}
```

**Fields:**
1. **Link** (Required): Must start with `https://`
   - Example: `https://app.clickup.com/t/86d1ukvez`

2. **Status** (Required): One of the following:
   - `DONE`
   - `MR RAISED`
   - `IN PROGRESS`
   - `D&T`
   - `COMPLETED`
   - `DEV REPLIED`

3. **Time** (Optional): Format like `1hr 40min`, `2hr`, or `45min`
   - If omitted, the next field is treated as comment

4. **Comment** (Optional): Any text after the time
   - Can contain `>>` characters
   - Everything after the last status/time is treated as comment

### Task Examples

```
✅ Full task with all fields:
=> https://app.clickup.com/t/123 >> COMPLETED >> 2hr 30min >> Fixed the login bug

✅ Task with status and time only:
=> https://app.clickup.com/t/123 >> IN PROGRESS >> 1hr 15min

✅ Task with status and comment only (no time):
=> https://app.clickup.com/t/123 >> D&T >> Milan is working on this

✅ Task with status only:
=> https://app.clickup.com/t/123 >> COMPLETED

✅ Comment with >> characters:
=> https://app.clickup.com/t/123 >> DONE >> 1hr >> Used >> operator in code

❌ Invalid - no status:
=> https://app.clickup.com/t/123 >> 2hr 30min

❌ Invalid - not a URL:
=> task123 >> COMPLETED
```

### Next Plan Section

The Next Plan section is optional:

```
Next Plan || 05-02-2026
    => https://app.clickup.com/t/future-task >> IN PROGRESS
    => https://app.clickup.com/t/another-task >> D&T >> Review needed
```

## Complete Example

```
Today's Update || 04-02-2026
[Panel Valid Bugs] [3] >>>
    DONE[1] >>>
    => https://app.clickup.com/t/86d1ukvez >> DONE >> 2hr >> Fixed validation issue
    MR RAISED[0] >>>
    IN PROGRESS[2] >>>
    => https://app.clickup.com/t/86d1uxq7u >> IN PROGRESS >> 1hr 30min
    => https://app.clickup.com/t/86d07682p >> IN PROGRESS >> 45min >> Working on API
    D&T[0] >>>
[Internal Valid Bug] [2] >>>
    => https://app.clickup.com/t/internal1 >> COMPLETED >> 2hr
    => https://app.clickup.com/t/internal2 >> D&T >> 1hr 15min >> Milan reviewing
[Testing] [1] >>>
    => https://app.clickup.com/t/test1 >> COMPLETED >> 41min
Next Plan || 05-02-2026
    => https://app.clickup.com/t/86d1v1n43 >> IN PROGRESS
    => https://app.clickup.com/t/86d1v2abc >> D&T >> Needs review
```

## Parser Features

### Real-Time Validation
- ✅ Success messages show parsed sections and tasks
- ⚠️ Warnings for non-critical issues (unparseable lines)
- ❌ Errors for critical issues (missing date, invalid format)

### Smart Detection
- Automatically detects subsections based on indentation
- Handles varying amounts of `>` characters (`>>>` or `>>>>`)
- Preserves section order from original report
- Ignores "Total:" and "Overall Total:" lines automatically

### Error Handling
- Shows line numbers for errors and warnings
- Click "Show" to expand warnings
- Option to proceed with warnings
- Cannot proceed with critical errors

## Tips

1. **Use the Example**: Click "Load Example" to see the correct format
2. **Check Warnings**: Review warnings to ensure all data was parsed correctly
3. **Backup First**: If you have existing data, it will be replaced
4. **Time Format**: Use `hr` and `min` keywords (e.g., `2hr 30min`)
5. **URLs**: Always include full ClickUp URLs
6. **Indentation**: Use spaces for subsection indentation (at least 2 spaces)

## Keyboard Shortcuts

- `Ctrl+I` / `Cmd+I`: Open import dialog
- `Ctrl+S` / `Cmd+S`: Generate and copy report

## Troubleshooting

### "Invalid date format" error
- Make sure date is in `DD-MM-YYYY` format
- Check for typos in the date

### "Could not parse task" warning
- Verify the task starts with `=>`
- Ensure the URL is valid and starts with `https://`
- Check that the status is one of the valid options

### "Task found outside of any section" warning
- Make sure tasks are under a section header
- Check indentation is correct

### "Subsection found without parent section" warning
- Ensure subsections are under a section header
- Verify the section header format is correct

## Best Practices

1. **Consistent Formatting**: Stick to the exact format shown in examples
2. **Section Names**: Use clear, descriptive section names
3. **Task Counts**: The `[count]` can be auto-calculated, but include it for clarity
4. **Comments**: Add meaningful comments for context
5. **Time Tracking**: Include time spent for accurate reporting
