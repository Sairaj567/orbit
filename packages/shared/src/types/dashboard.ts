import type { Task } from './task.js';
import type { HabitDTO } from './habit.js';
import type { StudyBlockDTO } from './study-block.js';
import type { Activity } from './activity.js';
import type { Project } from './project.js';

export interface ProjectSummary extends Project {
  taskCompletionRate: number;
  memberCount: number;
}

export interface DashboardResponse {
  today: {
    tasks: Task[];
    overdueTasks: Task[];
    habits: HabitDTO[];
    activeStudyBlock: StudyBlockDTO | null;
  };
  stats: {
    tasksCompletedToday: number;
    focusTimeToday: number;
    habitCompletionPercent: number;
    currentStreak: number;
    weeklyProductivityScore: number;
    weeklyFocusHours: number;
  };
  projects: ProjectSummary[];
  activity: Activity[];
}
