"use client";

import { Calendar } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface ThemedDateSelectorProps {
  todayDate: string;
  nextPlanDate: string;
  onTodayDateChange: (date: string) => void;
  onNextPlanDateChange: (date: string) => void;
}

export function ThemedDateSelector({
  todayDate,
  nextPlanDate,
  onTodayDateChange,
  onNextPlanDateChange,
}: ThemedDateSelectorProps) {
  // Convert YYYY-MM-DD to MM/DD/YYYY for display
  const formatForDisplay = (isoDate: string) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${month}/${day}/${year}`;
  };

  // Convert MM/DD/YYYY to YYYY-MM-DD for storage
  const handleDateChange = (value: string, onChange: (date: string) => void) => {
    onChange(value);
  };

  return (
    <div className="rounded-card bg-card p-6 shadow-lg animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Report Dates
        </h2>
      </div>

      {/* Date Inputs */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Date */}
        <div className="space-y-2">
          <Label htmlFor="today-date" className="text-sm text-text-secondary">
            Today's Date
          </Label>
          <Input
            id="today-date"
            type="date"
            value={todayDate}
            onChange={(e) => handleDateChange(e.target.value, onTodayDateChange)}
            className="h-12 bg-input-bg border-border text-text-primary"
          />
        </div>

        {/* Next Plan Date */}
        <div className="space-y-2">
          <Label htmlFor="next-plan-date" className="text-sm text-text-secondary">
            Next Plan Date
          </Label>
          <Input
            id="next-plan-date"
            type="date"
            value={nextPlanDate}
            onChange={(e) => handleDateChange(e.target.value, onNextPlanDateChange)}
            placeholder="mm/dd/yyyy"
            className="h-12 bg-input-bg border-border text-text-primary"
          />
        </div>
      </div>
    </div>
  );
}
