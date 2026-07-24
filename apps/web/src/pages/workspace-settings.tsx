import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/clerk-react';
import { useMembers } from '@/features/members/hooks/use-members';
import { MemberList } from '@/features/members/components/MemberList';
import { InviteMemberDialog } from '@/features/members/components/InviteMemberDialog';

export function WorkspaceSettingsPage() {
  const { userId } = useAuth();
  const { data: members } = useMembers();
  const [inviteOpen, setInviteOpen] = useState(false);

  // Find the current user's membership to determine their role
  const currentUserMembership = members?.find((m) => m.userId === userId);
  const currentUserRole = currentUserMembership?.role;
  const canInvite = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader 
          title="Workspace Members" 
          description="Manage who has access to this workspace and their roles." 
        />
        {canInvite && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      <MemberList currentUserId={userId || undefined} currentUserRole={currentUserRole} />

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}