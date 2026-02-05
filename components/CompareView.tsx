"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Copy, RotateCcw, X } from "lucide-react";
import { Report } from "@/types/report";
import { generateImportableReport } from "@/lib/report-formatter";
import { copyToClipboard } from "@/lib/report-formatter";

interface CompareViewProps {
  originalReport: Report;
  currentReport: Report;
  onRevert: () => void;
  onClose: () => void;
}

export function CompareView({
  originalReport,
  currentReport,
  onRevert,
  onClose,
}: CompareViewProps) {
  const [copied, setCopied] = useState<"original" | "current" | null>(null);

  const originalText = generateImportableReport(originalReport);
  const currentText = generateImportableReport(currentReport);

  const hasChanges = originalText !== currentText;

  const handleCopy = async (text: string, type: "original" | "current") => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  // Calculate differences
  const originalLines = originalText.split("\n");
  const currentLines = currentText.split("\n");

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur">
      <div className="container mx-auto h-full flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Compare View</h2>
              <p className="text-sm text-muted-foreground">
                {hasChanges
                  ? "Changes detected between original and current"
                  : "No changes detected"}
              </p>
            </div>
          </div>

          {hasChanges && (
            <Button
              variant="destructive"
              onClick={onRevert}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Revert to Original
            </Button>
          )}
        </div>

        {/* Compare Grid */}
        <div className="grid md:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Original */}
          <Card className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Original Report</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(originalText, "original")}
                className="gap-2"
              >
                <Copy className="h-3 w-3" />
                {copied === "original" ? "Copied!" : "Copy"}
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <pre className="font-mono text-xs whitespace-pre-wrap">
                  {originalLines.map((line, idx) => {
                    const isDifferent =
                      currentLines[idx] !== line ||
                      idx >= currentLines.length;

                    return (
                      <div
                        key={idx}
                        className={
                          isDifferent
                            ? "bg-red-500/10 text-red-700 dark:text-red-400"
                            : ""
                        }
                      >
                        {line || "\u00A0"}
                      </div>
                    );
                  })}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Current */}
          <Card className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Current Report</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(currentText, "current")}
                className="gap-2"
              >
                <Copy className="h-3 w-3" />
                {copied === "current" ? "Copied!" : "Copy"}
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <pre className="font-mono text-xs whitespace-pre-wrap">
                  {currentLines.map((line, idx) => {
                    const isDifferent =
                      originalLines[idx] !== line ||
                      idx >= originalLines.length;
                    const isNew = idx >= originalLines.length;

                    return (
                      <div
                        key={idx}
                        className={
                          isNew
                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                            : isDifferent
                            ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                            : ""
                        }
                      >
                        {line || "\u00A0"}
                      </div>
                    );
                  })}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <div className="mt-4 flex gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/10 border border-red-500/50"></div>
            <span>Removed/Changed in Original</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500/10 border border-yellow-500/50"></div>
            <span>Modified in Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/10 border border-green-500/50"></div>
            <span>Added in Current</span>
          </div>
        </div>
      </div>
    </div>
  );
}
