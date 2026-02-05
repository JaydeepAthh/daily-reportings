"use client";

import { Clock, BarChart3, Save, FolderOpen, Download, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { formatTimeFromDecimal } from "@/lib/time-utils";

interface StatisticsSidebarProps {
  totalTime: number;
  statusCounts: Record<string, number>;
  onSaveTemplate: () => void;
  onLoadTemplate: () => void;
  autoSaveEnabled: boolean;
  onToggleAutoSave: () => void;
  templateCount: number;
  onExportTxt: () => void;
  onExportMd: () => void;
}

export function StatisticsSidebar({
  totalTime,
  statusCounts,
  onSaveTemplate,
  onLoadTemplate,
  autoSaveEnabled,
  onToggleAutoSave,
  templateCount,
  onExportTxt,
  onExportMd,
}: StatisticsSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Total Time Card */}
      <div className="rounded-card bg-card p-6 shadow-lg animate-fade-in">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Statistics
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
            <Clock className="h-7 w-7 text-blue-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-text-primary">
              {formatTimeFromDecimal(totalTime)}
            </div>
            <div className="text-sm text-text-secondary">
              Total Task Time Today
            </div>
          </div>
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="rounded-card bg-card p-6 shadow-lg animate-fade-in">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Task Breakdown
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-status-done"></div>
              <span className="text-sm text-text-secondary">Done</span>
            </div>
            <span className="text-sm font-semibold text-text-primary">
              {statusCounts.DONE || 0}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-status-progress"></div>
              <span className="text-sm text-text-secondary">In Progress</span>
            </div>
            <span className="text-sm font-semibold text-text-primary">
              {statusCounts["IN PROGRESS"] || 0}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-status-mr"></div>
              <span className="text-sm text-text-secondary">MR Raised</span>
            </div>
            <span className="text-sm font-semibold text-text-primary">
              {statusCounts["MR RAISED"] || 0}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-text-muted"></div>
              <span className="text-sm text-text-secondary">Other</span>
            </div>
            <span className="text-sm font-semibold text-text-primary">
              {(statusCounts["D&T"] || 0) +
                (statusCounts.COMPLETED || 0) +
                (statusCounts["DEV REPLIED"] || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="rounded-card bg-card p-6 shadow-lg animate-fade-in">
        <div className="mb-4 flex items-center gap-2">
          <Save className="h-4 w-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">Templates</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveTemplate}
            className="border-border hover:bg-card-dark"
          >
            <Save className="mr-2 h-3 w-3" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadTemplate}
            className="border-border hover:bg-card-dark"
          >
            <FolderOpen className="mr-2 h-3 w-3" />
            Load ({templateCount})
          </Button>
        </div>

        <Separator className="my-4 bg-border" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text-primary">Auto-save</div>
              <div className="text-xs text-text-muted">
                Persist data to browser storage
              </div>
            </div>
            <button
              onClick={onToggleAutoSave}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoSaveEnabled ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoSaveEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="rounded-card bg-card p-6 shadow-lg animate-fade-in">
        <div className="mb-4 flex items-center gap-2">
          <Download className="h-4 w-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">Export Options</h3>
        </div>

        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between hover:bg-card-dark"
            onClick={onExportTxt}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/10">
                <Download className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-sm text-text-secondary">Download .txt</span>
            </div>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between hover:bg-card-dark"
            onClick={onExportMd}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-500/10">
                <Download className="h-4 w-4 text-orange-500" />
              </div>
              <span className="text-sm text-text-secondary">Download .md</span>
            </div>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </Button>
        </div>
      </div>
    </div>
  );
}
