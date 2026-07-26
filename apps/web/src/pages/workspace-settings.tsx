import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/clerk-react';
import { useMembers } from '@/features/members/hooks/use-members';
import { MemberList } from '@/features/members/components/MemberList';
import { InviteMemberDialog } from '@/features/members/components/InviteMemberDialog';
import { WorkspaceDetailsForm } from '@/features/workspaces/components/WorkspaceDetailsForm';

export function WorkspaceSettingsPage() {
  const { userId } = useAuth();
  const { data: members } = useMembers();
  const [inviteOpen, setInviteOpen] = useState(false);

  const currentUserMembership = members?.find((m) => m.userId === userId);
  const currentUserRole = currentUserMembership?.role;
  const canInvite = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workspace Settings"
        description="Manage workspace metadata, URL slug, and member permissions."
      />

      {/* Metadata Edit Form */}
      <WorkspaceDetailsForm />

      {/* Member Roster Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Workspace Members</h3>
            <p className="text-xs text-muted-foreground">Manage members and role permissions.</p>
          </div>
          {canInvite && (
            <Button onClick={() => setInviteOpen(true)} size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          )}
        </div>

        <MemberList currentUserId={userId || undefined} currentUserRole={currentUserRole} />
      </div>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
