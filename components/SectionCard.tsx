import { useState } from "react";
import { Section, Task } from "@/types/report";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubSectionCard } from "./SubSectionCard";
import { TaskRow } from "./TaskRow";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { calculateSectionTotalTime } from "@/lib/report-utils";
import { Separator } from "@/components/ui/separator";

interface SectionCardProps {
  section: Section;
  onAddTask: (sectionId: string, subSectionId?: string) => void;
  onUpdateTask: (
    sectionId: string,
    taskId: string,
    updates: Partial<Task>,
    subSectionId?: string
  ) => void;
  onDeleteTask: (sectionId: string, taskId: string, subSectionId?: string) => void;
  onDeleteSection?: (sectionId: string) => void;
}

export function SectionCard({
  section,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDeleteSection,
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalTime = calculateSectionTotalTime(section);
  const taskCount = section.subSections
    ? section.subSections.reduce((acc, sub) => acc + sub.tasks.length, 0)
    : section.tasks?.length || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{section.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">
                  {taskCount} {taskCount === 1 ? "task" : "tasks"}
                </span>
                {taskCount > 0 && (
                  <span className="text-xs font-mono text-primary font-semibold">
                    Total: {totalTime.toFixed(2)}h
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!section.subSections && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddTask(section.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            )}
            {!section.isFixed && onDeleteSection && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteSection(section.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />

          {/* Section with Subsections */}
          {section.subSections && (
            <div className="space-y-4">
              {section.subSections.map((subSection) => (
                <SubSectionCard
                  key={subSection.id}
                  subSection={subSection}
                  onAddTask={(subSectionId) => onAddTask(section.id, subSectionId)}
                  onUpdateTask={(subSectionId, taskId, updates) =>
                    onUpdateTask(section.id, taskId, updates, subSectionId)
                  }
                  onDeleteTask={(subSectionId, taskId) =>
                    onDeleteTask(section.id, taskId, subSectionId)
                  }
                />
              ))}
            </div>
          )}

          {/* Section without Subsections */}
          {section.tasks && (
            <div className="space-y-2">
              {section.tasks.length > 0 ? (
                section.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onUpdate={(taskId, updates) =>
                      onUpdateTask(section.id, taskId, updates)
                    }
                    onDelete={(taskId) => onDeleteTask(section.id, taskId)}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No tasks yet. Click &quot;Add Task&quot; to get started.
                </p>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
