"use client";

import { FileText, Trash2, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface ThemedBottomActionsProps {
  onGenerate: () => void;
  onClearAll: () => void;
  isGenerating?: boolean;
}

export function ThemedBottomActions({
  onGenerate,
  onClearAll,
  isGenerating = false,
}: ThemedBottomActionsProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    // Theme toggle logic can be added here
  };

  return (
    <div className="space-y-4">
      {/* Main Actions */}
      <div className="flex gap-4">
        {/* Generate & Copy Button */}
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex-1 h-14 bg-primary hover:bg-primary-hover text-white text-base font-semibold shadow-lg"
        >
          <FileText className="mr-2 h-5 w-5" />
          {isGenerating ? "Generating..." : "Generate & Copy Report"}
        </Button>

        {/* Clear All Button */}
        <Button
          onClick={onClearAll}
          variant="outline"
          className="h-14 px-8 border-danger text-danger hover:bg-danger/10"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Clear All
        </Button>
      </div>

      {/* Theme Toggle (Floating) */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-lg border border-border hover:bg-card-dark transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-primary" />
        ) : (
          <Moon className="h-5 w-5 text-primary" />
        )}
      </button>
    </div>
  );
}
