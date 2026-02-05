import { SubSection, Task } from "@/types/report";
import { Button } from "@/components/ui/button";
import { TaskRow } from "./TaskRow";
import { Plus, Package } from "lucide-react";
import { calculateSectionTotal } from "@/lib/time-utils";
import { Separator } from "@/components/ui/separator";

interface SubSectionCardProps {
  subSection: SubSection;
  onAddTask: (subSectionId: string) => void;
  onUpdateTask: (subSectionId: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (subSectionId: string, taskId: string) => void;
}

export function SubSectionCard({
  subSection,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: SubSectionCardProps) {
  const subtotal = calculateSectionTotal(subSection.tasks);

  return (
    <div className="space-y-3 rounded-lg border-l-4 border-l-primary/20 bg-muted/30 p-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
      {/* Subsection Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-sm">{subSection.name}</h4>
          <span
            className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium transition-all hover:bg-primary/20"
            role="status"
            aria-label={`${subSection.tasks.length} tasks`}
          >
            {subSection.tasks.length} {subSection.tasks.length === 1 ? "task" : "tasks"}
          </span>
          {subSection.tasks.length > 0 && (
            <span
              className="text-xs font-mono text-muted-foreground animate-in fade-in duration-300"
              aria-label={`Total time: ${subtotal.toFixed(2)} hours`}
            >
              Total: {subtotal.toFixed(2)}h
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddTask(subSection.id)}
          className="transition-all hover:scale-105"
          aria-label={`Add task to ${subSection.name}`}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>

      {/* Tasks List */}
      {subSection.tasks.length > 0 ? (
        <div className="space-y-2" role="list" aria-label={`Tasks in ${subSection.name}`}>
          {subSection.tasks.map((task, index) => (
            <div
              key={task.id}
              role="listitem"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskRow
                task={task}
                onUpdate={(taskId, updates) =>
                  onUpdateTask(subSection.id, taskId, updates)
                }
                onDelete={(taskId) => onDeleteTask(subSection.id, taskId)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 animate-in fade-in duration-300">
          <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No tasks yet. Click &quot;Add Task&quot; to get started.
          </p>
        </div>
      )}
    </div>
  );
}
