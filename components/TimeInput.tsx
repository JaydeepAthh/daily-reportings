import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  convertTimeToDecimal,
  isValidTimeFormat,
  normalizeTimeString,
} from "@/lib/time-utils";
import { Check, AlertCircle } from "lucide-react";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimeInput({
  value,
  onChange,
  placeholder = "1hr 40min",
  className = "",
}: TimeInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showDecimal, setShowDecimal] = useState(false);

  const isValid = value ? isValidTimeFormat(value) : true;
  const decimal = value && isValid ? convertTimeToDecimal(value) : 0;

  useEffect(() => {
    if (value && isValid) {
      setShowDecimal(true);
      const timer = setTimeout(() => setShowDecimal(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [value, isValid]);

  const getBorderColor = () => {
    if (!value) return "";
    if (!isValid) return "border-red-500 focus:ring-red-500";
    if (showDecimal) return "border-green-500 focus:ring-green-500";
    return "";
  };

  return (
    <div className="relative">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`h-9 pr-8 transition-all ${getBorderColor()} ${className}`}
            aria-label="Time spent"
            aria-invalid={!isValid}
            aria-describedby={!isValid ? "time-error" : undefined}
          />
          {value && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {isValid ? (
                <Check className="h-4 w-4 text-green-500 animate-in fade-in zoom-in duration-200" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500 animate-in fade-in zoom-in duration-200" />
              )}
            </div>
          )}
        </div>
        {value && isValid && (
          <span
            className="text-xs font-mono text-muted-foreground whitespace-nowrap min-w-[50px] text-right animate-in fade-in slide-in-from-right-2 duration-300"
            aria-label={`${decimal.toFixed(2)} hours`}
          >
            {decimal.toFixed(2)}h
          </span>
        )}
      </div>
      {value && !isValid && (
        <p
          id="time-error"
          className="text-xs text-red-500 mt-1 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          Use format: &quot;1hr 40min&quot;, &quot;34min&quot;, or &quot;2hr&quot;
        </p>
      )}
      {isFocused && !value && (
        <p className="text-xs text-muted-foreground mt-1 animate-in fade-in duration-200">
          Examples: 1hr 40min, 34min, 2hr
        </p>
      )}
    </div>
  );
}
