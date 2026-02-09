import { Label } from "@/components/ui/label";

interface StorageToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function StorageToggle({ enabled, onToggle }: StorageToggleProps) {
  return (
    <Label
      htmlFor="storage-toggle"
      className="relative inline-flex items-center cursor-pointer gap-1.5 select-none"
      title={enabled ? "Auto-save on" : "Auto-save off"}
    >
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
        {enabled ? "Saved" : "Unsaved"}
      </span>
      <input
        type="checkbox"
        id="storage-toggle"
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        className="sr-only peer"
        aria-label="Toggle auto-save"
      />
      <div className="w-7 h-4 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[3px] after:right-[14px] peer-checked:after:translate-x-[12px] after:bg-white after:rounded-full after:h-2.5 after:w-2.5 after:transition-all" />
    </Label>
  );
}
