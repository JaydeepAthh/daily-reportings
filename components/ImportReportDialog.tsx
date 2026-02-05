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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  Settings,
  Eye,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  parseReport,
  validateParsedReport,
  getExampleFormat,
  getSampleReport,
  ParseResult,
  ParseOptions,
  DateFormat,
} from "@/lib/reportParser";
import { Section } from "@/types/report";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImportReportDialogProps {
  onImport: (date: string, sections: Section[], nextPlanDate: string, nextPlanTasks: any[], originalText?: string) => void;
  hasExistingData: boolean;
  onSuccess?: (message: string) => void;
}

export interface ImportReportDialogRef {
  openDialog: () => void;
}

type ImportStep = "paste" | "preview" | "confirm";

export const ImportReportDialog = forwardRef<ImportReportDialogRef, ImportReportDialogProps>(
  ({ onImport, hasExistingData, onSuccess }, ref) => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<ImportStep>("paste");
    const [reportText, setReportText] = useState("");
    const [parseResult, setParseResult] = useState<ParseResult | null>(null);
    const [showWarnings, setShowWarnings] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    // Parse options
    const [dateFormat, setDateFormat] = useState<DateFormat>("DD-MM-YYYY");
    const [autoFixFormatting, setAutoFixFormatting] = useState(true);
    const [skipEmptySections, setSkipEmptySections] = useState(false);
    const [preserveSectionOrder, setPreserveSectionOrder] = useState(true);

    // Expose openDialog method
    useImperativeHandle(ref, () => ({
      openDialog: () => {
        setOpen(true);
        setStep("paste");
      },
    }));

    const handleTextChange = (text: string) => {
      setReportText(text);

      // Real-time validation
      if (text.trim()) {
        const options: ParseOptions = {
          dateFormat,
          autoFixFormatting,
          skipEmptySections,
          preserveSectionOrder,
        };
        const result = parseReport(text, options);
        setParseResult(result);
      } else {
        setParseResult(null);
      }
    };

    const handleNextStep = () => {
      if (step === "paste" && parseResult) {
        const validation = validateParsedReport(parseResult);
        if (validation.isValid) {
          setStep("preview");
        }
      } else if (step === "preview") {
        if (hasExistingData) {
          setStep("confirm");
        } else {
          handleImport();
        }
      }
    };

    const handleImport = () => {
      if (!parseResult) return;

      onImport(
        parseResult.date,
        parseResult.sections,
        parseResult.nextPlanDate,
        parseResult.nextPlanTasks,
        reportText // Pass original text for history
      );

      if (onSuccess) {
        const stats = parseResult.stats;
        let message = `Successfully imported: ${stats.sectionsCount} sections, ${stats.tasksCount} tasks`;

        if (stats.platformsDetected.length > 0) {
          message += ` (${stats.platformsDetected.join(", ")})`;
        }

        onSuccess(message);
      }

      handleReset();
    };

    const handleReset = () => {
      setReportText("");
      setParseResult(null);
      setStep("paste");
      setShowWarnings(false);
      setShowOptions(false);
      setOpen(false);
    };

    const handleLoadExample = () => {
      handleTextChange(getExampleFormat());
    };

    const handleLoadSample = () => {
      handleTextChange(getSampleReport());
    };

    const validation = parseResult ? validateParsedReport(parseResult) : null;
    const canProceed = validation?.isValid && parseResult;

    // Syntax highlighting for textarea
    const getHighlightedText = () => {
      if (!parseResult?.lineHighlights) return null;

      const lines = reportText.split("\n");
      return lines.map((line, idx) => {
        const highlight = parseResult.lineHighlights?.find(h => h.line === idx + 1);
        const colorClass = highlight
          ? highlight.type === "date"
            ? "text-blue-600 dark:text-blue-400"
            : highlight.type === "section"
            ? "text-green-600 dark:text-green-400"
            : highlight.type === "subsection"
            ? "text-purple-600 dark:text-purple-400"
            : highlight.type === "task"
            ? "text-yellow-600 dark:text-yellow-400"
            : highlight.type === "error"
            ? "text-red-600 dark:text-red-400"
            : "text-muted-foreground"
          : "text-foreground";

        return (
          <div key={idx} className={`font-mono text-xs ${colorClass}`}>
            {line || "\u00A0"}
          </div>
        );
      });
    };

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

        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Import Report
              {step === "paste" && " - Step 1: Paste Text"}
              {step === "preview" && " - Step 2: Review & Confirm"}
              {step === "confirm" && " - Step 3: Confirm Overwrite"}
            </DialogTitle>
            <DialogDescription>
              {step === "paste" && "Paste your report text and we'll parse it automatically"}
              {step === "preview" && "Review the parsed data before importing"}
              {step === "confirm" && "Warning: This will replace your existing data"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-hidden flex flex-col">
            {/* Step 1: Paste & Configure */}
            {step === "paste" && (
              <>
                {/* Options Toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Report Text</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOptions(!showOptions)}
                      className="text-xs gap-1"
                    >
                      <Settings className="h-3 w-3" />
                      {showOptions ? "Hide Options" : "Show Options"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadExample}
                      className="text-xs gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      Example
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadSample}
                      className="text-xs gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      Sample
                    </Button>
                  </div>
                </div>

                {/* Import Options */}
                {showOptions && (
                  <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date-format" className="text-xs">Date Format</Label>
                        <Select
                          value={dateFormat}
                          onValueChange={(v) => setDateFormat(v as DateFormat)}
                        >
                          <SelectTrigger id="date-format" className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                            <SelectItem value="MM-DD-YYYY">MM-DD-YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoFixFormatting}
                          onChange={(e) => setAutoFixFormatting(e.target.checked)}
                          className="rounded"
                        />
                        <span>Auto-fix common formatting issues</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={skipEmptySections}
                          onChange={(e) => setSkipEmptySections(e.target.checked)}
                          className="rounded"
                        />
                        <span>Skip empty sections</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preserveSectionOrder}
                          onChange={(e) => setPreserveSectionOrder(e.target.checked)}
                          className="rounded"
                        />
                        <span>Preserve section order from report</span>
                      </label>
                    </div>
                  </div>
                )}

                <Textarea
                  value={reportText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={getExampleFormat()}
                  className="font-mono text-xs min-h-[350px] resize-none"
                />

                {/* Parse Results */}
                {parseResult && (
                  <ScrollArea className="flex-1 rounded-md border p-4 space-y-3 max-h-48">
                    <ParseResultDisplay
                      result={parseResult}
                      validation={validation}
                      showWarnings={showWarnings}
                      onToggleWarnings={() => setShowWarnings(!showWarnings)}
                    />
                  </ScrollArea>
                )}
              </>
            )}

            {/* Step 2: Preview */}
            {step === "preview" && parseResult && (
              <ScrollArea className="flex-1 rounded-md border p-4">
                <PreviewDisplay result={parseResult} />
              </ScrollArea>
            )}

            {/* Step 3: Confirm Overwrite */}
            {step === "confirm" && (
              <Alert className="border-orange-500/50 bg-orange-500/10">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-sm">
                  <strong>⚠️ This will replace your current report data</strong>
                  <p className="mt-2 text-xs text-muted-foreground">
                    All existing tasks and sections will be overwritten. This action cannot be undone.
                    Are you sure you want to continue?
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>

            {step === "paste" && (
              <Button
                onClick={handleNextStep}
                disabled={!canProceed}
                className="gap-2"
              >
                Preview
                <Eye className="h-4 w-4" />
              </Button>
            )}

            {step === "preview" && (
              <Button
                onClick={handleNextStep}
                className="gap-2"
              >
                {hasExistingData ? "Next" : "Import"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            {step === "confirm" && (
              <Button
                onClick={handleImport}
                className="bg-orange-500 hover:bg-orange-600 gap-2"
              >
                Confirm & Replace
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

ImportReportDialog.displayName = "ImportReportDialog";

// Parse Result Display Component
function ParseResultDisplay({
  result,
  validation,
  showWarnings,
  onToggleWarnings,
}: {
  result: ParseResult;
  validation: any;
  showWarnings: boolean;
  onToggleWarnings: () => void;
}) {
  return (
    <div className="space-y-3">
      {/* Success */}
      {validation?.isValid && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm">
            <strong>✅ {validation.message}</strong>
            <div className="mt-2 text-xs space-y-1">
              {result.stats.subsectionsCount > 0 && (
                <div>• {result.stats.subsectionsCount} subsections</div>
              )}
              {result.nextPlanTasks.length > 0 && (
                <div>• {result.nextPlanTasks.length} next plan tasks</div>
              )}
              {result.stats.platformsDetected.length > 0 && (
                <div>• Platforms: {result.stats.platformsDetected.join(", ")}</div>
              )}
              {result.stats.customStatusCount > 0 && (
                <div className="text-yellow-600">• {result.stats.customStatusCount} custom statuses detected</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Errors */}
      {result.errors.length > 0 && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-sm">
            <strong>❌ {result.errors.length} Critical Error(s)</strong>
            <ul className="mt-2 space-y-1 text-xs">
              {result.errors.map((error, idx) => (
                <li key={idx} className="font-mono">
                  {error.line > 0 && `Line ${error.line}: `}
                  {error.reason}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-sm">
            <div className="flex items-center justify-between">
              <strong>⚠️ {result.warnings.length} Warning(s)</strong>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleWarnings}
                className="text-xs h-6"
              >
                {showWarnings ? "Hide" : "Show"}
              </Button>
            </div>

            {showWarnings && (
              <ul className="mt-2 space-y-1 text-xs max-h-40 overflow-y-auto">
                {result.warnings.map((warning, idx) => (
                  <li key={idx} className="font-mono">
                    {warning.line > 0 && `Line ${warning.line}: `}
                    {warning.reason}
                  </li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Preview Display Component
function PreviewDisplay({ result }: { result: ParseResult }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-2">Report Date</h3>
        <p className="text-sm text-muted-foreground">{result.date}</p>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-sm mb-2">Sections ({result.sections.length})</h3>
        <div className="space-y-2">
          {result.sections.map((section, idx) => (
            <div key={idx} className="text-sm border rounded p-2">
              <div className="font-medium">{section.name}</div>
              {section.subSections && (
                <div className="ml-4 mt-1 text-xs text-muted-foreground">
                  {section.subSections.map((sub, subIdx) => (
                    <div key={subIdx}>
                      • {sub.name}: {sub.tasks.length} tasks
                    </div>
                  ))}
                </div>
              )}
              {section.tasks && (
                <div className="ml-4 mt-1 text-xs text-muted-foreground">
                  {section.tasks.length} tasks
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {result.nextPlanTasks.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold text-sm mb-2">
              Next Plan ({result.nextPlanDate})
            </h3>
            <p className="text-sm text-muted-foreground">
              {result.nextPlanTasks.length} tasks
            </p>
          </div>
        </>
      )}
    </div>
  );
}
