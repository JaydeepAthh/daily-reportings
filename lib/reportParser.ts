import { Report, Section, SubSection, Task, TaskStatus } from "@/types/report";
import { generateId } from "./report-utils";

export interface ParseError {
  line: number;
  text: string;
  reason: string;
  type?: "error" | "warning" | "info";
}

export interface ParseOptions {
  dateFormat?: DateFormat;
  preserveSectionOrder?: boolean;
  autoFixFormatting?: boolean;
  skipEmptySections?: boolean;
}

export interface ParseResult {
  date: string;
  sections: Section[];
  nextPlanDate: string;
  nextPlanTasks: Task[];
  errors: ParseError[];
  warnings: ParseError[];
  stats: {
    sectionsCount: number;
    tasksCount: number;
    subsectionsCount: number;
    customStatusCount: number;
    platformsDetected: string[];
  };
  lineHighlights?: LineHighlight[];
}

export interface LineHighlight {
  line: number;
  type: "date" | "section" | "subsection" | "task" | "error" | "comment";
  text: string;
}

export type DateFormat = "DD-MM-YYYY" | "MM-DD-YYYY" | "YYYY-MM-DD";

/**
 * Parse date with flexible format support
 */
function parseDate(dateStr: string, format: DateFormat = "DD-MM-YYYY"): string {
  // Try DD-MM-YYYY
  let match = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (match) {
    const [, first, second, year] = match;

    if (format === "DD-MM-YYYY") {
      return `${year}-${second}-${first}`;
    } else if (format === "MM-DD-YYYY") {
      return `${year}-${first}-${second}`;
    }
  }

  // Try YYYY-MM-DD
  match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return match[0]; // Already in ISO format
  }

  return "";
}

/**
 * Parse time string to decimal hours
 */
function parseTimeToDecimal(timeStr: string): number {
  const cleaned = timeStr.trim().toLowerCase();

  let hours = 0;
  let minutes = 0;

  // Match various formats: "1hr 40min", "1h 40m", "100min", "2hr", "1.5hr"

  // Format: "XhrYmin" or "XhYm"
  const hrMinMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*h(?:r|rs?)?\s*(\d+)\s*m(?:in|ins?)?/);
  if (hrMinMatch) {
    hours = parseFloat(hrMinMatch[1]);
    minutes = parseInt(hrMinMatch[2], 10);
    return hours + minutes / 60;
  }

  // Format: "Xhr" or "Xh"
  const hrMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*h(?:r|rs?)?$/);
  if (hrMatch) {
    return parseFloat(hrMatch[1]);
  }

  // Format: "Xmin" or "Xm"
  const minMatch = cleaned.match(/(\d+)\s*m(?:in|ins?)?$/);
  if (minMatch) {
    return parseInt(minMatch[1], 10) / 60;
  }

  return 0;
}

/**
 * Format decimal hours back to "Xhr Ymin" format
 */
function formatDecimalToTime(decimal: number): string {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}hr ${minutes}min`;
  } else if (hours > 0) {
    return `${hours}hr`;
  } else if (minutes > 0) {
    return `${minutes}min`;
  }
  return "";
}

/**
 * Validate and normalize task status with fuzzy matching
 */
function parseStatus(statusStr: string): { status: TaskStatus | null; isCustom: boolean } {
  const normalized = statusStr.trim().toUpperCase().replace(/[_-]/g, " ");

  const statusMap: Record<string, TaskStatus> = {
    "DONE": "DONE",
    "COMPLETE": "DONE",
    "FINISHED": "DONE",

    "MR RAISED": "MR RAISED",
    "MR": "MR RAISED",
    "MERGE REQUEST": "MR RAISED",
    "PR RAISED": "MR RAISED",
    "PULL REQUEST": "MR RAISED",

    "IN PROGRESS": "IN PROGRESS",
    "WIP": "IN PROGRESS",
    "WORKING": "IN PROGRESS",
    "ONGOING": "IN PROGRESS",

    "D&T": "D&T",
    "DT": "D&T",
    "D & T": "D&T",
    "D AND T": "D&T",
    "DISCUSSION": "D&T",

    "COMPLETED": "COMPLETED",

    "DEV REPLIED": "DEV REPLIED",
    "DEV REPLY": "DEV REPLIED",
    "DEVELOPER REPLIED": "DEV REPLIED",
    "REPLIED": "DEV REPLIED",
  };

  const mappedStatus = statusMap[normalized];

  if (mappedStatus) {
    return { status: mappedStatus, isCustom: false };
  }

  // If no match, return the original as a custom status
  // We'll store it but mark it as custom
  return { status: null, isCustom: true };
}

/**
 * Validate URL format
 */
function isValidUrl(urlStr: string): { valid: boolean; platform?: string } {
  try {
    const url = new URL(urlStr);

    // Detect platform
    if (url.hostname.includes("clickup.com")) {
      return { valid: true, platform: "ClickUp" };
    } else if (url.hostname.includes("atlassian.net") || url.hostname.includes("jira")) {
      return { valid: true, platform: "Jira" };
    } else if (url.hostname.includes("github.com")) {
      return { valid: true, platform: "GitHub" };
    } else if (url.hostname.includes("gitlab.com")) {
      return { valid: true, platform: "GitLab" };
    } else if (url.protocol === "http:" || url.protocol === "https:") {
      return { valid: true, platform: "Web" };
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}

export interface ParsedTaskInfo {
  task: Task | null;
  warnings: string[];
  urlPlatform?: string;
  isCustomStatus?: boolean;
  originalStatus?: string;
}

/**
 * Parse a task line with enhanced validation and intelligence
 * Format: "=> {link} >> {status} >> {time} >> {comment}"
 */
function parseTaskLine(line: string, options?: ParseOptions): ParsedTaskInfo {
  const warnings: string[] = [];
  const trimmed = line.trim();

  // Must start with =>
  if (!trimmed.startsWith("=>")) {
    return { task: null, warnings: ["Line doesn't start with '=>'"] };
  }

  // Remove => and split by >>
  const content = trimmed.substring(2).trim();
  const parts = content.split(">>").map(p => p.trim());

  if (parts.length < 2) {
    return { task: null, warnings: ["Missing status field"] };
  }

  const link = parts[0];
  const statusStr = parts[1];

  // Validate URL
  const urlValidation = isValidUrl(link);
  if (!urlValidation.valid) {
    warnings.push("Invalid or non-standard URL format");
  }

  // Parse status with fuzzy matching
  const statusResult = parseStatus(statusStr);
  let finalStatus: TaskStatus;

  if (statusResult.status) {
    finalStatus = statusResult.status;
    if (statusResult.isCustom) {
      warnings.push(`Custom status detected: "${statusStr}"`);
    }
  } else {
    // Use IN PROGRESS as fallback
    finalStatus = "IN PROGRESS";
    warnings.push(`Unknown status "${statusStr}", defaulting to IN PROGRESS`);
  }

  // Parse time (optional) and comment (optional)
  let timeSpent = "";
  let comment = "";

  if (parts.length >= 3) {
    const thirdPart = parts[2];

    // Check if third part looks like time
    const timeDecimal = parseTimeToDecimal(thirdPart);

    if (timeDecimal > 0) {
      // It's a time value - normalize it
      timeSpent = options?.autoFixFormatting
        ? formatDecimalToTime(timeDecimal)
        : thirdPart;

      // If there's a 4th part, it's the comment
      if (parts.length >= 4) {
        comment = parts.slice(3).join(" >> "); // Rejoin in case comment has >>
      }
    } else {
      // Third part is comment (no time provided)
      comment = parts.slice(2).join(" >> ");
    }
  }

  // Trim comment
  comment = comment.trim();

  return {
    task: {
      id: generateId(),
      link,
      status: finalStatus,
      timeSpent,
      comment,
    },
    warnings,
    urlPlatform: urlValidation.platform,
    isCustomStatus: statusResult.isCustom,
    originalStatus: statusResult.isCustom ? statusStr : undefined,
  };
}

/**
 * Detect if a line is a section header: "[Section Name] [count] >>>"
 */
function parseSectionHeader(line: string): { name: string; count: number } | null {
  const trimmed = line.trim();

  // Match: [Section Name] [count] >>> or [Section Name] [count] >>>>
  const match = trimmed.match(/^\[(.+?)\]\s*\[(\d+)\]\s*>>>+/);

  if (!match) return null;

  return {
    name: match[1].trim(),
    count: parseInt(match[2], 10),
  };
}

/**
 * Map section names to known fixed sections (case-insensitive)
 */
function mapSectionName(name: string): { mappedName: string; isFixed: boolean; suggestion?: string } {
  const normalized = name.trim().toLowerCase();

  const knownSections: Record<string, string> = {
    "panel valid bugs": "Panel Valid Bugs",
    "panel valid bug": "Panel Valid Bugs",
    "panel bugs": "Panel Valid Bugs",

    "panel invalid/dev. reply bugs": "Panel Invalid/Dev. Reply Bugs",
    "panel invalid bugs": "Panel Invalid/Dev. Reply Bugs",
    "panel dev reply": "Panel Invalid/Dev. Reply Bugs",

    "live valid bug": "Live Valid Bug",
    "live valid bugs": "Live Valid Bug",

    "live invalid bug": "Live Invalid Bug",
    "live invalid bugs": "Live Invalid Bug",

    "internal valid bug": "Internal Valid Bug",
    "internal valid bugs": "Internal Valid Bug",
    "internal bug": "Internal Valid Bug",
    "internal bugs": "Internal Valid Bug",

    "internal invalid bug": "Internal Invalid Bug",
    "internal invalid bugs": "Internal Invalid Bug",

    "testing": "Testing",
    "tests": "Testing",
    "qa": "Testing",
  };

  const mappedName = knownSections[normalized];

  if (mappedName) {
    return {
      mappedName,
      isFixed: true,
      suggestion: mappedName !== name ? `Normalized "${name}" to "${mappedName}"` : undefined,
    };
  }

  // Unknown section - create as dynamic
  return {
    mappedName: name,
    isFixed: false,
  };
}

/**
 * Detect if a line is a subsection header (indented): "    [Subsection][count] >>>"
 */
function parseSubsectionHeader(line: string): { name: string; count: number } | null {
  const trimmed = line.trim();

  // Must be indented (at least 2 spaces)
  if (!line.startsWith("  ")) return null;

  // Match: [Subsection Name][count] >>> or SUBSECTION[count] >>>
  const match = trimmed.match(/^(\w[\w\s&]+?)\[(\d+)\]\s*>>>+/);

  if (!match) return null;

  return {
    name: match[1].trim(),
    count: parseInt(match[2], 10),
  };
}

/**
 * Main parser function with options
 */
export function parseReport(reportText: string, options: ParseOptions = {}): ParseResult {
  const lines = reportText.split("\n");
  const errors: ParseError[] = [];
  const warnings: ParseError[] = [];
  const sections: Section[] = [];
  const lineHighlights: LineHighlight[] = [];

  let date = "";
  let nextPlanDate = "";
  const nextPlanTasks: Task[] = [];

  let currentSection: Section | null = null;
  let currentSubsection: SubSection | null = null;
  let inNextPlan = false;

  let sectionsCount = 0;
  let tasksCount = 0;
  let subsectionsCount = 0;
  let customStatusCount = 0;
  const platformsDetected = new Set<string>();

  const {
    dateFormat = "DD-MM-YYYY",
    autoFixFormatting = true,
    skipEmptySections = false,
  } = options;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip empty lines
    if (!line.trim()) continue;

    // Parse "Today's Update || DD-MM-YYYY"
    if (line.includes("Today's Update ||") || line.includes("Today's update ||")) {
      lineHighlights.push({ line: lineNum, type: "date", text: line });

      const dateMatch = line.match(/\|\|\s*(.+)/);
      if (dateMatch) {
        date = parseDate(dateMatch[1].trim(), dateFormat);
        if (!date) {
          errors.push({
            line: lineNum,
            text: line,
            reason: `Invalid date format. Expected: ${dateFormat}`,
            type: "error",
          });
        }
      }
      continue;
    }

    // Parse "Next Plan || DD-MM-YYYY"
    if (line.includes("Next Plan ||") || line.includes("Next plan ||")) {
      inNextPlan = true;
      lineHighlights.push({ line: lineNum, type: "date", text: line });

      const dateMatch = line.match(/\|\|\s*(.+)/);
      if (dateMatch) {
        nextPlanDate = parseDate(dateMatch[1].trim(), dateFormat);
        if (!nextPlanDate) {
          warnings.push({
            line: lineNum,
            text: line,
            reason: "Invalid next plan date format",
            type: "warning",
          });
        }
      }
      continue;
    }

    // Parse task line
    if (line.trim().startsWith("=>")) {
      lineHighlights.push({ line: lineNum, type: "task", text: line });

      const taskInfo = parseTaskLine(line, options);

      if (!taskInfo.task) {
        warnings.push({
          line: lineNum,
          text: line,
          reason: taskInfo.warnings.join(", ") || "Could not parse task",
          type: "warning",
        });
        continue;
      }

      // Add task warnings
      if (taskInfo.warnings.length > 0) {
        warnings.push({
          line: lineNum,
          text: line,
          reason: taskInfo.warnings.join(", "),
          type: "info",
        });
      }

      // Track platform and custom status
      if (taskInfo.urlPlatform) {
        platformsDetected.add(taskInfo.urlPlatform);
      }
      if (taskInfo.isCustomStatus) {
        customStatusCount++;
      }

      if (inNextPlan) {
        nextPlanTasks.push(taskInfo.task);
      } else if (currentSubsection) {
        currentSubsection.tasks.push(taskInfo.task);
      } else if (currentSection?.tasks) {
        currentSection.tasks.push(taskInfo.task);
      } else {
        warnings.push({
          line: lineNum,
          text: line,
          reason: "Task found outside of any section",
          type: "warning",
        });
        continue;
      }

      tasksCount++;
      continue;
    }

    // Try parsing as subsection header
    const subsection = parseSubsectionHeader(line);
    if (subsection) {
      lineHighlights.push({ line: lineNum, type: "subsection", text: line });

      if (!currentSection) {
        warnings.push({
          line: lineNum,
          text: line,
          reason: "Subsection found without parent section",
          type: "warning",
        });
        continue;
      }

      // Skip empty subsections if option is set
      if (skipEmptySections && subsection.count === 0) {
        continue;
      }

      // Create subsections array if it doesn't exist
      if (!currentSection.subSections) {
        currentSection.subSections = [];
        // Remove tasks array if we're now using subsections
        delete currentSection.tasks;
      }

      currentSubsection = {
        id: generateId(),
        name: subsection.name,
        tasks: [],
        isFixed: false,
      };

      currentSection.subSections.push(currentSubsection);
      subsectionsCount++;
      continue;
    }

    // Try parsing as section header
    const section = parseSectionHeader(line);
    if (section) {
      lineHighlights.push({ line: lineNum, type: "section", text: line });

      // Save previous section (skip if empty and option is set)
      if (currentSection) {
        const hasContent = currentSection.subSections
          ? currentSection.subSections.some(s => s.tasks.length > 0)
          : (currentSection.tasks?.length || 0) > 0;

        if (!skipEmptySections || hasContent) {
          sections.push(currentSection);
        }
      }

      // Map section name
      const sectionMapping = mapSectionName(section.name);

      if (sectionMapping.suggestion) {
        warnings.push({
          line: lineNum,
          text: line,
          reason: sectionMapping.suggestion,
          type: "info",
        });
      }

      // Start new section
      currentSection = {
        id: generateId(),
        name: sectionMapping.mappedName,
        isFixed: sectionMapping.isFixed,
        tasks: [], // Default to tasks array, will be removed if subsections are added
      };

      currentSubsection = null;
      sectionsCount++;
      continue;
    }

    // If line doesn't match any pattern and not empty, it's unparseable
    if (line.trim() && !line.includes("Total:") && !line.includes("Overall Total:")) {
      lineHighlights.push({ line: lineNum, type: "comment", text: line });
      warnings.push({
        line: lineNum,
        text: line,
        reason: "Unrecognized line format",
        type: "info",
      });
    }
  }

  // Add last section (skip if empty and option is set)
  if (currentSection) {
    const hasContent = currentSection.subSections
      ? currentSection.subSections.some(s => s.tasks.length > 0)
      : (currentSection.tasks?.length || 0) > 0;

    if (!skipEmptySections || hasContent) {
      sections.push(currentSection);
    }
  }

  // Validation errors
  if (!date) {
    errors.push({
      line: 0,
      text: "",
      reason: "Missing 'Today's Update' date",
      type: "error",
    });
  }

  return {
    date: date || new Date().toISOString().split("T")[0],
    sections,
    nextPlanDate,
    nextPlanTasks,
    errors,
    warnings,
    lineHighlights,
    stats: {
      sectionsCount,
      tasksCount,
      subsectionsCount,
      customStatusCount,
      platformsDetected: Array.from(platformsDetected),
    },
  };
}

/**
 * Validate parsed report
 */
export function validateParsedReport(result: ParseResult): {
  isValid: boolean;
  message: string;
} {
  if (result.errors.length > 0) {
    return {
      isValid: false,
      message: `Found ${result.errors.length} critical error(s) that prevent parsing`,
    };
  }

  if (result.stats.tasksCount === 0 && result.stats.sectionsCount === 0) {
    return {
      isValid: false,
      message: "No sections or tasks found in the report",
    };
  }

  return {
    isValid: true,
    message: `Successfully parsed: ${result.stats.sectionsCount} sections, ${result.stats.tasksCount} tasks`,
  };
}

/**
 * Get example format text
 */
export function getExampleFormat(): string {
  return `Today's Update || 04-02-2026
[Panel Valid Bugs] [1] >>>
    DONE[0] >>>
    MR RAISED[0] >>>
    IN PROGRESS[0] >>>
    D&T[0] >>>
[Internal Valid Bug] [4] >>>
    => https://app.clickup.com/t/86d1ukvez >> D&T >> 1hr 40min >> Milan works on it
    => https://app.clickup.com/t/86d1uxq7u >> COMPLETED >> 2hr
[Testing] [1] >>>
    => https://app.clickup.com/t/86d07682p >> IN PROGRESS >> 41min
Next Plan || 05-02-2026
    => https://app.clickup.com/t/86d1v1n43 >> IN PROGRESS`;
}

/**
 * Get sample report with various formats to test parser
 */
export function getSampleReport(): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return `Today's Update || ${formatDate(today)}
[Panel Valid Bugs] [3] >>>
    DONE[1] >>>
    => https://app.clickup.com/t/abc123 >> Done >> 2hr 30min >> Fixed login validation
    MR RAISED[0] >>>
    IN PROGRESS[2] >>>
    => https://app.clickup.com/t/def456 >> WIP >> 1h 45m >> Working on API integration
    => https://github.com/company/repo/issues/789 >> IN PROGRESS >> 90min
    D&T[0] >>>
[Internal Valid Bug] [2] >>>
    => https://company.atlassian.net/browse/PROJ-123 >> COMPLETED >> 3hr >> Database optimization
    => https://app.clickup.com/t/xyz999 >> D&T >> 45min >> Discussing with Milan
[Testing] [2] >>>
    => https://app.clickup.com/t/test001 >> Completed >> 1hr 15min >> Tested new feature
    => https://app.clickup.com/t/test002 >> IN PROGRESS >> 30m >> QA in progress
Next Plan || ${formatDate(tomorrow)}
    => https://app.clickup.com/t/plan001 >> IN PROGRESS >> Continue API work
    => https://app.clickup.com/t/plan002 >> D&T >> Code review needed`;
}
