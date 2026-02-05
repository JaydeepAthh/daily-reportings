import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  callback: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlOrMeta = shortcut.ctrlKey || shortcut.metaKey;
        const matchesCtrl = ctrlOrMeta
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const matchesShift = shortcut.shiftKey
          ? event.shiftKey
          : !event.shiftKey;
        const matchesKey =
          event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (matchesCtrl && matchesShift && matchesKey) {
          // Don't prevent default for Ctrl/Cmd + S if we're in an input
          if (
            shortcut.key.toLowerCase() === "s" &&
            (event.ctrlKey || event.metaKey)
          ) {
            event.preventDefault();
          }

          shortcut.callback();
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

export function useGlobalKeyboardShortcuts(
  onGenerateReport: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to generate report
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        onGenerateReport();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onGenerateReport, enabled]);
}
