import type { WorkspaceMember } from '@orbit/shared';
import { MoreHorizontal, User, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRemoveMember, useUpdateMemberRole } from '../hooks/use-members';

interface MemberRowProps {
  member: WorkspaceMember;
  currentUserId?: string;
  currentUserRole?: string;
}

export function MemberRow({ member, currentUserId, currentUserRole }: MemberRowProps) {
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateMemberRole();

  const isSelf = member.userId === currentUserId;
  const isOwner = member.role === 'OWNER';
  const isPending = member.status === 'PENDING';
  
  // Only owners and admins can manage members, but no one can manage the owner
  const canManage = !isSelf && !isOwner && (currentUserRole === 'OWNER' || currentUserRole === 'ADMIN');

  const RoleIcon = 
    member.role === 'OWNER' ? ShieldAlert :
    member.role === 'ADMIN' ? ShieldCheck :
    member.role === 'MEMBER' ? Shield :
    User;

  const handleRoleChange = (newRole: 'ADMIN' | 'MEMBER' | 'VIEWER') => {
    updateRole({ memberId: member.id, role: newRole });
  };

  const handleRemove = () => {
    if (confirm(`Are you sure you want to remove ${member.user?.displayName || member.email}?`)) {
      removeMember(member.id);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.user?.avatarUrl || ''} />
          <AvatarFallback>
            {member.user?.displayName?.[0] || member.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-foreground flex items-center gap-2">
            {member.user?.displayName || member.email}
            {isSelf && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">You</Badge>}
            {isPending && <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-dashed">Pending</Badge>}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <RoleIcon className="h-3.5 w-3.5" />
            <span className="capitalize">{member.role.toLowerCase()}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isRemoving || isUpdating}>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Manage member</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleRoleChange('ADMIN')} disabled={member.role === 'ADMIN'}>
                Make Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange('MEMBER')} disabled={member.role === 'MEMBER'}>
                Make Member
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange('VIEWER')} disabled={member.role === 'VIEWER'}>
                Make Viewer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={handleRemove}>
                Remove from workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
