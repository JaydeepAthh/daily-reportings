import { parseReport, validateParsedReport } from "../reportParser";

describe("Report Parser", () => {
  test("parses a complete report with subsections", () => {
    const reportText = `Today's Update || 04-02-2026
[Panel Valid Bugs] [1] >>>
    DONE[0] >>>
    MR RAISED[0] >>>
    IN PROGRESS[1] >>>
    => https://app.clickup.com/t/86d1ukvez >> IN PROGRESS >> 1hr 40min >> Working on it
    D&T[0] >>>
[Internal Valid Bug] [2] >>>
    => https://app.clickup.com/t/86d1uxq7u >> COMPLETED >> 2hr
    => https://app.clickup.com/t/86d07682p >> D&T >> 41min
Next Plan || 05-02-2026
    => https://app.clickup.com/t/86d1v1n43 >> IN PROGRESS`;

    const result = parseReport(reportText);

    expect(result.date).toBe("2026-02-04");
    expect(result.nextPlanDate).toBe("2026-02-05");
    expect(result.sections.length).toBe(2);
    expect(result.stats.tasksCount).toBe(3);
    expect(result.nextPlanTasks.length).toBe(1);
    expect(result.errors.length).toBe(0);
  });

  test("parses sections without subsections", () => {
    const reportText = `Today's Update || 04-02-2026
[Testing] [2] >>>
    => https://app.clickup.com/t/test1 >> COMPLETED >> 1hr
    => https://app.clickup.com/t/test2 >> IN PROGRESS >> 30min >> Testing feature X`;

    const result = parseReport(reportText);

    expect(result.sections.length).toBe(1);
    expect(result.sections[0].name).toBe("Testing");
    expect(result.sections[0].tasks?.length).toBe(2);
    expect(result.sections[0].subSections).toBeUndefined();
  });

  test("handles tasks without time", () => {
    const reportText = `Today's Update || 04-02-2026
[Testing] [1] >>>
    => https://app.clickup.com/t/test1 >> COMPLETED >> Working on this`;

    const result = parseReport(reportText);

    expect(result.sections[0].tasks?.[0].timeSpent).toBe("");
    expect(result.sections[0].tasks?.[0].comment).toBe("Working on this");
  });

  test("handles tasks with time but no comment", () => {
    const reportText = `Today's Update || 04-02-2026
[Testing] [1] >>>
    => https://app.clickup.com/t/test1 >> COMPLETED >> 2hr 30min`;

    const result = parseReport(reportText);

    expect(result.sections[0].tasks?.[0].timeSpent).toBe("2hr 30min");
    expect(result.sections[0].tasks?.[0].comment).toBe("");
  });

  test("handles tasks with only link and status", () => {
    const reportText = `Today's Update || 04-02-2026
[Testing] [1] >>>
    => https://app.clickup.com/t/test1 >> COMPLETED`;

    const result = parseReport(reportText);

    expect(result.sections[0].tasks?.[0].link).toBe("https://app.clickup.com/t/test1");
    expect(result.sections[0].tasks?.[0].status).toBe("COMPLETED");
    expect(result.sections[0].tasks?.[0].timeSpent).toBe("");
    expect(result.sections[0].tasks?.[0].comment).toBe("");
  });

  test("handles >> in comments correctly", () => {
    const reportText = `Today's Update || 04-02-2026
[Testing] [1] >>>
    => https://app.clickup.com/t/test1 >> COMPLETED >> 1hr >> Comment with >> arrows`;

    const result = parseReport(reportText);

    expect(result.sections[0].tasks?.[0].comment).toBe("Comment with >> arrows");
  });

  test("reports errors for invalid date format", () => {
    const reportText = `Today's Update || 2026-02-04
[Testing] [1] >>>
    => https://app.clickup.com/t/test1 >> COMPLETED`;

    const result = parseReport(reportText);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].reason).toContain("date format");
  });

  test("reports warnings for invalid task lines", () => {
    const reportText = `Today's Update || 04-02-2026
[Testing] [1] >>>
    => not-a-url >> COMPLETED
    => https://app.clickup.com/t/test1 >> INVALID_STATUS`;

    const result = parseReport(reportText);

    expect(result.warnings.length).toBeGreaterThan(0);
  });

  test("handles empty subsections", () => {
    const reportText = `Today's Update || 04-02-2026
[Panel Valid Bugs] [0] >>>
    DONE[0] >>>
    MR RAISED[0] >>>
    IN PROGRESS[0] >>>
    D&T[0] >>>`;

    const result = parseReport(reportText);

    expect(result.sections.length).toBe(1);
    expect(result.sections[0].subSections?.length).toBe(4);
    expect(result.stats.tasksCount).toBe(0);
  });

  test("validates parsed report correctly", () => {
    const validText = `Today's Update || 04-02-2026
[Testing] [1] >>>
    => https://app.clickup.com/t/test1 >> COMPLETED`;

    const result = parseReport(validText);
    const validation = validateParsedReport(result);

    expect(validation.isValid).toBe(true);
  });

  test("invalidates report with critical errors", () => {
    const invalidText = `[Testing] [1] >>>
    => https://app.clickup.com/t/test1 >> COMPLETED`;

    const result = parseReport(invalidText);
    const validation = validateParsedReport(result);

    expect(validation.isValid).toBe(false);
  });

  test("handles multiple sections with mixed formats", () => {
    const reportText = `Today's Update || 04-02-2026
[Panel Valid Bugs] [2] >>>
    DONE[1] >>>
    => https://app.clickup.com/t/1 >> DONE >> 1hr
    IN PROGRESS[1] >>>
    => https://app.clickup.com/t/2 >> IN PROGRESS >> 30min
[Testing] [1] >>>
    => https://app.clickup.com/t/3 >> COMPLETED >> 45min
[Internal Valid Bug] [1] >>>
    => https://app.clickup.com/t/4 >> D&T >> 2hr >> Milan working`;

    const result = parseReport(reportText);

    expect(result.sections.length).toBe(3);
    expect(result.stats.tasksCount).toBe(4);
    expect(result.sections[0].subSections?.length).toBe(2);
    expect(result.sections[1].tasks?.length).toBe(1);
  });
});
