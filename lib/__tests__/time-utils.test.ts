/**
 * Unit tests for time utility functions
 * Run these tests to validate time conversion logic
 */

import {
  convertTimeToDecimal,
  formatTimeFromDecimal,
  calculateSectionTotal,
  isValidTimeFormat,
  normalizeTimeString,
  parseTimeString,
} from "../time-utils";
import { Task } from "@/types/report";

// Test helper
function assertEqual<T>(actual: T, expected: T, testName: string) {
  if (actual === expected) {
    console.log(`✓ ${testName}`);
    return true;
  } else {
    console.error(`✗ ${testName}`);
    console.error(`  Expected: ${expected}`);
    console.error(`  Actual: ${actual}`);
    return false;
  }
}

// Test parseTimeString
console.log("\n=== parseTimeString Tests ===");
assertEqual(
  JSON.stringify(parseTimeString("1hr 40min")),
  JSON.stringify({ hours: 1, minutes: 40 }),
  "Parse '1hr 40min'"
);
assertEqual(
  JSON.stringify(parseTimeString("34min")),
  JSON.stringify({ hours: 0, minutes: 34 }),
  "Parse '34min'"
);
assertEqual(
  JSON.stringify(parseTimeString("2hr")),
  JSON.stringify({ hours: 2, minutes: 0 }),
  "Parse '2hr'"
);

// Test convertTimeToDecimal
console.log("\n=== convertTimeToDecimal Tests ===");
assertEqual(
  Number(convertTimeToDecimal("1hr 40min").toFixed(2)),
  1.67,
  "Convert '1hr 40min' to 1.67"
);
assertEqual(
  Number(convertTimeToDecimal("34min").toFixed(2)),
  0.57,
  "Convert '34min' to 0.57"
);
assertEqual(
  Number(convertTimeToDecimal("2hr").toFixed(2)),
  2.0,
  "Convert '2hr' to 2.0"
);
assertEqual(convertTimeToDecimal(""), 0, "Empty string returns 0");
assertEqual(convertTimeToDecimal("0min"), 0, "Zero time returns 0");

// Test formatTimeFromDecimal
console.log("\n=== formatTimeFromDecimal Tests ===");
assertEqual(
  formatTimeFromDecimal(1.67),
  "1hr 40min",
  "Format 1.67 to '1hr 40min'"
);
assertEqual(formatTimeFromDecimal(0.57), "34min", "Format 0.57 to '34min'");
assertEqual(formatTimeFromDecimal(2.0), "2hr", "Format 2.0 to '2hr'");
assertEqual(formatTimeFromDecimal(0), "0min", "Format 0 to '0min'");
assertEqual(
  formatTimeFromDecimal(0.08),
  "5min",
  "Format 0.08 to '5min' (rounding)"
);

// Test roundtrip conversion
console.log("\n=== Roundtrip Conversion Tests ===");
const testCases = ["1hr 40min", "34min", "2hr", "3hr 15min"];
testCases.forEach((timeStr) => {
  const decimal = convertTimeToDecimal(timeStr);
  const formatted = formatTimeFromDecimal(decimal);
  const originalDecimal = convertTimeToDecimal(timeStr);
  const roundtripDecimal = convertTimeToDecimal(formatted);
  assertEqual(
    Number(roundtripDecimal.toFixed(2)),
    Number(originalDecimal.toFixed(2)),
    `Roundtrip: ${timeStr} -> ${decimal} -> ${formatted}`
  );
});

// Test calculateSectionTotal
console.log("\n=== calculateSectionTotal Tests ===");
const mockTasks: Task[] = [
  {
    id: "1",
    link: "",
    status: "DONE",
    timeSpent: "1hr 40min",
  },
  {
    id: "2",
    link: "",
    status: "DONE",
    timeSpent: "34min",
  },
  {
    id: "3",
    link: "",
    status: "DONE",
    timeSpent: "2hr",
  },
];

const total = calculateSectionTotal(mockTasks);
// 1.67 + 0.57 + 2.0 = 4.24
assertEqual(
  Number(total.toFixed(2)),
  4.24,
  "Calculate total for array of tasks"
);

const totalFormatted = formatTimeFromDecimal(total);
assertEqual(
  totalFormatted,
  "4hr 14min",
  "Format total time as '4hr 14min'"
);

// Test isValidTimeFormat
console.log("\n=== isValidTimeFormat Tests ===");
assertEqual(isValidTimeFormat("1hr 40min"), true, "Valid: '1hr 40min'");
assertEqual(isValidTimeFormat("34min"), true, "Valid: '34min'");
assertEqual(isValidTimeFormat("2hr"), true, "Valid: '2hr'");
assertEqual(isValidTimeFormat("1hr40min"), true, "Valid: '1hr40min'");
assertEqual(isValidTimeFormat("invalid"), false, "Invalid: 'invalid'");
assertEqual(isValidTimeFormat(""), false, "Invalid: empty string");
assertEqual(isValidTimeFormat("123"), false, "Invalid: '123'");

// Test normalizeTimeString
console.log("\n=== normalizeTimeString Tests ===");
assertEqual(
  normalizeTimeString("1hr40min"),
  "1hr 40min",
  "Normalize '1hr40min'"
);
assertEqual(normalizeTimeString("34min"), "34min", "Normalize '34min'");
assertEqual(normalizeTimeString("2hr"), "2hr", "Normalize '2hr'");
assertEqual(
  normalizeTimeString("1hr 40min"),
  "1hr 40min",
  "Already normalized"
);

// Test edge cases
console.log("\n=== Edge Cases ===");
assertEqual(convertTimeToDecimal("0min"), 0, "Zero minutes");
assertEqual(formatTimeFromDecimal(0), "0min", "Zero decimal");
assertEqual(
  normalizeTimeString(""),
  "0min",
  "Empty string normalizes to '0min'"
);

// Test with various formats
console.log("\n=== Format Variations ===");
assertEqual(
  Number(convertTimeToDecimal("1hr 40min").toFixed(2)),
  Number(convertTimeToDecimal("1hr40min").toFixed(2)),
  "With and without space are equal"
);
assertEqual(
  Number(convertTimeToDecimal("2 hr").toFixed(2)),
  2.0,
  "Extra space in '2 hr'"
);

console.log("\n=== All Tests Complete ===");
