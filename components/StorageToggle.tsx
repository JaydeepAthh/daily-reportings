import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Database } from "lucide-react";

interface StorageToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function StorageToggle({ enabled, onToggle }: StorageToggleProps) {
  return (
    <div className="px-2">
      <div className="flex items-center gap-3">
        <div className="flex-grow">
          <h4 className="text-sm font-bold text-slate-200">Auto-save</h4>
          <p className="text-[10px] text-slate-500">Persist data to browser storage</p>
        </div>
        <Label htmlFor="storage-toggle" className="relative inline-flex items-center cursor-pointer">
          {/* {enabled ? "Auto-save enabled" : "Auto-save disabled"} */}
          <input
            type="checkbox"
            id="storage-toggle"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
            aria-label="Enable data persistence"
          />
          <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
        </Label>
      </div>
    </div>
  );
}
