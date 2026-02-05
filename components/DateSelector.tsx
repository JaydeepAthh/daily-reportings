import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateSelectorProps {
  todayDate: string;
  nextPlanDate: string;
  onTodayDateChange: (date: string) => void;
  onNextPlanDateChange: (date: string) => void;
}

export function DateSelector({
  todayDate,
  nextPlanDate,
  onTodayDateChange,
  onNextPlanDateChange,
}: DateSelectorProps) {
  // Convert YYYY-MM-DD to DD-MM-YYYY for display
  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
  };

  // Convert DD-MM-YYYY to YYYY-MM-DD for storage
  const formatDateForStorage = (displayDate: string): string => {
    if (!displayDate) return "";
    const [day, month, year] = displayDate.split("-");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="today-date">Today&apos;s Date</Label>
        <Input
          id="today-date"
          type="date"
          value={todayDate}
          onChange={(e) => onTodayDateChange(e.target.value)}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Display: {formatDateForDisplay(todayDate)}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="next-plan-date">Next Plan Date</Label>
        <Input
          id="next-plan-date"
          type="date"
          value={nextPlanDate}
          onChange={(e) => onNextPlanDateChange(e.target.value)}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Display: {formatDateForDisplay(nextPlanDate) || "Not set"}
        </p>
      </div>
    </div>
  );
}
