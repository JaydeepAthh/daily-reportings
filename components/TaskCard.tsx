import { useState } from "react";
import { Task } from "@/types/report";
import { extractClickUpId } from "@/lib/report-utils";
import { StatusBadge } from "./StatusBadge";
import { TaskEditDialog } from "./TaskEditDialog";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Trash2,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  sectionId: string;
  subSectionId?: string;
  duplicateBugIds?: Set<string>;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({
  task,
  sectionId,
  subSectionId,
  duplicateBugIds,
  onUpdate,
  onDelete,
}: TaskCardProps) {
  const [editOpen, setEditOpen] = useState(false);

  const bugId = task.link ? extractClickUpId(task.link) : "";
  const isDuplicate = bugId && duplicateBugIds?.has(bugId);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task, sectionId, subSectionId },
    });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group rounded-lg border bg-card p-2.5 space-y-1.5 transition-all ${
          isDragging ? "opacity-50 shadow-lg z-50 scale-[1.02]" : ""
        } ${isDuplicate ? "border-amber-500 border-2" : "hover:border-primary/40"}`}
      >
        {/* Row 1: Drag handle + Bug ID + Status badge */}
        <div className="flex items-center gap-1.5">
          <button
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground rounded shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Drag to move"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          <span
            className={`text-xs font-mono truncate flex-1 ${
              isDuplicate
                ? "text-amber-500"
                : task.link
                  ? "text-foreground"
                  : "text-muted-foreground"
            }`}
            title={task.link || "No link"}
          >
            {isDuplicate && (
              <AlertTriangle className="h-3 w-3 inline mr-1 -mt-0.5" />
            )}
            {bugId || "No link"}
          </span>

          <StatusBadge status={task.status} size="sm" />
        </div>

        {/* Row 2: Time */}
        {task.timeSpent && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pl-5">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="font-mono">{task.timeSpent}</span>
          </div>
        )}

        {/* Row 3: Comment (truncated) */}
        {task.comment && (
          <p className="text-xs text-muted-foreground truncate pl-5">
            {task.comment}
          </p>
        )}

        {/* Row 4: Actions (visible on hover) */}
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditOpen(true)}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Edit task"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Delete task"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <TaskEditDialog
        task={task}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </>
  );
}
