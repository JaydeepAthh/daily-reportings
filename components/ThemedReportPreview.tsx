"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface ThemedReportPreviewProps {
  reportText: string;
  onCopy: () => void;
}

export function ThemedReportPreview({
  reportText,
  onCopy,
}: ThemedReportPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-card bg-card shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary"></div>
          <h3 className="text-sm font-semibold text-text-primary">
            Report Preview
          </h3>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-text-muted hover:text-text-primary"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              COLLAPSE PREVIEW
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              EXPAND PREVIEW
            </>
          )}
        </Button>
      </div>

      {/* Preview Content */}
      {isExpanded && (
        <div className="p-4">
          <div className="relative">
            <ScrollArea className="h-96 rounded-lg bg-card-dark p-4 border border-border">
              <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap">
                {reportText || "Generate a report to see the preview..."}
              </pre>
            </ScrollArea>

            {/* Copy Button */}
            {reportText && (
              <Button
                onClick={onCopy}
                size="sm"
                className="absolute top-2 right-2 bg-primary hover:bg-primary-hover"
              >
                <Copy className="mr-2 h-3 w-3" />
                Copy
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
