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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/types/report";
import { Save, FolderOpen, Trash2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  sections: Section[];
  createdAt: string;
}

interface TemplateManagerProps {
  currentSections: Section[];
  onLoadTemplate: (sections: Section[]) => void;
}

export function TemplateManager({
  currentSections,
  onLoadTemplate,
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = window.localStorage.getItem("report-templates");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const saveTemplate = () => {
    if (!templateName.trim()) return;

    const newTemplate: Template = {
      id: crypto.randomUUID(),
      name: templateName.trim(),
      sections: currentSections,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);

    try {
      window.localStorage.setItem(
        "report-templates",
        JSON.stringify(updatedTemplates),
      );
    } catch (error) {
      console.error("Error saving template:", error);
    }

    setTemplateName("");
    setSaveDialogOpen(false);
  };

  const loadTemplate = (template: Template) => {
    onLoadTemplate(template.sections);
    setLoadDialogOpen(false);
  };

  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter((t) => t.id !== templateId);
    setTemplates(updatedTemplates);

    try {
      window.localStorage.setItem(
        "report-templates",
        JSON.stringify(updatedTemplates),
      );
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSaveDialogOpen(true)}
        aria-label="Save template"
        className="h-8 px-2"
        title="Save template"
      >
        <Save className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLoadDialogOpen(true)}
        disabled={templates.length === 0}
        aria-label="Load template"
        className="h-8 px-2"
        title={`Load template (${templates.length})`}
      >
        <FolderOpen className="h-3.5 w-3.5" />
      </Button>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
            <DialogDescription>
              Save your current section configuration as a reusable template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., Weekly Sprint Report"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveTemplate()}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This will save your current sections and their structure (tasks
              will not be saved)
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTemplate} disabled={!templateName.trim()}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Template</DialogTitle>
            <DialogDescription>
              Choose a template to load its section configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
            {templates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No templates saved yet
              </p>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {template.sections.length} sections •{" "}
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Button
                      size="sm"
                      onClick={() => loadTemplate(template)}
                      aria-label={`Load template ${template.name}`}
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTemplate(template.id)}
                      aria-label={`Delete template ${template.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
