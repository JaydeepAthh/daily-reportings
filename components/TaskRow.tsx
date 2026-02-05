import { Task, TaskStatus } from "@/types/report";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { TimeInput } from "./TimeInput";
import { StatusBadge } from "./StatusBadge";

interface TaskRowProps {
  task: Task;
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

export function TaskRow({ task, onUpdate, onDelete }: TaskRowProps) {
  return (
    <div
      className="grid gap-3 rounded-lg border p-3 bg-card animate-in fade-in slide-in-from-bottom-2 duration-300"
      role="group"
      aria-label="Task entry"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* ClickUp Link */}
        <div className="space-y-1">
          <label
            htmlFor={`link-${task.id}`}
            className="text-xs font-medium text-muted-foreground"
          >
            ClickUp Link
          </label>
          <Input
            id={`link-${task.id}`}
            placeholder="https://..."
            value={task.link}
            onChange={(e) => onUpdate(task.id, { link: e.target.value })}
            className="h-9"
            aria-label="Task link"
          />
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
        </div>

        {/* Delete Button */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Action
          </label>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-9 w-full transition-all hover:scale-105"
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
