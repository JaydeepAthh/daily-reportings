import { TaskStatus } from "@/types/report";

interface StatusBadgeProps {
  status: TaskStatus;
  size?: "sm" | "md" | "lg";
}

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string; darkBgColor: string }
> = {
  DONE: {
    label: "Done",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-100",
    darkBgColor: "dark:bg-green-900/30",
  },
  "MR RAISED": {
    label: "MR Raised",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100",
    darkBgColor: "dark:bg-blue-900/30",
  },
  "IN PROGRESS": {
    label: "In Progress",
    color: "text-yellow-700 dark:text-yellow-300",
    bgColor: "bg-yellow-100",
    darkBgColor: "dark:bg-yellow-900/30",
  },
  "D&T": {
    label: "D&T",
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-100",
    darkBgColor: "dark:bg-purple-900/30",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-700 dark:text-emerald-300",
    bgColor: "bg-emerald-100",
    darkBgColor: "dark:bg-emerald-900/30",
  },
  "DEV REPLIED": {
    label: "Dev Replied",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-100",
    darkBgColor: "dark:bg-orange-900/30",
  },
};

const SIZE_CLASSES = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full font-semibold
        ${config.color} ${config.bgColor} ${config.darkBgColor}
        ${SIZE_CLASSES[size]}
        transition-colors duration-200
      `}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
