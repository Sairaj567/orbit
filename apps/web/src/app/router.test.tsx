import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceLayout } from '@/components/layout/workspace-layout';
import { LoadingBoundary } from '@/components/layout/loading-boundary';
import { useWorkspaceStore } from '@/stores/workspace.store';
import * as workspaceHooks from '@/features/workspaces/hooks/use-workspaces';
import * as dashboardHooks from '@/features/dashboard/hooks/use-dashboard';
import * as notesHooks from '@/features/notes/hooks/use-notes';
import * as projectsHooks from '@/features/projects/hooks/use-projects';

// Mock auth hooks (both Clerk and local seam so all components inherit auth context)
const mockAuthObject = {
  getToken: vi.fn().mockResolvedValue('test_token'),
  isSignedIn: true,
  isLoaded: true,
  userId: 'user_demo_saira',
};
const mockUserObject = {
  isLoaded: true,
  isSignedIn: true,
  user: { fullName: 'Saira', primaryEmailAddress: { emailAddress: 'saira@test.com' } },
};

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => mockAuthObject,
  useUser: () => mockUserObject,
}));

vi.mock('@/lib/auth-hooks', () => ({
  useAuth: () => mockAuthObject,
  useUser: () => mockUserObject,
}));

// Mock realtime sync hook
vi.mock('@/hooks/use-realtime-sync', () => ({
  useRealtimeSync: () => {},
}));

// Mock active study widget
vi.mock('@/features/study-blocks/components', () => ({
  ActiveStudyWidget: () => null,
}));

// Mock command palette (correct component import path)
vi.mock('@/components/command-palette', () => ({
  CommandPalette: () => null,
}));

import type * as RechartsModule from 'recharts';

// Mock Recharts responsive container to render in test environment
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof RechartsModule>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  };
});

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

const mockWorkspace = {
  id: 'workspace_demo_orbit',
  name: 'Orbit Demo',
  slug: 'orbit-seed-demo',
  role: 'OWNER' as const,
  description: 'Shared productivity workspace',
  avatarUrl: null,
  inviteCode: 'invite_code_123',
  createdAt: '2026-07-26T00:00:00Z',
  updatedAt: '2026-07-26T00:00:00Z',
};

import { AnalyticsPage } from '@/pages/analytics';
import { NotesPage } from '@/pages/notes';
import { CalendarPage } from '@/pages/calendar';

describe('Route-Level Lazy Loading & Suspense Regression Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWorkspaceStore.setState({
      currentWorkspaceId: 'workspace_demo_orbit',
      currentWorkspaceSlug: 'orbit-seed-demo',
      workspaces: [{ id: 'workspace_demo_orbit', name: 'Orbit Demo', slug: 'orbit-seed-demo' }],
    });

    vi.spyOn(workspaceHooks, 'useWorkspaces').mockReturnValue({
      data: [mockWorkspace],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof workspaceHooks.useWorkspaces>);

    vi.spyOn(dashboardHooks, 'useDashboard').mockReturnValue({
      data: {
        stats: {
          weeklyProductivityScore: 85,
          tasksCompletedToday: 4,
          habitCompletionPercent: 75,
          focusTimeToday: 120,
          currentStreak: 5,
          weeklyFocusHours: 12,
        },
        today: { tasks: [], overdueTasks: [], habits: [] },
        projects: [],
        activity: [],
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof dashboardHooks.useDashboard>);

    vi.spyOn(notesHooks, 'useNotes').mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof notesHooks.useNotes>);

    vi.spyOn(projectsHooks, 'useProjects').mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof projectsHooks.useProjects>);
  });

  it('renders lazy-loaded AnalyticsPage and resolves real content after Suspense boundary', async () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/w/orbit-seed-demo/analytics']}>
          <Routes>
            <Route
              path="/w/:workspaceSlug/*"
              element={
                <WorkspaceLayout>
                  <LoadingBoundary>
                    <Routes>
                      <Route path="analytics" element={<AnalyticsPage />} />
                    </Routes>
                  </LoadingBoundary>
                </WorkspaceLayout>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Verify real page header appears after async import resolves
    const header = await screen.findByRole('heading', { name: 'Analytics & Productivity' });
    expect(header).toBeInTheDocument();

    // Verify real page content sections are rendered
    expect(await screen.findByText('Weekly Productivity Trends')).toBeInTheDocument();
    expect(await screen.findByText('Productivity Formula Breakdown')).toBeInTheDocument();
  });

  it('renders lazy-loaded NotesPage and resolves real page content after Suspense boundary', async () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/w/orbit-seed-demo/notes']}>
          <Routes>
            <Route
              path="/w/:workspaceSlug/*"
              element={
                <WorkspaceLayout>
                  <LoadingBoundary>
                    <Routes>
                      <Route path="notes" element={<NotesPage />} />
                    </Routes>
                  </LoadingBoundary>
                </WorkspaceLayout>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Verify real Notes page header resolves cleanly after lazy load
    const title = await screen.findByRole('heading', { name: 'Notes' });
    expect(title).toBeInTheDocument();
    expect(
      await screen.findByText('Structured notes, documentation, and ideas across your workspace.'),
    ).toBeInTheDocument();
  });

  it('renders lazy-loaded CalendarPage and resolves real calendar grid content after Suspense boundary', async () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/w/orbit-seed-demo/calendar']}>
          <Routes>
            <Route
              path="/w/:workspaceSlug/*"
              element={
                <WorkspaceLayout>
                  <LoadingBoundary>
                    <Routes>
                      <Route path="calendar" element={<CalendarPage />} />
                    </Routes>
                  </LoadingBoundary>
                </WorkspaceLayout>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Verify real Calendar page title and agenda panel resolve cleanly
    const title = await screen.findByRole('heading', { name: 'Calendar' });
    expect(title).toBeInTheDocument();
    expect(await screen.findByText(/Schedule and agenda view of tasks/i)).toBeInTheDocument();
  });
});
