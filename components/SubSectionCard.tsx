import { SubSection, Task } from "@/types/report";
import { Button } from "@/components/ui/button";
import { TaskRow } from "./TaskRow";
import { Plus, Package, Trash2 } from "lucide-react";
import { calculateSectionTotal } from "@/lib/time-utils";
import { useDroppable } from "@dnd-kit/core";

interface SubSectionCardProps {
  subSection: SubSection;
  sectionId: string;
  duplicateBugIds?: Set<string>;
  onAddTask: (subSectionId: string) => void;
  onUpdateTask: (
    subSectionId: string,
    taskId: string,
    updates: Partial<Task>,
  ) => void;
  onDeleteTask: (subSectionId: string, taskId: string) => void;
  onDeleteSubSection?: () => void;
}

export function SubSectionCard({
  subSection,
  sectionId,
  duplicateBugIds,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDeleteSubSection,
}: SubSectionCardProps) {
  const subtotal = calculateSectionTotal(subSection.tasks);

  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${sectionId}-${subSection.id}`,
    data: {
      sectionId,
      subSectionId: subSection.id,
      subSectionName: subSection.name,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 rounded-lg bg-muted/30 p-4 animate-in fade-in slide-in-from-bottom-1 duration-300 transition-colors ${
        isOver ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
    >
      {/* Subsection Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-sm">{subSection.name}</h4>
          <span
            className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium transition-all hover:bg-primary/20"
            role="status"
            aria-label={`${subSection.tasks.length} tasks`}
          >
            {subSection.tasks.length}{" "}
            {subSection.tasks.length === 1 ? "task" : "tasks"}
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
        <div className="flex items-center gap-2">
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
          {onDeleteSubSection && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteSubSection}
              aria-label={`Delete ${subSection.name} subsection`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tasks List */}
      {subSection.tasks.length > 0 ? (
        <div
          className="space-y-2"
          role="list"
          aria-label={`Tasks in ${subSection.name}`}
        >
          {subSection.tasks.map((task, index) => (
            <div
              key={task.id}
              role="listitem"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskRow
                task={task}
                sectionId={sectionId}
                subSectionId={subSection.id}
                duplicateBugIds={duplicateBugIds}
                onUpdate={(taskId, updates) =>
                  onUpdateTask(subSection.id, taskId, updates)
                }
                onDelete={(taskId) => onDeleteTask(subSection.id, taskId)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`text-center py-8 animate-in fade-in duration-300 rounded-lg ${isOver ? "bg-primary/10" : ""}`}
        >
          <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {isOver
              ? "Drop task here"
              : 'No tasks yet. Click "Add Task" to get started.'}
          </p>
        </div>
      )}
    </div>
  );
}
