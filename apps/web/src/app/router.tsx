import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router';
import { WorkspaceLayout } from '@/components/layout/workspace-layout';
import { LoadingBoundary } from '@/components/layout/loading-boundary';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { DEFAULT_WORKSPACE_SLUG, getWorkspaceDashboardPath } from '@/lib/routes';
import {
  AchievementsPage,
  ActivityPage,
  AnalyticsPage,
  CalendarPage,
  DashboardPage,
  HabitsPage,
  NotFoundPage,
  NotesPage,
  ProjectLayout,
  ProjectOverviewPage,
  ProjectTasksPage,
  ProjectNotesPage,
  ProjectHabitsPage,
  ProjectResourcesPage,
  ProjectActivityPage,
  ProjectSettingsPage,
  ProjectsPage,
  SettingsPage,
  StudyPage,
  TaskDetailPage,
  TasksPage,
  WorkspaceSettingsPage,
} from '@/pages';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={getWorkspaceDashboardPath(DEFAULT_WORKSPACE_SLUG)} replace />} />
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
          <Route path="achievements" element={<AchievementsPage />} />
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
