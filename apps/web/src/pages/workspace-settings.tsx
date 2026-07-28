import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-hooks';
import { useMembers } from '@/features/members/hooks/use-members';
import { MemberList } from '@/features/members/components/MemberList';
import { InviteMemberDialog } from '@/features/members/components/InviteMemberDialog';
import { WorkspaceDetailsForm } from '@/features/workspaces/components/WorkspaceDetailsForm';
import { CategoryList } from '@/features/categories/components/CategoryList';

export function WorkspaceSettingsPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const { data: members } = useMembers();
  const [inviteOpen, setInviteOpen] = useState(false);

  const currentUserMembership = members?.find((m) => m.userId === userId);
  const currentUserRole = currentUserMembership?.role;
  const canInvite = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workspace Settings"
        description="Manage workspace metadata, members, and categories."
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-8">
          <WorkspaceDetailsForm />
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoryList />
        </TabsContent>
      </Tabs>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
