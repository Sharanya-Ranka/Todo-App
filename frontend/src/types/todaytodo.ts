// types.ts (additions)
export interface ScheduleBlock {
  id: string;
  timeBegin: string; // "09:00" (HH:mm 24-hr format)
  timeEnd: string;   // "10:30"
  taskIds: string[];
}

export interface TodaySchedule {
  date: string; // "YYYY-MM-DD"
  blocks: ScheduleBlock[];
}

