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

const CUSTOM_COLOR_PALETTE = [
  {
    color: "text-pink-700 dark:text-pink-300",
    bgColor: "bg-pink-100",
    darkBgColor: "dark:bg-pink-900/30",
  },
  {
    color: "text-cyan-700 dark:text-cyan-300",
    bgColor: "bg-cyan-100",
    darkBgColor: "dark:bg-cyan-900/30",
  },
  {
    color: "text-rose-700 dark:text-rose-300",
    bgColor: "bg-rose-100",
    darkBgColor: "dark:bg-rose-900/30",
  },
  {
    color: "text-violet-700 dark:text-violet-300",
    bgColor: "bg-violet-100",
    darkBgColor: "dark:bg-violet-900/30",
  },
  {
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-100",
    darkBgColor: "dark:bg-amber-900/30",
  },
  {
    color: "text-teal-700 dark:text-teal-300",
    bgColor: "bg-teal-100",
    darkBgColor: "dark:bg-teal-900/30",
  },
  {
    color: "text-indigo-700 dark:text-indigo-300",
    bgColor: "bg-indigo-100",
    darkBgColor: "dark:bg-indigo-900/30",
  },
  {
    color: "text-lime-700 dark:text-lime-300",
    bgColor: "bg-lime-100",
    darkBgColor: "dark:bg-lime-900/30",
  },
  {
    color: "text-fuchsia-700 dark:text-fuchsia-300",
    bgColor: "bg-fuchsia-100",
    darkBgColor: "dark:bg-fuchsia-900/30",
  },
  {
    color: "text-sky-700 dark:text-sky-300",
    bgColor: "bg-sky-100",
    darkBgColor: "dark:bg-sky-900/30",
  },
];

function getCustomColor(status: string) {
  let hash = 0;
  for (let i = 0; i < status.length; i++) {
    hash = status.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CUSTOM_COLOR_PALETTE[Math.abs(hash) % CUSTOM_COLOR_PALETTE.length];
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as TaskStatus];
  const colors = config ?? getCustomColor(status);
  const label = config?.label ?? status;

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full font-semibold
        ${colors.color} ${colors.bgColor} ${colors.darkBgColor}
        ${SIZE_CLASSES[size]}
        transition-colors duration-200
      `}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
}
