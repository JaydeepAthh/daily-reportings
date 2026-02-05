"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Report, Task, Section } from "@/types/report";
import {
  createEmptyReport,
  createEmptyTask,
  calculateReportTotalTime,
  countTasksByStatus,
  initializeDefaultSections,
} from "@/lib/report-utils";
import {
  generateFormattedReport,
  copyToClipboard,
} from "@/lib/report-formatter";
import { ThemedHeader } from "@/components/ThemedHeader";
import { ThemedDateSelector } from "@/components/ThemedDateSelector";
import { WorkLogCategories } from "@/components/WorkLogCategories";
import { StatisticsSidebar } from "@/components/StatisticsSidebar";
import { ThemedBottomActions } from "@/components/ThemedBottomActions";
import { ThemedReportPreview } from "@/components/ThemedReportPreview";
import { ImportReportDialog, ImportReportDialogRef } from "@/components/ImportReportDialog";
import { ValidationWarnings } from "@/components/ValidationWarnings";
import { CompareView } from "@/components/CompareView";
import { useToast, ToastContainer, Toast } from "@/components/ui/toast";
import { useImportHistory } from "@/hooks/useImportHistory";
import {
  useLocalStorage,
  usePersistenceToggle,
  useHasStoredData,
} from "@/hooks/useLocalStorage";
import { validateReport, ValidationWarning } from "@/lib/report-formatter";

export default function ThemedReportPage() {
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

  // Toast notifications
  const { toasts, showToast, removeToast } = useToast();

  // Import history
  const { lastImport, saveImport, hasHistory, getTimeSinceImport } = useImportHistory();

  // Validation warnings
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([]);
  const [showValidationWarnings, setShowValidationWarnings] = useState(true);

  // Compare view
  const [showCompareView, setShowCompareView] = useState(false);

  // Import dialog ref
  const importDialogRef = useRef<ImportReportDialogRef>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewText, setPreviewText] = useState("");

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

        if (subSectionId && section.subSections) {
          return {
            ...section,
            subSections: section.subSections.map((subSection) =>
              subSection.id === subSectionId
                ? {
                    ...subSection,
                    tasks: subSection.tasks.filter(
                      (task) => task.id !== taskId
                    ),
                  }
                : subSection
            ),
          };
        }

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
    if (confirm("Are you sure you want to clear all tasks? This cannot be undone.")) {
      setReport((prev) => ({
        ...prev,
        sections: initializeDefaultSections(),
        nextPlanTasks: [],
      }));

      showToast({
        title: "Cleared",
        description: "All tasks have been cleared",
        variant: "success",
        duration: 3000,
      });
    }
  };

  // Generate and copy report
  const handleGenerateReport = useCallback(async () => {
    setIsGenerating(true);

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
    setPreviewText(formatted);
    await copyToClipboard(formatted);

    showToast({
      title: "Report Copied!",
      description: "Report has been copied to clipboard",
      variant: "success",
      duration: 3000,
    });

    setIsGenerating(false);
  }, [report, showToast]);

  // Import report
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

    if (originalText) {
      saveImport(newReport, originalText);
    }

    const validation = validateReport(newReport);
    if (!validation.isValid) {
      setValidationWarnings(validation.warnings);
      setShowValidationWarnings(true);
    } else {
      setValidationWarnings([]);
    }

    showToast({
      title: "Import Successful",
      description: `Imported ${sections.length} sections`,
      variant: "success",
      duration: 3000,
    });
  };

  // Open import dialog
  const handleOpenImport = useCallback(() => {
    importDialogRef.current?.openDialog();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleGenerateReport();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "i") {
        event.preventDefault();
        handleOpenImport();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleGenerateReport, handleOpenImport]);

  // Templates
  const handleSaveTemplate = () => {
    // Template logic
    showToast({
      title: "Template Saved",
      description: "Your template has been saved",
      variant: "success",
      duration: 3000,
    });
  };

  const handleLoadTemplate = () => {
    // Template logic
    showToast({
      title: "No Templates",
      description: "You don't have any saved templates yet",
      variant: "warning",
      duration: 3000,
    });
  };

  // Export functions
  const handleExportTxt = () => {
    const formatted = generateFormattedReport(report);
    const blob = new Blob([formatted], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-report-${report.date}.txt`;
    a.click();
  };

  const handleExportMd = () => {
    const formatted = generateFormattedReport(report);
    const blob = new Blob([formatted], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-report-${report.date}.md`;
    a.click();
  };

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
          onRevert={() => {
            setReport(lastImport.report);
            setShowCompareView(false);
            showToast({
              title: "Reverted",
              description: "Changes have been discarded",
              variant: "success",
              duration: 3000,
            });
          }}
          onClose={() => setShowCompareView(false)}
        />
      )}

      {/* Import Dialog */}
      <ImportReportDialog
        ref={importDialogRef}
        onImport={handleImportReport}
        hasExistingData={hasStoredData}
      />

      {/* Main Layout */}
      <div className="min-h-screen bg-background">
        {/* Header */}
        <ThemedHeader />

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            {/* Left Column - Main Work Area */}
            <div className="space-y-6">
              {/* Date Selector */}
              <ThemedDateSelector
                todayDate={report.date}
                nextPlanDate={report.nextPlanDate}
                onTodayDateChange={handleTodayDateChange}
                onNextPlanDateChange={handleNextPlanDateChange}
              />

              {/* Validation Warnings */}
              {validationWarnings.length > 0 && showValidationWarnings && (
                <ValidationWarnings
                  warnings={validationWarnings}
                  onDismiss={() => setShowValidationWarnings(false)}
                />
              )}

              {/* Work Log Categories */}
              <WorkLogCategories
                sections={report.sections}
                onAddSection={handleAddSection}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onDeleteSection={handleDeleteSection}
                onImport={handleOpenImport}
              />

              {/* Bottom Actions */}
              <ThemedBottomActions
                onGenerate={handleGenerateReport}
                onClearAll={handleClearAll}
                isGenerating={isGenerating}
              />

              {/* Report Preview */}
              <ThemedReportPreview
                reportText={previewText}
                onCopy={async () => {
                  await copyToClipboard(previewText);
                  showToast({
                    title: "Copied!",
                    description: "Report copied to clipboard",
                    variant: "success",
                    duration: 2000,
                  });
                }}
              />
            </div>

            {/* Right Column - Statistics Sidebar */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <StatisticsSidebar
                totalTime={totalTime}
                statusCounts={statusCounts}
                onSaveTemplate={handleSaveTemplate}
                onLoadTemplate={handleLoadTemplate}
                autoSaveEnabled={persistenceEnabled}
                onToggleAutoSave={() => setPersistenceEnabled(!persistenceEnabled)}
                templateCount={0}
                onExportTxt={handleExportTxt}
                onExportMd={handleExportMd}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
