import { Users } from 'lucide-react';
import { EmptyState } from '@/components/layout/empty-state';
import { useMembers } from '../hooks/use-members';
import { MemberRow } from './MemberRow';

interface MemberListProps {
  currentUserId?: string;
  currentUserRole?: string;
}

export function MemberList({ currentUserId, currentUserRole }: MemberListProps) {
  const { data: members, isLoading, error } = useMembers();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[74px] rounded-lg border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !members) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Failed to load workspace members.
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="No members yet"
        description="Invite people to collaborate in this workspace."
      />
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <MemberRow 
          key={member.id} 
          member={member} 
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      ))}
    </div>
  );
}
