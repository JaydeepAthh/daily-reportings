import { useState } from "react";
import { Section, Task } from "@/types/report";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubSectionCard } from "./SubSectionCard";
import { TaskRow } from "./TaskRow";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  FolderPlus,
  LayoutGrid,
} from "lucide-react";
import { calculateSectionTotalTime } from "@/lib/report-utils";
import { Separator } from "@/components/ui/separator";
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
import { useDroppable } from "@dnd-kit/core";

interface SectionCardProps {
  section: Section;
  duplicateBugIds?: Set<string>;
  onAddTask: (sectionId: string, subSectionId?: string) => void;
  onUpdateTask: (
    sectionId: string,
    taskId: string,
    updates: Partial<Task>,
    subSectionId?: string,
  ) => void;
  onDeleteTask: (
    sectionId: string,
    taskId: string,
    subSectionId?: string,
  ) => void;
  onDeleteSection?: (sectionId: string) => void;
  onAddSubSection?: (sectionId: string, subSectionName: string) => void;
  onDeleteSubSection?: (sectionId: string, subSectionId: string) => void;
  onConvertToSubSections?: (sectionId: string) => void;
}

function DroppableTaskArea({
  sectionId,
  children,
}: {
  sectionId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${sectionId}`,
    data: { sectionId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-2 rounded-lg p-1 transition-colors ${isOver ? "ring-2 ring-primary bg-primary/5" : ""}`}
    >
      {children}
    </div>
  );
}

export function SectionCard({
  section,
  duplicateBugIds,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDeleteSection,
  onAddSubSection,
  onDeleteSubSection,
  onConvertToSubSections,
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddSubSectionOpen, setIsAddSubSectionOpen] = useState(false);
  const [newSubSectionName, setNewSubSectionName] = useState("");

  const totalTime = calculateSectionTotalTime(section);
  const taskCount = section.subSections
    ? section.subSections.reduce((acc, sub) => acc + sub.tasks.length, 0)
    : section.tasks?.length || 0;

  const handleAddSubSection = () => {
    if (newSubSectionName.trim() && onAddSubSection) {
      onAddSubSection(section.id, newSubSectionName.trim());
      setNewSubSectionName("");
      setIsAddSubSectionOpen(false);
    }
  };

  return (
    <Card className="py-4 ">
      <CardHeader className="px-4 gap-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{section.name}</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {taskCount} {taskCount === 1 ? "task" : "tasks"}
                </span>
                {taskCount > 0 && (
                  <span className="text-xs font-mono text-primary font-semibold">
                    Total: {totalTime.toFixed(2)}h
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {section.subSections && onAddSubSection && (
              <Dialog
                open={isAddSubSectionOpen}
                onOpenChange={setIsAddSubSectionOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FolderPlus className="h-4 w-4 mr-1" />
                    Add Subsection
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subsection</DialogTitle>
                    <DialogDescription>
                      Create a new subsection for {section.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="subsection-name">Subsection Name</Label>
                      <Input
                        id="subsection-name"
                        placeholder="e.g., DONE, IN PROGRESS"
                        value={newSubSectionName}
                        onChange={(e) => setNewSubSectionName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddSubSection();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddSubSectionOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddSubSection}>
                      Add Subsection
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {!section.subSections && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddTask(section.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
                {onConvertToSubSections && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onConvertToSubSections(section.id)}
                    title="Convert to subsections"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
            {!section.isFixed && onDeleteSection && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteSection(section.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <>
          <Separator className="mb-4" />
          <CardContent className="pt-0">
            {/* Section with Subsections */}
            {section.subSections && (
              <div className="space-y-4">
                {section.subSections.map((subSection) => (
                  <SubSectionCard
                    key={subSection.id}
                    subSection={subSection}
                    sectionId={section.id}
                    duplicateBugIds={duplicateBugIds}
                    onAddTask={(subSectionId) =>
                      onAddTask(section.id, subSectionId)
                    }
                    onUpdateTask={(subSectionId, taskId, updates) =>
                      onUpdateTask(section.id, taskId, updates, subSectionId)
                    }
                    onDeleteTask={(subSectionId, taskId) =>
                      onDeleteTask(section.id, taskId, subSectionId)
                    }
                    onDeleteSubSection={
                      !subSection.isFixed && onDeleteSubSection
                        ? () => onDeleteSubSection(section.id, subSection.id)
                        : undefined
                    }
                  />
                ))}
              </div>
            )}

            {/* Section without Subsections */}
            {section.tasks && (
              <DroppableTaskArea sectionId={section.id}>
                {section.tasks.length > 0 ? (
                  section.tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      sectionId={section.id}
                      duplicateBugIds={duplicateBugIds}
                      onUpdate={(taskId, updates) =>
                        onUpdateTask(section.id, taskId, updates)
                      }
                      onDelete={(taskId) => onDeleteTask(section.id, taskId)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No tasks yet. Click &quot;Add Task&quot; to get started.
                  </p>
                )}
              </DroppableTaskArea>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
