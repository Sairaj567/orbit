import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMembers } from '@/features/members/hooks/use-members';
import { useProjectMembers, useInviteProjectMember } from '../hooks/use-project-members';


interface InviteProjectMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
}

export function InviteProjectMemberDialog({ open, onOpenChange, workspaceId, projectId }: InviteProjectMemberDialogProps) {
  const { data: workspaceMembers } = useMembers();
  const { data: projectMembers } = useProjectMembers(workspaceId, projectId);
  const invite = useInviteProjectMember();
  
  const [selectedRole, setSelectedRole] = useState<'VIEWER' | 'EDITOR' | 'OWNER'>('VIEWER');

  const projectMemberIds = new Set(projectMembers?.map(pm => pm.workspaceMemberId));
  const availableMembers = workspaceMembers?.filter(wm => !projectMemberIds.has(wm.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Default Role:</span>
            <select 
              className="text-sm bg-muted rounded p-1"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as 'VIEWER' | 'EDITOR' | 'OWNER')}
            >
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
              <option value="OWNER">Owner</option>
            </select>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableMembers?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No available members to add.</p>
            ) : (
              availableMembers?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                      {member.user?.displayName?.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{member.user?.displayName}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => invite.mutate({
                      workspaceId,
                      projectId,
                      workspaceMemberId: member.id,
                      role: selectedRole
                    }, {
                      onSuccess: () => {
                        if (availableMembers.length === 1) {
                          onOpenChange(false);
                        }
                      }
                    })}
                  >
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
