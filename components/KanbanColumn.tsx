import { useState } from "react";
import { Section, Task } from "@/types/report";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, FolderPlus, LayoutGrid, Package } from "lucide-react";
import { calculateSectionTotalTime } from "@/lib/report-utils";
import { calculateSectionTotal } from "@/lib/time-utils";
import { useDroppable } from "@dnd-kit/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface KanbanColumnProps {
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

function DroppableArea({
  id,
  data,
  children,
  className = "",
}: {
  id: string;
  data: Record<string, unknown>;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-md transition-colors ${isOver ? "ring-2 ring-primary bg-primary/5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function KanbanColumn({
  section,
  duplicateBugIds,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDeleteSection,
  onAddSubSection,
  onDeleteSubSection,
  onConvertToSubSections,
}: KanbanColumnProps) {
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
    <div className="flex flex-col w-[300px] shrink-0 rounded-xl border bg-muted/30 overflow-hidden">
      {/* Column Header */}
      <div className="p-3 border-b bg-card space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3
            className="font-semibold text-sm truncate flex-1"
            title={section.name}
          >
            {section.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {!section.isFixed && onDeleteSection && (
              <button
                onClick={() => onDeleteSection(section.id)}
                className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Delete section"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {taskCount} {taskCount === 1 ? "task" : "tasks"}
          </span>
          {taskCount > 0 && (
            <span className="font-mono font-semibold text-primary">
              {totalTime.toFixed(2)}h
            </span>
          )}
        </div>
      </div>

      {/* Column Body - Scrollable */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-220px)] scrollbar-thin">
        {/* Sections WITH SubSections */}
        {section.subSections &&
          section.subSections.map((subSection) => {
            const subTotal = calculateSectionTotal(subSection.tasks);
            return (
              <DroppableArea
                key={subSection.id}
                id={`droppable-${section.id}-${subSection.id}`}
                data={{
                  sectionId: section.id,
                  subSectionId: subSection.id,
                  subSectionName: subSection.name,
                }}
                className="space-y-1.5"
              >
                {/* Subsection divider */}
                <div className="flex items-center justify-between px-1 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {subSection.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {subSection.tasks.length}
                    </span>
                    {subSection.tasks.length > 0 && (
                      <span className="text-[10px] font-mono text-muted-foreground/60">
                        {subTotal.toFixed(1)}h
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => onAddTask(section.id, subSection.id)}
                      className="p-0.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      aria-label={`Add task to ${subSection.name}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    {!subSection.isFixed && onDeleteSubSection && (
                      <button
                        onClick={() =>
                          onDeleteSubSection(section.id, subSection.id)
                        }
                        className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={`Delete ${subSection.name}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Task cards in this subsection */}
                {subSection.tasks.length > 0 ? (
                  <div className="space-y-1.5">
                    {subSection.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        sectionId={section.id}
                        subSectionId={subSection.id}
                        duplicateBugIds={duplicateBugIds}
                        onUpdate={(taskId, updates) =>
                          onUpdateTask(
                            section.id,
                            taskId,
                            updates,
                            subSection.id,
                          )
                        }
                        onDelete={(taskId) =>
                          onDeleteTask(section.id, taskId, subSection.id)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-muted-foreground/20 py-3 text-center">
                    <p className="text-[10px] text-muted-foreground/50">
                      Drop tasks here
                    </p>
                  </div>
                )}
              </DroppableArea>
            );
          })}

        {/* Sections WITHOUT SubSections */}
        {section.tasks && (
          <DroppableArea
            id={`droppable-${section.id}`}
            data={{ sectionId: section.id }}
            className="space-y-1.5 min-h-[100px]"
          >
            {section.tasks.length > 0 ? (
              section.tasks.map((task) => (
                <TaskCard
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
              <div className="rounded-md border border-dashed border-muted-foreground/20 py-8 text-center">
                <Package className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground/50">No tasks yet</p>
              </div>
            )}
          </DroppableArea>
        )}
      </div>

      {/* Column Footer - Actions */}
      <div className="p-2 border-t bg-card/50 flex items-center gap-1">
        {section.subSections ? (
          <>
            {onAddSubSection && (
              <Dialog
                open={isAddSubSectionOpen}
                onOpenChange={setIsAddSubSectionOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs flex-1"
                  >
                    <FolderPlus className="h-3 w-3 mr-1" />
                    Subsection
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[360px]">
                  <DialogHeader>
                    <DialogTitle>Add Subsection</DialogTitle>
                    <DialogDescription>
                      New subsection for {section.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="kanban-subsection-name">Name</Label>
                    <Input
                      id="kanban-subsection-name"
                      placeholder="e.g., DONE, IN PROGRESS"
                      value={newSubSectionName}
                      onChange={(e) => setNewSubSectionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddSubSection();
                      }}
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddSubSectionOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddSubSection}>
                      Add
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs flex-1"
              onClick={() => onAddTask(section.id)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Task
            </Button>
            {onConvertToSubSections && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => onConvertToSubSections(section.id)}
                title="Convert to subsections"
              >
                <LayoutGrid className="h-3 w-3" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
