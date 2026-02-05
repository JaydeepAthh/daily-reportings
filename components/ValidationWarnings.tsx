"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { ValidationWarning } from "@/lib/report-formatter";
import { useState } from "react";

interface ValidationWarningsProps {
  warnings: ValidationWarning[];
  onDismiss?: () => void;
}

export function ValidationWarnings({ warnings, onDismiss }: ValidationWarningsProps) {
  const [expanded, setExpanded] = useState(false);

  if (warnings.length === 0) return null;

  const displayWarnings = expanded ? warnings : warnings.slice(0, 3);
  const hasMore = warnings.length > 3;

  return (
    <Alert className="border-yellow-500/50 bg-yellow-500/10">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
        <div className="flex-1">
          <AlertDescription className="text-sm">
            <div className="flex items-center justify-between mb-2">
              <strong>⚠️ {warnings.length} Task Validation Warning(s)</strong>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            <ul className="space-y-1 text-xs">
              {displayWarnings.map((warning, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-yellow-600 font-medium">•</span>
                  <span>
                    <strong>{warning.sectionName}</strong>
                    {warning.taskIndex !== undefined && ` (Task ${warning.taskIndex + 1})`}
                    {": "}
                    {warning.message}
                  </span>
                </li>
              ))}
            </ul>

            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-xs h-6 mt-2"
              >
                {expanded ? "Show Less" : `Show ${warnings.length - 3} More`}
              </Button>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
