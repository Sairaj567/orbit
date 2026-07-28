import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceSettingsPage } from './workspace-settings';
import {
  WorkspaceContext,
  type WorkspaceContextValue,
} from '@/components/layout/workspace-context';
import * as workspacesClient from '@/features/workspaces/api/workspaces.client';
import type { WorkspaceOption } from '@/config/navigation';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock auth hooks
vi.mock('@/lib/auth-hooks', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('test_token'),
    isSignedIn: true,
    userId: 'user_demo_saira',
  }),
}));

// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useMembers
vi.mock('@/features/members/hooks/use-members', () => ({
  useMembers: () => ({
    data: [{ id: 'm1', userId: 'user_demo_saira', role: 'OWNER' }],
  }),
}));

// Mock MemberList & InviteMemberDialog to keep test focused
vi.mock('@/features/members/components/MemberList', () => ({
  MemberList: () => <div data-testid="member-list">Member List</div>,
}));

vi.mock('@/features/members/components/InviteMemberDialog', () => ({
  InviteMemberDialog: () => null,
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWorkspaceSettings(workspaceOption: WorkspaceOption) {
  const queryClient = createTestQueryClient();
  const contextValue: WorkspaceContextValue = {
    workspace: workspaceOption,
    workspaces: [workspaceOption],
    loading: false,
    setWorkspaceSlug: vi.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <WorkspaceContext.Provider value={contextValue}>
        <MemoryRouter initialEntries={['/w/orbit-seed-demo/workspace-settings']}>
          <Routes>
            <Route
              path="/w/:workspaceSlug/workspace-settings"
              element={<WorkspaceSettingsPage />}
            />
          </Routes>
        </MemoryRouter>
      </WorkspaceContext.Provider>
    </QueryClientProvider>,
  );
}

describe('WorkspaceSettingsPage & WorkspaceDetailsForm Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const ownerWorkspace: WorkspaceOption = {
    id: 'workspace_demo_orbit',
    name: 'Orbit Demo',
    slug: 'orbit-seed-demo',
    role: 'OWNER',
    description: 'Original workspace description',
    avatarUrl: 'https://example.com/avatar.png',
  };

  const memberWorkspace: WorkspaceOption = {
    id: 'workspace_demo_orbit',
    name: 'Orbit Demo',
    slug: 'orbit-seed-demo',
    role: 'MEMBER',
    description: 'Original workspace description',
    avatarUrl: 'https://example.com/avatar.png',
  };

  it('Case 1: OWNER / ADMIN sees editable form and can submit changes successfully', async () => {
    const updateSpy = vi.spyOn(workspacesClient.WorkspacesClient, 'update').mockResolvedValue({
      id: 'workspace_demo_orbit',
      name: 'Orbit Demo Updated',
      slug: 'orbit-seed-demo',
      role: 'OWNER',
      description: 'New updated description',
      avatarUrl: 'https://example.com/avatar.png',
      inviteCode: 'code',
      createdAt: '',
      updatedAt: '',
    });

    renderWorkspaceSettings(ownerWorkspace);

    const nameInput = screen.getByLabelText(/Workspace Name/i) as HTMLInputElement;
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });

    expect(nameInput).not.toBeDisabled();
    expect(saveButton).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'Orbit Demo Updated' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        'workspace_demo_orbit',
        expect.objectContaining({ name: 'Orbit Demo Updated' }),
        'test_token',
      );
    });
  });

  it('Case 2: MEMBER / VIEWER sees read-only display without save button or editable inputs', () => {
    renderWorkspaceSettings(memberWorkspace);

    const nameInput = screen.getByLabelText(/Workspace Name/i) as HTMLInputElement;
    const slugInput = screen.getByLabelText(/Workspace Slug/i) as HTMLInputElement;

    expect(nameInput).toBeDisabled();
    expect(slugInput).toBeDisabled();

    expect(screen.queryByRole('button', { name: /Save Changes/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Read-only for members/i)).toBeInTheDocument();
  });

  it('Case 3: Slug change triggers warning banner and navigates to new URL on successful save', async () => {
    const updateSpy = vi.spyOn(workspacesClient.WorkspacesClient, 'update').mockResolvedValue({
      id: 'workspace_demo_orbit',
      name: 'Orbit Demo',
      slug: 'new-orbit-slug',
      role: 'OWNER',
      description: 'Original workspace description',
      avatarUrl: null,
      inviteCode: 'code',
      createdAt: '',
      updatedAt: '',
    });

    renderWorkspaceSettings(ownerWorkspace);

    const slugInput = screen.getByLabelText(/Workspace Slug/i) as HTMLInputElement;

    fireEvent.change(slugInput, { target: { value: 'new-orbit-slug' } });

    // Warning banner appears when slug changes
    expect(
      screen.getByText(/Changing the workspace slug will update the URL path for all members/i),
    ).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        'workspace_demo_orbit',
        expect.objectContaining({ slug: 'new-orbit-slug' }),
        'test_token',
      );
      expect(mockNavigate).toHaveBeenCalledWith('/w/new-orbit-slug/workspace-settings', {
        replace: true,
      });
    });
  });

  it('Case 4: 409 Slug Collision from backend displays inline error message under slug input', async () => {
    vi.spyOn(workspacesClient.WorkspacesClient, 'update').mockRejectedValue({
      status: 409,
      message: 'Workspace slug is already taken',
    });

    renderWorkspaceSettings(ownerWorkspace);

    const slugInput = screen.getByLabelText(/Workspace Slug/i) as HTMLInputElement;
    fireEvent.change(slugInput, { target: { value: 'taken-slug' } });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText('This workspace slug is already taken. Please choose another.'),
      ).toBeInTheDocument();
    });
  });
});
