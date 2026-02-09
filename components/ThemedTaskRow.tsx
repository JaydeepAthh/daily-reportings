"use client";

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
import { Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ThemedTaskRowProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "DONE", label: "Done", color: "bg-status-done text-white" },
  {
    value: "IN PROGRESS",
    label: "In Progress",
    color: "bg-status-progress text-white",
  },
  { value: "MR RAISED", label: "MR Raised", color: "bg-status-mr text-white" },
  { value: "D&T", label: "D&T", color: "bg-status-dt text-white" },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "bg-status-completed text-white",
  },
  {
    value: "DEV REPLIED",
    label: "Dev Replied",
    color: "bg-status-replied text-white",
  },
];

const QUICK_TIMES = [
  { label: "15min", value: "15min" },
  { label: "30min", value: "30min" },
  { label: "45min", value: "45min" },
  { label: "1hr", value: "1hr" },
  { label: "1hr 30min", value: "1hr 30min" },
  { label: "2hr", value: "2hr" },
];

function getStatusColor(status: TaskStatus): string {
  const option = STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || "bg-input-bg text-text-primary";
}

export function ThemedTaskRow({
  task,
  onUpdate,
  onDelete,
}: ThemedTaskRowProps) {
  const [linkFocused, setLinkFocused] = useState(false);

  const displayLink = linkFocused
    ? task.link
    : task.link
      ? extractClickUpId(task.link)
      : "";
  const handleQuickTime = (time: string) => {
    onUpdate(task.id, { timeSpent: time });
  };

  return (
    <div className="rounded-lg bg-card-dark p-4 space-y-4 border border-border animate-fade-in">
      {/* Main Grid - 4 Columns */}
      <div className="grid gap-4 sm:grid-cols-4">
        {/* ClickUp Link */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">
            ClickUp Link
          </label>
          <Input
            placeholder="https://..."
            value={displayLink}
            onChange={(e) => onUpdate(task.id, { link: e.target.value })}
            onFocus={() => setLinkFocused(true)}
            onBlur={() => setLinkFocused(false)}
            className="h-10 bg-input-bg border-border text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Status</label>
          <Select
            value={task.status}
            onValueChange={(value) =>
              onUpdate(task.id, { status: value as TaskStatus })
            }
          >
            <SelectTrigger
              className={`h-10 border-0 ${getStatusColor(task.status)}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {STATUS_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="hover:bg-card-dark"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${option.color.split(" ")[0].replace("bg-", "bg-")}`}
                    ></div>
                    <span className="text-text-primary">{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Spent */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">
            Time Spent
          </label>
          <Input
            placeholder="1hr 40min"
            value={task.timeSpent}
            onChange={(e) => onUpdate(task.id, { timeSpent: e.target.value })}
            className="h-10 bg-input-bg border-border text-text-primary placeholder:text-text-muted"
          />

          {/* Quick Time Buttons */}
          <div className="flex flex-wrap gap-1 mt-2">
            {QUICK_TIMES.map((time) => (
              <button
                key={time.value}
                onClick={() => handleQuickTime(time.value)}
                className="rounded-full bg-card px-2.5 py-1 text-[10px] text-text-muted hover:bg-border hover:text-text-primary transition-colors"
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Action</label>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-10 w-full bg-danger hover:bg-danger-hover"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Comment Field */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-text-muted">
          Comment (Optional)
        </label>
        <Textarea
          placeholder="Add a comment..."
          value={task.comment || ""}
          onChange={(e) => onUpdate(task.id, { comment: e.target.value })}
          className="min-h-[60px] bg-input-bg border-border text-text-primary placeholder:text-text-muted resize-none"
        />
      </div>
    </div>
  );
}
