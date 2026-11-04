
export type TaskType = "ONCE" | "RECURRING";

export interface TaskV3 {
  id: string;
  parentId: string | null; // null indicates this Task IS a top-level Project!
  description: string;
  notes?: string;
  taskType: TaskType;
  countCompleted: number;
  subTaskIds: string[]; // Child tasks. This information is redundant, but it greatly eases performance concerns (at the cost of making the developer responsible for consistency) 
  coinValue: number;
  isArchived: boolean;
  hasArchivedDependants: boolean; // This information is also redundant but is maintained to improve performance.
}

export type TaskMapV3 = Record<string, TaskV3>;