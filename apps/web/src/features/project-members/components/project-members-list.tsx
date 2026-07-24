import { useState } from 'react';
import { useOutletContext } from 'react-router';

import { Button } from '@/components/ui/button';
import { useProjectMembers, useUpdateProjectMemberRole, useRemoveProjectMember } from '../hooks/use-project-members';
import type { Project } from '@orbit/shared';
import { InviteProjectMemberDialog } from './invite-project-member-dialog';

export function ProjectMembersList() {
  const { project, workspaceId } = useOutletContext<{ project: Project; workspaceId: string }>();
  const { data: members, isLoading } = useProjectMembers(workspaceId, project.id);
  const updateRole = useUpdateProjectMemberRole();
  const removeMember = useRemoveProjectMember();
  
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground animate-pulse">Loading members...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Project Members</h3>
        <Button size="sm" onClick={() => setIsInviteOpen(true)}>Add Member</Button>
      </div>

      <div className="rounded-xl border bg-card">
        {members?.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No members in this project.
          </div>
        ) : (
          <div className="divide-y">
            {members?.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                    {member.workspaceMember?.user?.displayName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.workspaceMember?.user?.displayName}</p>
                    <p className="text-xs text-muted-foreground">{member.workspaceMember?.user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <select 
                    className="text-sm bg-transparent border-none outline-none cursor-pointer p-1"
                    value={member.role}
                    onChange={(e) => updateRole.mutate({
                      workspaceId, 
                      projectId: project.id, 
                      memberId: member.id, 
                      role: e.target.value as 'VIEWER' | 'EDITOR' | 'OWNER'
                    })}
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="EDITOR">Editor</option>
                    <option value="OWNER">Owner</option>
                  </select>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removeMember.mutate({
                      workspaceId,
                      projectId: project.id,
                      memberId: member.id
                    })}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <InviteProjectMemberDialog 
        open={isInviteOpen} 
        onOpenChange={setIsInviteOpen} 
        projectId={project.id} 
        workspaceId={workspaceId} 
      />
    </div>
  );
}
