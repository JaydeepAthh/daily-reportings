import { useState } from "react";
import { Task, TaskStatus } from "@/types/report";
import { extractClickUpId } from "@/lib/report-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";
import { TimeInput } from "./TimeInput";
import { QuickTimeButtons } from "./QuickTimeButtons";

interface TaskEditDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  sectionStatuses?: string[];
}

const DEFAULT_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "DONE", label: "Done" },
  { value: "MR RAISED", label: "MR Raised" },
  { value: "IN PROGRESS", label: "In Progress" },
  { value: "D&T", label: "D&T" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DEV REPLIED", label: "Dev Replied" },
];

export function TaskEditDialog({
  task,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  sectionStatuses,
}: TaskEditDialogProps) {
  // Build status options: section statuses take priority, fall back to defaults
  const statusOptions =
    sectionStatuses && sectionStatuses.length > 0
      ? sectionStatuses.map((s) => ({ value: s as TaskStatus, label: s }))
      : DEFAULT_STATUS_OPTIONS;
  const [linkFocused, setLinkFocused] = useState(false);

  const displayLink = linkFocused
    ? task.link
    : task.link
      ? extractClickUpId(task.link)
      : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {/* ClickUp Link */}
          <div className="space-y-2">
            <Label>ClickUp Link</Label>
            <Input
              placeholder="https://app.clickup.com/t/..."
              value={displayLink}
              onChange={(e) => onUpdate(task.id, { link: e.target.value })}
              onFocus={() => setLinkFocused(true)}
              onBlur={() => setLinkFocused(false)}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={task.status}
              onValueChange={(value) =>
                onUpdate(task.id, { status: value as TaskStatus })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <StatusBadge status={option.value} size="sm" />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Spent */}
          <div className="space-y-2">
            <Label>Time Spent</Label>
            <TimeInput
              value={task.timeSpent}
              onChange={(value) => onUpdate(task.id, { timeSpent: value })}
            />
            <QuickTimeButtons
              onSelectTime={(time) => onUpdate(task.id, { timeSpent: time })}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label>Comment</Label>
            <Textarea
              placeholder="Add a comment... (supports multiple lines)"
              value={task.comment || ""}
              onChange={(e) => onUpdate(task.id, { comment: e.target.value })}
              className="min-h-[80px] resize-y text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDelete(task.id);
              onOpenChange(false);
            }}
          >
            Delete Task
          </Button>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
