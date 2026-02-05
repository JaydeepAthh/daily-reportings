import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Report } from "@/types/report";
import { generateFormattedReport, copyToClipboard } from "@/lib/report-formatter";
import { Copy, Check, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ReportPreviewProps {
  report: Report;
}

export function ReportPreview({ report }: ReportPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedReport = generateFormattedReport(report);

  const handleCopy = async () => {
    const success = await copyToClipboard(formattedReport);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="mt-6 py-4">
      <CardHeader className="gap-0 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Report Preview
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Preview Area */}
          <div className="rounded-lg border bg-muted p-4 max-h-[500px] overflow-y-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap break-words">
              {formattedReport}
            </pre>
          </div>

          <Separator />

          {/* Copy Button */}
          <Button onClick={handleCopy} className="w-full" variant="default">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Report
              </>
            )}
          </Button>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Report format matches the standard output format with all sections and
            totals
          </p>
        </CardContent>
      )}
    </Card>
  );
}
