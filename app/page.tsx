"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Report, Task, Section, SubSection } from "@/types/report";
import {
  createEmptyReport,
  createEmptyTask,
  calculateReportTotalTime,
  countTasksByStatus,
  initializeDefaultSections,
} from "@/lib/report-utils";
import { formatTimeFromDecimal } from "@/lib/time-utils";
import {
  generateFormattedReport,
  generateImportableReport,
  copyToClipboard,
  validateReport,
  ValidationWarning,
} from "@/lib/report-formatter";
import { DateSelector } from "@/components/DateSelector";
import { SectionCard } from "@/components/SectionCard";
import { AddSectionButton } from "@/components/AddSectionButton";
import { GenerateReportButton } from "@/components/GenerateReportButton";
import { ReportPreview } from "@/components/ReportPreview";
import { ClearAllButton } from "@/components/ClearAllButton";
import { StorageToggle } from "@/components/StorageToggle";
import { TemplateManager } from "@/components/TemplateManager";
import { ExportOptions } from "@/components/ExportOptions";
import { TimeTracker } from "@/components/TimeTracker";
import { ImportReportDialog, ImportReportDialogRef } from "@/components/ImportReportDialog";
import { ValidationWarnings } from "@/components/ValidationWarnings";
import { CompareView } from "@/components/CompareView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast, ToastContainer, Toast } from "@/components/ui/toast";
import { useImportHistory } from "@/hooks/useImportHistory";
import { useGlobalKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  useLocalStorage,
  usePersistenceToggle,
  useHasStoredData,
} from "@/hooks/useLocalStorage";
import { BarChart3, Keyboard, RotateCcw, GitCompare, AlertTriangle, Calendar, Calendar1 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Persistence toggle
  const [persistenceEnabled, setPersistenceEnabled] = usePersistenceToggle();

  // Report state with optional localStorage
  const [report, setReport] = useLocalStorage<Report>({
    key: "daily-report",
    defaultValue: createEmptyReport(new Date().toISOString().split("T")[0]),
    enabled: persistenceEnabled,
  });

  // Check if we have stored data
  const hasStoredData = useHasStoredData("daily-report");

  // Warn before leaving if data exists and persistence is disabled
  useEffect(() => {
    if (!persistenceEnabled && hasStoredData) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!persistenceEnabled) {
        const hasTasks = report.sections.some((section) => {
          if (section.subSections) {
            return section.subSections.some((sub) => sub.tasks.length > 0);
          }
          return section.tasks && section.tasks.length > 0;
        });

        if (hasTasks) {
          e.preventDefault();
          e.returnValue = "";
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [persistenceEnabled, report, hasStoredData]);

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
                : subSection,
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
    subSectionId?: string,
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
                    task.id === taskId ? { ...task, ...updates } : task,
                  ),
                }
                : subSection,
            ),
          };
        }

        // Update in section directly
        if (section.tasks) {
          return {
            ...section,
            tasks: section.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task,
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
    subSectionId?: string,
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
                  tasks: subSection.tasks.filter(
                    (task) => task.id !== taskId,
                  ),
                }
                : subSection,
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
            {
              id: crypto.randomUUID(),
              name: "DONE",
              tasks: [],
              isFixed: false,
            },
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
            {
              id: crypto.randomUUID(),
              name: "D&T",
              tasks: [],
              isFixed: false,
            },
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

  // Load template
  const handleLoadTemplate = (sections: Section[]) => {
    setReport((prev) => ({
      ...prev,
      sections: sections.map((section) => ({
        ...section,
        id: crypto.randomUUID(),
        subSections: section.subSections?.map((sub) => ({
          ...sub,
          id: crypto.randomUUID(),
          tasks: [],
        })),
        tasks: section.tasks ? [] : undefined,
      })),
    }));
  };

  // Import report from parsed text
  const handleImportReport = (
    date: string,
    sections: Section[],
    nextPlanDate: string,
    nextPlanTasks: Task[],
    originalText?: string
  ) => {
    const newReport = {
      date,
      sections,
      nextPlanDate,
      nextPlanTasks,
    };

    setReport(newReport);

    // Save to import history
    if (originalText) {
      saveImport(newReport, originalText);
    }

    // Validate the imported report
    const validation = validateReport(newReport);
    if (!validation.isValid) {
      setValidationWarnings(validation.warnings);
      setShowValidationWarnings(true);
    } else {
      setValidationWarnings([]);
    }
  };

  // Check if we have any tasks
  const hasExistingData = report.sections.some((section) => {
    if (section.subSections) {
      return section.subSections.some((sub) => sub.tasks.length > 0);
    }
    return section.tasks && section.tasks.length > 0;
  });

  // Handle time logged from tracker
  const [trackedTime, setTrackedTime] = useState<string>("");

  const handleTimeLogged = (time: string) => {
    setTrackedTime(time);
    // Store the time so user can add it to a task
    // You could also show a toast notification here
  };

  // Ref for import dialog
  const importDialogRef = useRef<ImportReportDialogRef>(null);

  // Toast notifications
  const { toasts, showToast, removeToast } = useToast();

  // Import history
  const { lastImport, saveImport, clearHistory, hasHistory, getTimeSinceImport } = useImportHistory();

  // Validation warnings
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([]);
  const [showValidationWarnings, setShowValidationWarnings] = useState(true);

  // Compare view
  const [showCompareView, setShowCompareView] = useState(false);

  const handleImportSuccess = (message: string) => {
    showToast({
      title: "Import Successful",
      description: message,
      variant: "success",
      duration: 4000,
    });
  };

  // Generate and copy report (for keyboard shortcut)
  const handleGenerateReport = useCallback(async () => {
    // Validate before generating
    const validation = validateReport(report);
    if (!validation.isValid) {
      setValidationWarnings(validation.warnings);
      setShowValidationWarnings(true);

      showToast({
        title: "Validation Warnings",
        description: `${validation.warnings.length} incomplete tasks found. Report generated anyway.`,
        variant: "warning",
        duration: 4000,
      });
    }

    const formatted = generateFormattedReport(report);
    await copyToClipboard(formatted);
  }, [report, showToast]);

  // Reimport last report
  const handleReimportLast = useCallback(() => {
    if (lastImport) {
      handleImportReport(
        lastImport.report.date,
        lastImport.report.sections,
        lastImport.report.nextPlanDate,
        lastImport.report.nextPlanTasks,
        lastImport.originalText
      );

      showToast({
        title: "Report Reimported",
        description: `Restored report from ${getTimeSinceImport()}`,
        variant: "success",
        duration: 3000,
      });
    }
  }, [lastImport, handleImportReport, showToast, getTimeSinceImport]);

  // Revert to original
  const handleRevertToOriginal = useCallback(() => {
    if (lastImport) {
      setReport(lastImport.report);

      showToast({
        title: "Reverted to Original",
        description: "All changes have been discarded",
        variant: "success",
        duration: 3000,
      });

      setShowCompareView(false);
    }
  }, [lastImport, showToast]);

  // Open import dialog (for keyboard shortcut)
  const handleOpenImport = useCallback(() => {
    importDialogRef.current?.openDialog();
  }, []);

  // Setup keyboard shortcuts (Ctrl+S for generate, Ctrl+I for import)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to generate report
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleGenerateReport();
      }
      // Ctrl/Cmd + I to open import dialog
      if ((event.ctrlKey || event.metaKey) && event.key === "i") {
        event.preventDefault();
        handleOpenImport();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleGenerateReport, handleOpenImport]);

  const totalTime = calculateReportTotalTime(report);
  const statusCounts = countTasksByStatus(report);

  return (
    <>
      {/* Toast Container */}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>

      {/* Compare View */}
      {showCompareView && lastImport && (
        <CompareView
          originalReport={lastImport.report}
          currentReport={report}
          onRevert={handleRevertToOriginal}
          onClose={() => setShowCompareView(false)}
        />
      )}

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
          <div className="grid gap-8 grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 col-span-2">
              {/* Import Report Button & History */}
              {/* <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <ImportReportDialog
                  ref={importDialogRef}
                  onImport={handleImportReport}
                  hasExistingData={hasExistingData}
                  onSuccess={handleImportSuccess}
                />

                {hasHistory && (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleReimportLast}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reimport Last ({getTimeSinceImport()})
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShowCompareView(true)}
                      className="gap-2"
                    >
                      <GitCompare className="h-4 w-4" />
                      Compare
                    </Button>
                  </>
                )}
              </div>

              {validationWarnings.length > 0 && showValidationWarnings && (
                <ValidationWarnings
                  warnings={validationWarnings}
                  onDismiss={() => setShowValidationWarnings(false)}
                />
              )}
            </div> */}

              {/* Date Selectors */}
              <Card>
                <CardHeader>
                  <CardTitle className="uppercase text-muted-foreground flex items-center justify-start gap-2" ><Calendar size={14} />Report Dates</CardTitle>
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
                <div className="flex items-center justify-between" >
                  <p className="capitalize font-semibold text-xl" >Work log categories</p>
                  {/* Add Section Button */}
                  <AddSectionButton onAddSection={handleAddSection} />
                </div>
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
              {/* Actions */}
              <Card className="bg-transparent border-none p-0">
                <CardContent className="grid grid-cols-5 p-0 gap-2">
                  <GenerateReportButton report={report} />
                  <ClearAllButton onClearAll={handleClearAll} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 col-span-1">
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

              {/* Keyboard Shortcuts */}
              {/* <Card className="hidden sm:block">
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
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Import Report</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                    Ctrl+I
                  </kbd>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  More shortcuts coming soon!
                </p>
              </CardContent>
            </Card> */}

              <Card className="p-4 rounded-2xl border border-border-muted space-y-4" >


                {/* Templates */}
                <TemplateManager
                  currentSections={report.sections}
                  onLoadTemplate={handleLoadTemplate}
                />
                {/* Storage Toggle */}
                <StorageToggle
                  enabled={persistenceEnabled}
                  onToggle={setPersistenceEnabled}
                />

                {/* Time Tracker */}
                {/* <TimeTracker onTimeLogged={handleTimeLogged} /> */}
              </Card>
            </div>
          </div>
          {/* Report Preview */}
          <ReportPreview report={report} />
        </main>
      </div>
    </>
  );
}
