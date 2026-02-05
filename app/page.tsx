"use client";

import { useState, useRef, useCallback } from "react";
import { Report, Task, Section, SubSection } from "@/types/report";
import {
  createEmptyReport,
  createEmptyTask,
  calculateReportTotalTime,
  countTasksByStatus,
  initializeDefaultSections,
} from "@/lib/report-utils";
import { formatTimeFromDecimal } from "@/lib/time-utils";
import { generateFormattedReport, copyToClipboard } from "@/lib/report-formatter";
import { DateSelector } from "@/components/DateSelector";
import { SectionCard } from "@/components/SectionCard";
import { AddSectionButton } from "@/components/AddSectionButton";
import { GenerateReportButton } from "@/components/GenerateReportButton";
import { ReportPreview } from "@/components/ReportPreview";
import { ClearAllButton } from "@/components/ClearAllButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGlobalKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { BarChart3, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [report, setReport] = useState<Report>(() =>
    createEmptyReport(new Date().toISOString().split("T")[0])
  );

  // Update today's date
  const handleTodayDateChange = (date: string) => {
    setReport((prev) => ({ ...prev, date }));
  };

  // Update next plan date
  const handleNextPlanDateChange = (date: string) => {
    setReport((prev) => ({ ...prev, nextPlanDate: date }));
  };

  // Add task to section or subsection
  const handleAddTask = (sectionId: string, subSectionId?: string) => {
    const newTask = createEmptyTask();

    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id !== sectionId) return section;

        // Add to subsection
        if (subSectionId && section.subSections) {
          return {
            ...section,
            subSections: section.subSections.map((subSection) =>
              subSection.id === subSectionId
                ? { ...subSection, tasks: [...subSection.tasks, newTask] }
                : subSection
            ),
          };
        }

        // Add to section directly
        if (section.tasks) {
          return {
            ...section,
            tasks: [...section.tasks, newTask],
          };
        }

        return section;
      }),
    }));
  };

  // Update task
  const handleUpdateTask = (
    sectionId: string,
    taskId: string,
    updates: Partial<Task>,
    subSectionId?: string
  ) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id !== sectionId) return section;

        // Update in subsection
        if (subSectionId && section.subSections) {
          return {
            ...section,
            subSections: section.subSections.map((subSection) =>
              subSection.id === subSectionId
                ? {
                    ...subSection,
                    tasks: subSection.tasks.map((task) =>
                      task.id === taskId ? { ...task, ...updates } : task
                    ),
                  }
                : subSection
            ),
          };
        }

        // Update in section directly
        if (section.tasks) {
          return {
            ...section,
            tasks: section.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task
            ),
          };
        }

        return section;
      }),
    }));
  };

  // Delete task
  const handleDeleteTask = (
    sectionId: string,
    taskId: string,
    subSectionId?: string
  ) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id !== sectionId) return section;

        // Delete from subsection
        if (subSectionId && section.subSections) {
          return {
            ...section,
            subSections: section.subSections.map((subSection) =>
              subSection.id === subSectionId
                ? {
                    ...subSection,
                    tasks: subSection.tasks.filter((task) => task.id !== taskId),
                  }
                : subSection
            ),
          };
        }

        // Delete from section directly
        if (section.tasks) {
          return {
            ...section,
            tasks: section.tasks.filter((task) => task.id !== taskId),
          };
        }

        return section;
      }),
    }));
  };

  // Add custom section
  const handleAddSection = (name: string, withSubSections: boolean) => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      name,
      isFixed: false,
      ...(withSubSections
        ? {
            subSections: [
              { id: crypto.randomUUID(), name: "DONE", tasks: [], isFixed: false },
              {
                id: crypto.randomUUID(),
                name: "MR RAISED",
                tasks: [],
                isFixed: false,
              },
              {
                id: crypto.randomUUID(),
                name: "IN PROGRESS",
                tasks: [],
                isFixed: false,
              },
              { id: crypto.randomUUID(), name: "D&T", tasks: [], isFixed: false },
            ],
          }
        : { tasks: [] }),
    };

    setReport((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  // Delete section
  const handleDeleteSection = (sectionId: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }));
  };

  // Clear all tasks
  const handleClearAll = () => {
    setReport((prev) => ({
      ...prev,
      sections: initializeDefaultSections(),
      nextPlanTasks: [],
    }));
  };

  // Generate and copy report (for keyboard shortcut)
  const handleGenerateReport = useCallback(async () => {
    const formatted = generateFormattedReport(report);
    await copyToClipboard(formatted);
  }, [report]);

  // Setup keyboard shortcuts
  useGlobalKeyboardShortcuts(handleGenerateReport);

  const totalTime = calculateReportTotalTime(report);
  const statusCounts = countTasksByStatus(report);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                Daily Report Generator
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base hidden sm:block">
                Track your daily tasks and generate formatted reports
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2"
                onClick={handleGenerateReport}
                aria-label="Generate report (Ctrl+S)"
              >
                <Keyboard className="h-4 w-4" />
                <span className="text-xs">Ctrl+S</span>
              </Button>
              <Button
                size="sm"
                className="sm:hidden"
                onClick={handleGenerateReport}
                aria-label="Generate report"
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Date Selectors */}
            <Card>
              <CardHeader>
                <CardTitle>Report Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <DateSelector
                  todayDate={report.date}
                  nextPlanDate={report.nextPlanDate}
                  onTodayDateChange={handleTodayDateChange}
                  onNextPlanDateChange={handleNextPlanDateChange}
                />
              </CardContent>
            </Card>

            {/* Sections */}
            <div className="space-y-4">
              {report.sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onDeleteSection={
                    !section.isFixed ? handleDeleteSection : undefined
                  }
                />
              ))}
            </div>

            {/* Add Section Button */}
            <AddSectionButton onAddSection={handleAddSection} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Total Time
                  </p>
                  <p className="text-2xl font-bold">
                    {formatTimeFromDecimal(totalTime)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalTime.toFixed(2)} hours
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Task Breakdown</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Done</span>
                      <span className="font-medium">{statusCounts.DONE}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MR Raised</span>
                      <span className="font-medium">
                        {statusCounts["MR RAISED"]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">In Progress</span>
                      <span className="font-medium">
                        {statusCounts["IN PROGRESS"]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">D&T</span>
                      <span className="font-medium">{statusCounts["D&T"]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-medium">
                        {statusCounts.COMPLETED}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dev Replied</span>
                      <span className="font-medium">
                        {statusCounts["DEV REPLIED"]}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <GenerateReportButton report={report} />
                <Separator className="my-2" />
                <ClearAllButton onClearAll={handleClearAll} />
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts */}
            <Card className="hidden sm:block">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Shortcuts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Generate Report</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                    Ctrl+S
                  </kbd>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  More shortcuts coming soon!
                </p>
              </CardContent>
            </Card>

            {/* Report Preview */}
            <ReportPreview report={report} />
          </div>
        </div>
      </main>
    </div>
  );
}
