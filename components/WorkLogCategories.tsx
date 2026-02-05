"use client";

import { Plus, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Section } from "@/types/report";
import { ThemedSectionCard } from "./ThemedSectionCard";

interface WorkLogCategoriesProps {
  sections: Section[];
  onAddSection: (name: string, withSubSections: boolean) => void;
  onAddTask: (sectionId: string, subSectionId?: string) => void;
  onUpdateTask: (
    sectionId: string,
    taskId: string,
    updates: any,
    subSectionId?: string
  ) => void;
  onDeleteTask: (sectionId: string, taskId: string, subSectionId?: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onImport: () => void;
}

export function WorkLogCategories({
  sections,
  onAddSection,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDeleteSection,
  onImport,
}: WorkLogCategoriesProps) {
  const handleAddSection = () => {
    const name = prompt("Enter section name:");
    if (name) {
      const withSubSections = confirm("Add with subsections (DONE, MR RAISED, etc.)?");
      onAddSection(name, withSubSections);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">
          Work Log Categories
        </h2>

        <div className="flex gap-2">
          {/* Import Button */}
          <Button
            onClick={onImport}
            variant="outline"
            size="sm"
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Report
          </Button>

          {/* Add Custom Section */}
          <Button
            onClick={handleAddSection}
            size="sm"
            className="bg-primary hover:bg-primary-hover"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Custom Section
          </Button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <ThemedSectionCard
            key={section.id}
            section={section}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onDeleteSection={
              !section.isFixed ? onDeleteSection : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
