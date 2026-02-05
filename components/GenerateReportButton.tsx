import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Report } from "@/types/report";
import { generateFormattedReport, copyToClipboard } from "@/lib/report-formatter";
import { Check, Copy } from "lucide-react";

interface GenerateReportButtonProps {
  report: Report;
  onGenerate?: (formattedReport: string) => void;
}

export function GenerateReportButton({
  report,
  onGenerate,
}: GenerateReportButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Generate the report
    const formattedReport = generateFormattedReport(report);

    // Call optional callback
    if (onGenerate) {
      onGenerate(formattedReport);
    }

    // Copy to clipboard
    const success = await copyToClipboard(formattedReport);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    setIsGenerating(false);
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      className="w-full"
      size="lg"
    >
      {copied ? (
        <>
          <Check className="h-5 w-5 mr-2" />
          Copied to Clipboard!
        </>
      ) : (
        <>
          <Copy className="h-5 w-5 mr-2" />
          Generate & Copy Report
        </>
      )}
    </Button>
  );
}
