"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Report, Task, TaskStatus, Section, SubSection } from "@/types/report";
import {
  createEmptyReport,
  createEmptyTask,
  calculateReportTotalTime,
  countTasksByStatus,
  initializeDefaultSections,
  addSubSectionToSection,
  deleteSubSectionFromSection,
  convertSectionToSubSections,
  moveTaskBetweenSubSections,
  getDuplicateBugIds,
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
import { KanbanColumn } from "@/components/KanbanColumn";
import { AddSectionButton } from "@/components/AddSectionButton";
import { GenerateReportButton } from "@/components/GenerateReportButton";
import { ReportPreview } from "@/components/ReportPreview";
import { ClearAllButton } from "@/components/ClearAllButton";
import { StorageToggle } from "@/components/StorageToggle";
import { TemplateManager } from "@/components/TemplateManager";
import {
  ImportReportDialog,
  ImportReportDialogRef,
} from "@/components/ImportReportDialog";
import { ValidationWarnings } from "@/components/ValidationWarnings";
import { CompareView } from "@/components/CompareView";
import { Separator } from "@/components/ui/separator";
import { useToast, ToastContainer, Toast } from "@/components/ui/toast";
import { useImportHistory } from "@/hooks/useImportHistory";
import {
  useLocalStorage,
  usePersistenceToggle,
  useHasStoredData,
} from "@/hooks/useLocalStorage";
import { Clock, ListChecks, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

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

        // If status is being changed and section has subsections, move the task
        if (updates.status && subSectionId && section.subSections) {
          return moveTaskBetweenSubSections(
            section,
            taskId,
            updates.status,
            subSectionId,
          );
        }

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

  // Add subsection to a section
  const handleAddSubSection = (sectionId: string, subSectionName: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? addSubSectionToSection(section, subSectionName)
          : section,
      ),
    }));
  };

  // Delete subsection from a section
  const handleDeleteSubSection = (sectionId: string, subSectionId: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? deleteSubSectionFromSection(section, subSectionId)
          : section,
      ),
    }));
  };

  // Convert section to have subsections
  const handleConvertToSubSections = (sectionId: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? convertSectionToSubSections(section)
          : section,
      ),
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
    originalText?: string,
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
  const {
    lastImport,
    saveImport,
    clearHistory,
    hasHistory,
    getTimeSinceImport,
  } = useImportHistory();

  // Validation warnings
  const [validationWarnings, setValidationWarnings] = useState<
    ValidationWarning[]
  >([]);
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
        lastImport.originalText,
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

  // Collapsed columns state (persisted in localStorage)
  const [collapsedColumns, setCollapsedColumns] = useLocalStorage<string[]>({
    key: "kanban-collapsed-columns",
    defaultValue: [],
    enabled: true,
  });

  const collapsedSet = useMemo(
    () => new Set(collapsedColumns),
    [collapsedColumns],
  );

  const handleToggleCollapse = useCallback(
    (sectionId: string) => {
      setCollapsedColumns((prev) => {
        const set = new Set(prev);
        if (set.has(sectionId)) {
          set.delete(sectionId);
        } else {
          set.add(sectionId);
        }
        return Array.from(set);
      });
    },
    [setCollapsedColumns],
  );

  // Duplicate bug detection
  const duplicateBugIds = useMemo(() => getDuplicateBugIds(report), [report]);

  // Drag and drop
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { task } = event.active.data.current as { task: Task };
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const source = active.data.current as {
      task: Task;
      sectionId: string;
      subSectionId?: string;
    };
    const dest = over.data.current as {
      sectionId: string;
      subSectionId?: string;
      subSectionName?: string;
    };

    // Don't move if dropped in the same location
    if (
      source.sectionId === dest.sectionId &&
      source.subSectionId === dest.subSectionId
    ) {
      return;
    }

    const taskToMove = { ...source.task };

    // If dropping into a named subsection that matches a status, update the status
    if (dest.subSectionName) {
      const matchingStatus = (
        [
          "DONE",
          "MR RAISED",
          "IN PROGRESS",
          "D&T",
          "COMPLETED",
          "DEV REPLIED",
        ] as TaskStatus[]
      ).find((s) => s.toUpperCase() === dest.subSectionName!.toUpperCase());
      if (matchingStatus) {
        taskToMove.status = matchingStatus;
      }
    }

    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        let updated = section;

        // Remove from source
        if (section.id === source.sectionId) {
          if (source.subSectionId && updated.subSections) {
            updated = {
              ...updated,
              subSections: updated.subSections.map((sub) =>
                sub.id === source.subSectionId
                  ? {
                      ...sub,
                      tasks: sub.tasks.filter((t) => t.id !== taskToMove.id),
                    }
                  : sub,
              ),
            };
          } else if (updated.tasks) {
            updated = {
              ...updated,
              tasks: updated.tasks.filter((t) => t.id !== taskToMove.id),
            };
          }
        }

        // Add to destination
        if (section.id === dest.sectionId) {
          if (dest.subSectionId && updated.subSections) {
            updated = {
              ...updated,
              subSections: updated.subSections.map((sub) =>
                sub.id === dest.subSectionId
                  ? { ...sub, tasks: [...sub.tasks, taskToMove] }
                  : sub,
              ),
            };
          } else if (updated.tasks) {
            updated = {
              ...updated,
              tasks: [...updated.tasks, taskToMove],
            };
          }
        }

        return updated;
      }),
    }));
  };

  const totalTime = calculateReportTotalTime(report);
  const statusCounts = countTasksByStatus(report);
  const totalTasks = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  // Generate report with copy feedback
  const [copied, setCopied] = useState(false);
  const handleGenerateWithFeedback = async () => {
    await handleGenerateReport();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      <div className="min-h-screen bg-background flex flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="px-4 py-3">
            {/* Top row: Title + Actions */}
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-lg font-bold tracking-tight truncate">
                Daily Report Generator
              </h1>
              <div className="flex items-center gap-2 shrink-0">
                <AddSectionButton onAddSection={handleAddSection} />
                <TemplateManager
                  currentSections={report.sections}
                  onLoadTemplate={handleLoadTemplate}
                />
                <StorageToggle
                  enabled={persistenceEnabled}
                  onToggle={setPersistenceEnabled}
                />
                <Separator orientation="vertical" className="h-6" />
                <ClearAllButton onClearAll={handleClearAll} />
                <Button
                  size="sm"
                  onClick={handleGenerateWithFeedback}
                  className="gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Toolbar: Dates + Stats */}
            <div className="flex items-center justify-between gap-6 mt-3 flex-wrap">
              {/* Compact date selectors */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="header-today"
                    className="text-xs text-muted-foreground whitespace-nowrap"
                  >
                    Today
                  </Label>
                  <Input
                    id="header-today"
                    type="date"
                    value={report.date}
                    onChange={(e) => handleTodayDateChange(e.target.value)}
                    className="h-7 text-xs w-[140px] pl-2.5"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="header-next"
                    className="text-xs text-muted-foreground whitespace-nowrap"
                  >
                    Next Plan
                  </Label>
                  <Input
                    id="header-next"
                    type="date"
                    value={report.nextPlanDate}
                    onChange={(e) => handleNextPlanDateChange(e.target.value)}
                    className="h-7 text-xs w-[140px] pl-2.5"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground">
                    {formatTimeFromDecimal(totalTime)}
                  </span>
                  <span>({totalTime.toFixed(2)}h)</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ListChecks className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground">
                    {totalTasks}
                  </span>
                  <span>tasks</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-3">
                  <span className="text-green-500 font-medium">
                    {statusCounts.DONE} done
                  </span>
                  <span className="text-yellow-500 font-medium">
                    {statusCounts["IN PROGRESS"]} in progress
                  </span>
                  <span className="text-blue-500 font-medium">
                    {statusCounts["MR RAISED"]} MR
                  </span>
                  <span className="text-purple-500 font-medium">
                    {statusCounts["D&T"]} D&T
                  </span>
                  <span className="text-emerald-500 font-medium">
                    {statusCounts.COMPLETED} completed
                  </span>
                  <span className="text-orange-500 font-medium">
                    {statusCounts["DEV REPLIED"]} dev replied
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Kanban Board */}
        <main className="flex-1 overflow-hidden">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-3 p-4 overflow-x-auto h-[calc(100vh-130px)] scrollbar-hidden hide-scrollbar">
              {report.sections.map((section) => (
                <KanbanColumn
                  key={section.id}
                  section={section}
                  duplicateBugIds={duplicateBugIds}
                  collapsed={collapsedSet.has(section.id)}
                  onToggleCollapse={handleToggleCollapse}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onDeleteSection={
                    !section.isFixed ? handleDeleteSection : undefined
                  }
                  onAddSubSection={handleAddSubSection}
                  onDeleteSubSection={handleDeleteSubSection}
                  onConvertToSubSections={handleConvertToSubSections}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask ? (
                <div className="rounded-lg border-2 border-primary bg-card p-2.5 shadow-xl opacity-90 w-[280px]">
                  <p className="text-xs font-mono font-medium truncate">
                    {activeTask.link || "No link"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {activeTask.status} &middot;{" "}
                    {activeTask.timeSpent || "No time"}
                  </p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </main>
      </div>
    </>
  );
}
