import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface QuickTimeButtonsProps {
  onSelectTime: (time: string) => void;
}

const QUICK_TIMES = [
  { label: "15min", value: "15min" },
  { label: "30min", value: "30min" },
  { label: "45min", value: "45min" },
  { label: "1hr", value: "1hr" },
  { label: "1hr 30min", value: "1hr 30min" },
  { label: "2hr", value: "2hr" },
];

export function QuickTimeButtons({ onSelectTime }: QuickTimeButtonsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Quick times:</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {QUICK_TIMES.map((time) => (
          <Button
            key={time.value}
            variant="outline"
            size="sm"
            onClick={() => onSelectTime(time.value)}
            className="h-7 px-2 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label={`Set time to ${time.label}`}
          >
            {time.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
