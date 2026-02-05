import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, PlusCircle } from "lucide-react";

interface AddSectionButtonProps {
  onAddSection: (name: string, withSubSections: boolean) => void;
}

export function AddSectionButton({ onAddSection }: AddSectionButtonProps) {
  const [open, setOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [withSubSections, setWithSubSections] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (sectionName.trim()) {
      onAddSection(sectionName.trim(), withSubSections);
      setSectionName("");
      setWithSubSections(false);
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setSectionName("");
    setWithSubSections(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild> 
        <Button className="w-fit bg-transparent hover:bg-transparent hover:cursor-pointer text-primary" size="lg">
          <PlusCircle className="h-5 w-5 " />
          Add Custom Section
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Custom Section</DialogTitle>
            <DialogDescription>
              Create a new section to organize your tasks. You can add it with or
              without subsections.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section-name">Section Name</Label>
              <Input
                id="section-name"
                placeholder="e.g., API Development"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="with-subsections"
                checked={withSubSections}
                onChange={(e) => setWithSubSections(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="with-subsections" className="cursor-pointer">
                Include subsections (DONE, MR RAISED, IN PROGRESS, D&T)
              </Label>
            </div>

            {withSubSections && (
              <p className="text-xs text-muted-foreground">
                The section will include 4 subsections: DONE, MR RAISED, IN PROGRESS,
                and D&T for better task organization.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!sectionName.trim()}>
              Add Section
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
