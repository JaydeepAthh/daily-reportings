import { useState } from "react";
import { Task, TaskStatus } from "@/types/report";
import { extractClickUpId } from "@/lib/report-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, GripVertical, AlertTriangle } from "lucide-react";
import { TimeInput } from "./TimeInput";
import { StatusBadge } from "./StatusBadge";
import { QuickTimeButtons } from "./QuickTimeButtons";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface TaskRowProps {
  task: Task;
  sectionId: string;
  subSectionId?: string;
  duplicateBugIds?: Set<string>;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "DONE", label: "Done" },
  { value: "MR RAISED", label: "MR Raised" },
  { value: "IN PROGRESS", label: "In Progress" },
  { value: "D&T", label: "D&T" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DEV REPLIED", label: "Dev Replied" },
];

export function TaskRow({
  task,
  sectionId,
  subSectionId,
  duplicateBugIds,
  onUpdate,
  onDelete,
}: TaskRowProps) {
  const [linkFocused, setLinkFocused] = useState(false);

  const displayLink = linkFocused
    ? task.link
    : task.link
      ? extractClickUpId(task.link)
      : "";

  const bugId = task.link ? extractClickUpId(task.link) : "";
  const isDuplicate = bugId && duplicateBugIds?.has(bugId);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: {
        task,
        sectionId,
        subSectionId,
      },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid gap-3 rounded-lg border p-3 bg-card animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isDragging ? "opacity-50 shadow-lg z-50" : ""
      } ${isDuplicate ? "border-amber-500 border-2" : ""}`}
      role="group"
      aria-label="Task entry"
    >
      <div className="grid gap-3 sm:grid-cols-[auto_1fr_1fr_1fr_1fr] items-start">
        {/* Drag Handle */}
        <div className="flex items-center pt-6">
          <button
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>

        {/* ClickUp Link */}
        <div className="space-y-1">
          <label
            htmlFor={`link-${task.id}`}
            className="text-xs font-medium text-muted-foreground"
          >
            ClickUp Link
          </label>
          <div className="relative">
            <Input
              id={`link-${task.id}`}
              placeholder="https://..."
              value={displayLink}
              onChange={(e) => onUpdate(task.id, { link: e.target.value })}
              onFocus={() => setLinkFocused(true)}
              onBlur={() => setLinkFocused(false)}
              className={`h-9 ${isDuplicate ? "pr-8 border-amber-500 focus-visible:ring-amber-500" : ""}`}
              aria-label="Task link"
            />
            {isDuplicate && (
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center"
                title="Duplicate bug"
              >
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
            )}
          </div>
          {isDuplicate && (
            <p className="text-[10px] text-amber-500 font-medium">
              Duplicate bug
            </p>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="space-y-1">
          <label
            htmlFor={`status-${task.id}`}
            className="text-xs font-medium text-muted-foreground"
          >
            Status
          </label>
          <Select
            value={task.status}
            onValueChange={(value) =>
              onUpdate(task.id, { status: value as TaskStatus })
            }
          >
            <SelectTrigger
              id={`status-${task.id}`}
              className="h-9"
              aria-label="Task status"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <StatusBadge status={option.value} size="sm" />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Spent */}
        <div className="space-y-1">
          <label
            htmlFor={`time-${task.id}`}
            className="text-xs font-medium text-muted-foreground"
          >
            Time Spent
          </label>
          <TimeInput
            value={task.timeSpent}
            onChange={(value) => onUpdate(task.id, { timeSpent: value })}
          />
          <QuickTimeButtons
            onSelectTime={(time) => onUpdate(task.id, { timeSpent: time })}
          />
        </div>

        {/* Delete Button */}
        <div className="space-y-1 flex items-center justify-end">
          <label className="sr-only text-xs font-medium text-muted-foreground">
            Action
          </label>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(task.id)}
            className="mt-5.75 "
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Comment Field */}
      <div className="space-y-1">
        <label
          htmlFor={`comment-${task.id}`}
          className="text-xs font-medium text-muted-foreground"
        >
          Comment (Optional)
        </label>
        <Input
          id={`comment-${task.id}`}
          placeholder="Add a comment..."
          value={task.comment || ""}
          onChange={(e) => onUpdate(task.id, { comment: e.target.value })}
          className="h-9"
          aria-label="Task comment"
        />
      </div>
    </div>
  );
}
