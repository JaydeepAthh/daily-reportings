"use client";

import { FileText, Settings } from "lucide-react";
import { Button } from "./ui/button";

export function ThemedHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Daily Report Generator
              </h1>
              <p className="text-sm text-text-secondary">
                Track tasks and generate professional reports
              </p>
            </div>
          </div>

          {/* Shortcut Badge and Settings */}
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:flex">
              <span className="text-xs font-semibold text-text-muted">
                SHORTCUT
              </span>
              <kbd className="rounded bg-background px-2 py-1 text-xs font-mono text-text-primary">
                Ctrl + S
              </kbd>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg hover:bg-card"
            >
              <Settings className="h-5 w-5 text-text-secondary" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
