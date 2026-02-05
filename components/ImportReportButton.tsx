"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  parseReport,
  validateParsedReport,
  getExampleFormat,
  ParseResult,
} from "@/lib/reportParser";
import { Section } from "@/types/report";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImportReportButtonProps {
  onImport: (date: string, sections: Section[], nextPlanDate: string, nextPlanTasks: any[]) => void;
  hasExistingData: boolean;
  onSuccess?: (message: string) => void;
}

export interface ImportReportButtonRef {
  openDialog: () => void;
}

export const ImportReportButton = forwardRef<ImportReportButtonRef, ImportReportButtonProps>(
  ({ onImport, hasExistingData, onSuccess }, ref) => {
  const [open, setOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [showWarnings, setShowWarnings] = useState(false);
  const [isConfirmingOverwrite, setIsConfirmingOverwrite] = useState(false);

  // Expose openDialog method to parent via ref
  useImperativeHandle(ref, () => ({
    openDialog: () => setOpen(true),
  }));

  const handleTextChange = (text: string) => {
    setReportText(text);
    setIsConfirmingOverwrite(false);

    // Real-time validation
    if (text.trim()) {
      const result = parseReport(text);
      setParseResult(result);
    } else {
      setParseResult(null);
    }
  };

  const handleImport = () => {
    if (!parseResult) return;

    const validation = validateParsedReport(parseResult);

    if (!validation.isValid) {
      return;
    }

    // Check if we need to confirm overwrite
    if (hasExistingData && !isConfirmingOverwrite) {
      setIsConfirmingOverwrite(true);
      return;
    }

    // Perform the import
    onImport(
      parseResult.date,
      parseResult.sections,
      parseResult.nextPlanDate,
      parseResult.nextPlanTasks
    );

    // Show success message
    if (onSuccess) {
      onSuccess(
        `Successfully imported: ${parseResult.stats.sectionsCount} sections, ${parseResult.stats.tasksCount} tasks`
      );
    }

    // Reset and close
    setReportText("");
    setParseResult(null);
    setIsConfirmingOverwrite(false);
    setOpen(false);
  };

  const handleCancel = () => {
    setReportText("");
    setParseResult(null);
    setIsConfirmingOverwrite(false);
    setShowWarnings(false);
    setOpen(false);
  };

  const handleLoadExample = () => {
    const example = getExampleFormat();
    handleTextChange(example);
  };

  const validation = parseResult ? validateParsedReport(parseResult) : null;
  const canImport = validation?.isValid && parseResult;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto gap-2 font-medium"
        >
          <Upload className="h-5 w-5" />
          Import Existing Report
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import & Parse Report
          </DialogTitle>
          <DialogDescription>
            Paste your existing report text below. The parser will automatically extract dates, sections, and tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden flex flex-col">
          {/* Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Report Text</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadExample}
                className="text-xs"
              >
                Load Example
              </Button>
            </div>

            <Textarea
              value={reportText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={getExampleFormat()}
              className="font-mono text-xs min-h-[300px] resize-none"
            />
          </div>

          {/* Parse Results */}
          {parseResult && (
            <ScrollArea className="flex-1 rounded-md border p-4 space-y-3">
              {/* Success Message */}
              {validation?.isValid && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-sm">
                    <strong>✅ {validation.message}</strong>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {parseResult.stats.subsectionsCount > 0 && (
                        <span>• {parseResult.stats.subsectionsCount} subsections </span>
                      )}
                      {parseResult.nextPlanTasks.length > 0 && (
                        <span>• {parseResult.nextPlanTasks.length} next plan tasks</span>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-sm">
                    <strong>❌ {parseResult.errors.length} Critical Error(s)</strong>
                    <ul className="mt-2 space-y-1 text-xs">
                      {parseResult.errors.map((error, idx) => (
                        <li key={idx} className="font-mono">
                          {error.line > 0 && `Line ${error.line}: `}
                          {error.reason}
                          {error.text && (
                            <div className="text-muted-foreground truncate mt-1">
                              {error.text}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {parseResult.warnings.length > 0 && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-sm">
                    <div className="flex items-center justify-between">
                      <strong>⚠️ {parseResult.warnings.length} Warning(s)</strong>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowWarnings(!showWarnings)}
                        className="text-xs h-6"
                      >
                        {showWarnings ? "Hide" : "Show"}
                      </Button>
                    </div>

                    {showWarnings && (
                      <ul className="mt-2 space-y-1 text-xs max-h-40 overflow-y-auto">
                        {parseResult.warnings.map((warning, idx) => (
                          <li key={idx} className="font-mono">
                            Line {warning.line}: {warning.reason}
                            <div className="text-muted-foreground truncate mt-1">
                              {warning.text}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Overwrite Warning */}
              {hasExistingData && isConfirmingOverwrite && (
                <Alert className="border-orange-500/50 bg-orange-500/10">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <AlertDescription className="text-sm">
                    <strong>⚠️ This will replace your current report data</strong>
                    <p className="mt-1 text-xs text-muted-foreground">
                      All existing tasks and sections will be overwritten. Are you sure you want to continue?
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Info Tip */}
              {!parseResult.errors.length && !parseResult.warnings.length && validation?.isValid && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>ℹ️ Tip:</strong> After import, you can edit any fields and the app will automatically recalculate totals.
                  </AlertDescription>
                </Alert>
              )}
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!canImport}
            className={isConfirmingOverwrite ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            {isConfirmingOverwrite ? "Confirm & Replace" : "Load into Editor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ImportReportButton.displayName = "ImportReportButton";
