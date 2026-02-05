"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Section } from "@/types/report";
import { ThemedTaskRow } from "./ThemedTaskRow";
import { calculateSectionTotalTime } from "@/lib/report-utils";

interface ThemedSectionCardProps {
  section: Section;
  onAddTask: (sectionId: string, subSectionId?: string) => void;
  onUpdateTask: (
    sectionId: string,
    taskId: string,
    updates: any,
    subSectionId?: string
  ) => void;
  onDeleteTask: (sectionId: string, taskId: string, subSectionId?: string) => void;
  onDeleteSection?: (sectionId: string) => void;
}

export function ThemedSectionCard({
  section,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDeleteSection,
}: ThemedSectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalTime = calculateSectionTotalTime(section);
  const taskCount = section.subSections
    ? section.subSections.reduce((acc, sub) => acc + sub.tasks.length, 0)
    : section.tasks?.length || 0;

  const hasSubsections = section.subSections && section.subSections.length > 0;
  const hasTasks = taskCount > 0;

  return (
    <div className="rounded-card bg-card shadow-lg animate-slide-in">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-primary" />
          ) : (
            <ChevronDown className="h-5 w-5 text-text-muted" />
          )}

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary">
              {section.name}
            </h3>
            <p className="text-sm text-text-secondary">
              {taskCount} task{taskCount !== 1 ? "s" : ""} • Total:{" "}
              {totalTime.toFixed(2)}h
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {!isExpanded && (
            <Button
              size="sm"
              onClick={() => {
                setIsExpanded(true);
                // Will add task after expansion
              }}
              className="bg-primary hover:bg-primary-hover"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          )}

          {!section.isFixed && onDeleteSection && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteSection(section.id)}
              className="h-8 w-8 hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Subsections */}
          {hasSubsections &&
            section.subSections!.map((subsection) => (
              <div key={subsection.id} className="space-y-3">
                {/* Subsection Header */}
                {subsection.tasks.length > 0 && (
                  <div className="flex items-center gap-2 px-2">
                    <div className="h-px flex-1 bg-border"></div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      {subsection.name} ({subsection.tasks.length})
                    </span>
                    <div className="h-px flex-1 bg-border"></div>
                  </div>
                )}

                {/* Subsection Tasks */}
                {subsection.tasks.map((task) => (
                  <ThemedTaskRow
                    key={task.id}
                    task={task}
                    onUpdate={(taskId, updates) =>
                      onUpdateTask(section.id, taskId, updates, subsection.id)
                    }
                    onDelete={(taskId) =>
                      onDeleteTask(section.id, taskId, subsection.id)
                    }
                  />
                ))}

                {/* Add Task Button for Subsection */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddTask(section.id, subsection.id)}
                  className="w-full border-dashed border-border hover:bg-card-dark"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task to {subsection.name}
                </Button>
              </div>
            ))}

          {/* Direct Tasks (no subsections) */}
          {!hasSubsections &&
            section.tasks?.map((task) => (
              <ThemedTaskRow
                key={task.id}
                task={task}
                onUpdate={(taskId, updates) =>
                  onUpdateTask(section.id, taskId, updates)
                }
                onDelete={(taskId) => onDeleteTask(section.id, taskId)}
              />
            ))}

          {/* Add Task Button */}
          {(!hasSubsections || !hasTasks) && (
            <Button
              size="sm"
              onClick={() => onAddTask(section.id)}
              className="w-full bg-primary hover:bg-primary-hover"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
