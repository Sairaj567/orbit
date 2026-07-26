import { lazy } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router';
import { WorkspaceLayout } from '@/components/layout/workspace-layout';
import { LoadingBoundary } from '@/components/layout/loading-boundary';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { DEFAULT_WORKSPACE_SLUG, getWorkspaceDashboardPath } from '@/lib/routes';
import { DashboardPage } from '@/pages/dashboard';
import { NotFoundPage } from '@/pages/not-found';

// Route-level code splitting
const ProjectsPage = lazy(() =>
  import('@/pages/projects').then((m) => ({ default: m.ProjectsPage })),
);
const ProjectLayout = lazy(() =>
  import('@/pages/project').then((m) => ({ default: m.ProjectLayout })),
);
const ProjectOverviewPage = lazy(() =>
  import('@/pages/project').then((m) => ({ default: m.ProjectOverviewPage })),
);
const ProjectTasksPage = lazy(() =>
  import('@/pages/project').then((m) => ({ default: m.ProjectTasksPage })),
);
const ProjectHabitsPage = lazy(() =>
  import('@/pages/project').then((m) => ({ default: m.ProjectHabitsPage })),
);
const ProjectNotesPage = lazy(() =>
  import('@/pages/project').then((m) => ({ default: m.ProjectNotesPage })),
);
const ProjectResourcesPage = lazy(() =>
  import('@/pages/project').then((m) => ({ default: m.ProjectResourcesPage })),
);
const ProjectActivityPage = lazy(() =>
  import('@/pages/project').then((m) => ({ default: m.ProjectActivityPage })),
);
const ProjectSettingsPage = lazy(() =>
  import('@/pages/project').then((m) => ({ default: m.ProjectSettingsPage })),
);

const TasksPage = lazy(() => import('@/pages/tasks').then((m) => ({ default: m.TasksPage })));
const TaskDetailPage = lazy(() =>
  import('@/pages/task-detail').then((m) => ({ default: m.TaskDetailPage })),
);
const HabitsPage = lazy(() => import('@/pages/habits').then((m) => ({ default: m.HabitsPage })));
const StudyPage = lazy(() => import('@/pages/study').then((m) => ({ default: m.StudyPage })));
const NotesPage = lazy(() => import('@/pages/notes').then((m) => ({ default: m.NotesPage })));
const CalendarPage = lazy(() =>
  import('@/pages/calendar').then((m) => ({ default: m.CalendarPage })),
);
const AnalyticsPage = lazy(() =>
  import('@/pages/analytics').then((m) => ({ default: m.AnalyticsPage })),
);
const ActivityPage = lazy(() =>
  import('@/pages/activity').then((m) => ({ default: m.ActivityPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/settings').then((m) => ({ default: m.SettingsPage })),
);
const WorkspaceSettingsPage = lazy(() =>
  import('@/pages/workspace-settings').then((m) => ({ default: m.WorkspaceSettingsPage })),
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={getWorkspaceDashboardPath(DEFAULT_WORKSPACE_SLUG)} replace />}
        />
        <Route
          path="/w/:workspaceSlug/*"
          element={
            <ProtectedLayout>
              <WorkspaceLayout>
                <LoadingBoundary>
                  <Outlet />
                </LoadingBoundary>
              </WorkspaceLayout>
            </ProtectedLayout>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />

          {/* Project Hub Nested Routes */}
          <Route path="projects/:projectId" element={<ProjectLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<ProjectOverviewPage />} />
            <Route path="tasks" element={<ProjectTasksPage />} />
            <Route path="habits" element={<ProjectHabitsPage />} />
            <Route path="notes" element={<ProjectNotesPage />} />
            <Route path="resources" element={<ProjectResourcesPage />} />
            <Route path="activity" element={<ProjectActivityPage />} />
            <Route path="settings" element={<ProjectSettingsPage />} />
          </Route>

          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:taskId" element={<TaskDetailPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="study" element={<StudyPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="workspace-settings" element={<WorkspaceSettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
