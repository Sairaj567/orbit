import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceLayout } from './workspace-layout';
import { useWorkspaceStore } from '@/stores/workspace.store';
import * as workspaceHooks from '@/features/workspaces/hooks/use-workspaces';
import type { WorkspaceWithRole } from '@/features/workspaces/api/workspaces.client';

// Mock Clerk auth
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('test_token'),
    isSignedIn: true,
    userId: 'user_demo_saira',
  }),
  useUser: () => ({
    user: { fullName: 'Saira', primaryEmailAddress: { emailAddress: 'saira@test.com' } },
  }),
}));

// Mock realtime sync hook
vi.mock('@/hooks/use-realtime-sync', () => ({
  useRealtimeSync: () => {},
}));

// Mock active study widget
vi.mock('@/features/study-blocks/components', () => ({
  ActiveStudyWidget: () => null,
}));

// Mock command palette
vi.mock('../command-palette', () => ({
  CommandPalette: () => null,
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

describe('WorkspaceLayout Component & Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWorkspaceStore.setState({
      currentWorkspaceId: null,
      currentWorkspaceSlug: null,
      workspaces: [],
    });
  });

  const mockRealApiWorkspaces: WorkspaceWithRole[] = [
    {
      id: 'workspace_demo_orbit',
      name: 'Orbit Demo',
      slug: 'orbit-seed-demo',
      role: 'OWNER',
      description: 'Shared productivity workspace',
      avatarUrl: null,
      inviteCode: 'invite_code_123',
      createdAt: '2026-07-26T00:00:00Z',
      updatedAt: '2026-07-26T00:00:00Z',
    },
    {
      id: 'workspace_secondary_id',
      name: 'Secondary Lab',
      slug: 'secondary-lab',
      role: 'MEMBER',
      description: null,
      avatarUrl: null,
      inviteCode: 'invite_code_456',
      createdAt: '2026-07-26T00:00:00Z',
      updatedAt: '2026-07-26T00:00:00Z',
    },
  ];

  it('renders real workspace data in layout & WorkspaceSwitcher without crashing on missing visual mock fields', async () => {
    vi.spyOn(workspaceHooks, 'useWorkspaces').mockReturnValue({
      data: mockRealApiWorkspaces,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof workspaceHooks.useWorkspaces>);

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/w/orbit-seed-demo/dashboard']}>
          <Routes>
            <Route
              path="/w/:workspaceSlug/*"
              element={
                <WorkspaceLayout>
                  <div>Dashboard Content</div>
                </WorkspaceLayout>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Verify layout renders workspace name in breadcrumbs and WorkspaceSwitcher
    await waitFor(() => {
      const elements = screen.getAllByText('Orbit Demo');
      expect(elements.length).toBeGreaterThan(0);
    });

    // Verify child content renders
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();

    // Verify role is displayed in WorkspaceSwitcher
    const ownerRoleElements = screen.getAllByText(/OWNER/i);
    expect(ownerRoleElements.length).toBeGreaterThan(0);

    // Verify Zustand store receives real CUID id and real slug
    expect(useWorkspaceStore.getState().currentWorkspaceId).toBe('workspace_demo_orbit');
    expect(useWorkspaceStore.getState().currentWorkspaceSlug).toBe('orbit-seed-demo');
    expect(useWorkspaceStore.getState().workspaces).toEqual([
      { id: 'workspace_demo_orbit', name: 'Orbit Demo', slug: 'orbit-seed-demo' },
      { id: 'workspace_secondary_id', name: 'Secondary Lab', slug: 'secondary-lab' },
    ]);
  });

  it('renders skeleton loader when workspaces are loading', () => {
    vi.spyOn(workspaceHooks, 'useWorkspaces').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof workspaceHooks.useWorkspaces>);

    const queryClient = createTestQueryClient();

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/w/orbit-seed-demo/dashboard']}>
          <Routes>
            <Route
              path="/w/:workspaceSlug/*"
              element={
                <WorkspaceLayout>
                  <div>Content</div>
                </WorkspaceLayout>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders error state card when workspace fetch fails', () => {
    vi.spyOn(workspaceHooks, 'useWorkspaces').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof workspaceHooks.useWorkspaces>);

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/w/orbit-seed-demo/dashboard']}>
          <Routes>
            <Route
              path="/w/:workspaceSlug/*"
              element={
                <WorkspaceLayout>
                  <div>Content</div>
                </WorkspaceLayout>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Failed to load workspaces')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders empty state card when user belongs to 0 workspaces', () => {
    vi.spyOn(workspaceHooks, 'useWorkspaces').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof workspaceHooks.useWorkspaces>);

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/w/orbit-seed-demo/dashboard']}>
          <Routes>
            <Route
              path="/w/:workspaceSlug/*"
              element={
                <WorkspaceLayout>
                  <div>Content</div>
                </WorkspaceLayout>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('No Workspaces Found')).toBeInTheDocument();
    expect(
      screen.getByText(
        "You don't belong to any workspaces yet. Create a workspace or ask your team for an invitation.",
      ),
    ).toBeInTheDocument();
  });

  it('regression: does not render Achievements navigation item or Notification bell', async () => {
    vi.spyOn(workspaceHooks, 'useWorkspaces').mockReturnValue({
      data: mockRealApiWorkspaces,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof workspaceHooks.useWorkspaces>);

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/w/orbit-seed-demo/dashboard']}>
          <Routes>
            <Route
              path="/w/:workspaceSlug/*"
              element={
                <WorkspaceLayout>
                  <div>Content</div>
                </WorkspaceLayout>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Orbit Demo').length).toBeGreaterThan(0);
    });

    // Confirm nav/sidebar no longer renders Achievements
    expect(screen.queryByText('Achievements')).toBeNull();

    // Confirm TopBar no longer renders Notification button/bell
    expect(screen.queryByRole('button', { name: /notifications/i })).toBeNull();
    expect(screen.queryByLabelText(/notifications/i)).toBeNull();
  });
});
