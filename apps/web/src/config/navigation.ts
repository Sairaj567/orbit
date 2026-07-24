import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  CalendarDays,
  ChartNoAxesCombined,
  CircleCheckBig,
  LayoutDashboard,
  NotebookPen,
  Settings2,
  SquareKanban,
  TimerReset,
  Trophy,
  Users,
  FolderOpenDot,
} from 'lucide-react';
import type { WorkspaceRole } from '@orbit/shared';

export type NavigationSection = 'main' | 'secondary' | 'footer';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  section: NavigationSection;
  order: number;
  shortcut?: { keys: string[] };
  badge?: () => number | undefined;
  requiredRole?: WorkspaceRole;
  children?: NavItem[];
  isExternal?: boolean;
}

export interface WorkspaceOption {
  id: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
  members: number;
  status: string;
  accent: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ShellMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  tone: 'positive' | 'neutral' | 'warning';
  icon: LucideIcon;
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  detail: string;
  time: string;
  tone: 'positive' | 'neutral' | 'warning';
}

export const WORKSPACES: WorkspaceOption[] = [
  {
    id: 'home',
    name: 'Orbit Home',
    slug: 'home',
    role: 'OWNER',
    members: 6,
    status: 'Active',
    accent: 'from-violet-500/30 via-violet-500/10 to-transparent',
  },
  {
    id: 'studio',
    name: 'Studio Sprint',
    slug: 'studio-sprint',
    role: 'ADMIN',
    members: 14,
    status: 'Focus week',
    accent: 'from-cyan-500/30 via-cyan-500/10 to-transparent',
  },
  {
    id: 'research',
    name: 'Research Lab',
    slug: 'research-lab',
    role: 'MEMBER',
    members: 9,
    status: 'Planning',
    accent: 'from-emerald-500/30 via-emerald-500/10 to-transparent',
  },
];

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: 'dashboard',
    section: 'main',
    order: 1,
    shortcut: { keys: ['g', 'd'] },
    badge: () => 1,
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpenDot,
    path: 'projects',
    section: 'main',
    order: 2,
    shortcut: { keys: ['g', 'p'] },
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: SquareKanban,
    path: 'tasks',
    section: 'main',
    order: 3,
    shortcut: { keys: ['g', 't'] },
    badge: () => 12,
  },
  {
    id: 'study',
    label: 'Study',
    icon: TimerReset,
    path: 'study',
    section: 'main',
    order: 4,
    shortcut: { keys: ['g', 's'] },
  },
  {
    id: 'habits',
    label: 'Habits',
    icon: CircleCheckBig,
    path: 'habits',
    section: 'main',
    order: 5,
    badge: () => 4,
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: NotebookPen,
    path: 'notes',
    section: 'secondary',
    order: 1,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: CalendarDays,
    path: 'calendar',
    section: 'secondary',
    order: 2,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: ChartNoAxesCombined,
    path: 'analytics',
    section: 'secondary',
    order: 3,
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: Activity,
    path: 'activity',
    section: 'secondary',
    order: 4,
  },
  {
    id: 'trophies',
    label: 'Achievements',
    icon: Trophy,
    path: 'achievements',
    section: 'secondary',
    order: 5,
    badge: () => 2,
  },
  {
    id: 'workspace-settings',
    label: 'Workspace Settings',
    icon: Users,
    path: 'workspace-settings',
    section: 'footer',
    order: 1,
    requiredRole: 'ADMIN',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings2,
    path: 'settings',
    section: 'footer',
    order: 2,
  },
];

export const SHELL_METRICS: ShellMetric[] = [
  {
    id: 'focus-time',
    label: 'Focus time',
    value: '4h 12m',
    change: '+18% this week',
    tone: 'positive',
    icon: TimerReset,
  },
  {
    id: 'open-tasks',
    label: 'Open tasks',
    value: '18',
    change: '5 due today',
    tone: 'warning',
    icon: SquareKanban,
  },
  {
    id: 'streak',
    label: 'Current streak',
    value: '12 days',
    change: '3 habits completed',
    tone: 'positive',
    icon: CircleCheckBig,
  },
  {
    id: 'team-activity',
    label: 'Team activity',
    value: '24 updates',
    change: '7 members online',
    tone: 'neutral',
    icon: Users,
  },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: 'activity-1',
    actor: 'Saira',
    action: 'completed',
    detail: 'Refactor Prisma schema',
    time: '10m ago',
    tone: 'positive',
  },
  {
    id: 'activity-2',
    actor: 'Liam',
    action: 'updated',
    detail: 'AWS study plan due date',
    time: '24m ago',
    tone: 'neutral',
  },
  {
    id: 'activity-3',
    actor: 'Maya',
    action: 'added',
    detail: 'three new notes to Research Lab',
    time: '1h ago',
    tone: 'warning',
  },
];

export const QUICK_ACTIONS = [
  {
    id: 'quick-task',
    label: 'New task',
    description: 'Capture a task and assign priority',
    path: 'tasks',
  },
  {
    id: 'quick-note',
    label: 'New note',
    description: 'Open a clean workspace for writing',
    path: 'notes',
  },
  {
    id: 'quick-study',
    label: 'Start study session',
    description: 'Jump into a focused timer view',
    path: 'study',
  },
] as const;

export const COMMAND_SHORTCUTS = [
  { id: 'search', label: 'Search everywhere', keys: ['Ctrl', 'K'] },
  { id: 'dashboard', label: 'Go to dashboard', keys: ['G', 'D'] },
  { id: 'tasks', label: 'Open tasks', keys: ['G', 'T'] },
  { id: 'settings', label: 'Workspace settings', keys: ['G', 'S'] },
] as const;