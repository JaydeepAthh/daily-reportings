export type TaskStatus =
  | "DONE"
  | "MR RAISED"
  | "IN PROGRESS"
  | "D&T"
  | "COMPLETED"
  | "DEV REPLIED";

export interface Task {
  id: string;
  link: string;
  status: TaskStatus;
  comment?: string;
  timeSpent: string; // Format: "1hr 40min" or "34min" or "2hr"
}

export interface SubSection {
  id: string;
  name: string;
  tasks: Task[];
  isFixed: boolean;
}

export interface Section {
  id: string;
  name: string;
  isFixed: boolean;
  subSections?: SubSection[];
  tasks?: Task[]; // For sections without subsections
}

export interface Report {
  date: string;
  sections: Section[];
  nextPlanDate: string;
  nextPlanTasks: Task[];
}

// Default sections configuration
export const DEFAULT_SECTIONS: Omit<Section, "id">[] = [
  {
    name: "Panel Valid Bugs",
    isFixed: true,
    subSections: [
      { id: "", name: "DONE", tasks: [], isFixed: true },
      { id: "", name: "MR RAISED", tasks: [], isFixed: true },
      { id: "", name: "IN PROGRESS", tasks: [], isFixed: true },
      { id: "", name: "D&T", tasks: [], isFixed: true },
    ],
  },
  {
    name: "Panel Invalid/Dev. Reply Bugs",
    isFixed: true,
    tasks: [],
  },
  {
    name: "Live Valid Bug",
    isFixed: true,
    tasks: [],
  },
  {
    name: "Live Invalid Bug",
    isFixed: true,
    tasks: [],
  },
  {
    name: "Internal Valid Bug",
    isFixed: true,
    tasks: [],
  },
  {
    name: "Internal Invalid Bug",
    isFixed: true,
    tasks: [],
  },
  {
    name: "Testing",
    isFixed: true,
    tasks: [],
  },
];

// Helper type for time parsing
export interface ParsedTime {
  hours: number;
  minutes: number;
}
