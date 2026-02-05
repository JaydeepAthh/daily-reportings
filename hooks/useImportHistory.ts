import { useState, useCallback } from "react";
import { Report } from "@/types/report";

export interface ImportHistoryEntry {
  report: Report;
  timestamp: number;
  originalText: string;
}

export function useImportHistory() {
  const [lastImport, setLastImport] = useState<ImportHistoryEntry | null>(null);

  const saveImport = useCallback((report: Report, originalText: string) => {
    setLastImport({
      report,
      timestamp: Date.now(),
      originalText,
    });
  }, []);

  const clearHistory = useCallback(() => {
    setLastImport(null);
  }, []);

  const hasHistory = lastImport !== null;

  const getTimeSinceImport = useCallback(() => {
    if (!lastImport) return "";

    const seconds = Math.floor((Date.now() - lastImport.timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }, [lastImport]);

  return {
    lastImport,
    saveImport,
    clearHistory,
    hasHistory,
    getTimeSinceImport,
  };
}
