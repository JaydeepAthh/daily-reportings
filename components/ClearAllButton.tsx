import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, AlertTriangle } from "lucide-react";

interface ClearAllButtonProps {
  onClearAll: () => void;
}

export function ClearAllButton({ onClearAll }: ClearAllButtonProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onClearAll();
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
        className="w-full"
        aria-label="Clear all tasks"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Clear All Tasks
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <DialogTitle>Clear All Tasks?</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              This will remove all tasks from all sections. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
