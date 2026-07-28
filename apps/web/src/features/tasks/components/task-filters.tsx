import { useSearchParams } from 'react-router';
import { SearchInput } from '@/components/ui/search-input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { useMembers } from '@/features/members/hooks/use-members';
import { useCategories } from '@/features/categories/hooks/use-categories';

export function TaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { workspace } = useWorkspaceContext();
  const { data: members } = useMembers();
  const { categories } = useCategories(workspace.slug);

  const handleSearchChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('search', value);
    else next.delete('search');
    next.delete('page'); // Reset pagination on search
    setSearchParams(next);
  };

  const handleFilterChange = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const currentStatus = searchParams.get('status') || 'All Statuses';
  const currentPriority = searchParams.get('priority') || 'All Priorities';

  const currentAssigneeId = searchParams.get('assigneeId');
  const currentAssignee = currentAssigneeId
    ? members?.find((m) => m.userId === currentAssigneeId)?.user?.displayName || 'Assignee'
    : 'All Assignees';

  const currentCategoryId = searchParams.get('categoryId');
  const currentCategory = currentCategoryId
    ? categories?.find((c: any) => c.id === currentCategoryId)?.name || 'Category'
    : 'All Categories';

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full sm:max-w-md">
        <SearchInput
          id="task-search-input"
          placeholder="Search tasks..."
          value={searchParams.get('search') || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          onClear={() => handleSearchChange('')}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-between min-w-[140px]"
            >
              <span className="truncate">{currentStatus}</span>
              <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleFilterChange('status', null)}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('status', 'TODO')}>
              To Do
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('status', 'IN_PROGRESS')}>
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('status', 'IN_REVIEW')}>
              In Review
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('status', 'DONE')}>
              Done
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('status', 'CANCELLED')}>
              Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-between min-w-[140px]"
            >
              <span className="truncate">{currentPriority}</span>
              <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleFilterChange('priority', null)}>
              All Priorities
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('priority', 'LOW')}>
              Low
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('priority', 'MEDIUM')}>
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('priority', 'HIGH')}>
              High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('priority', 'URGENT')}>
              Urgent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-between min-w-[140px]"
            >
              <span className="truncate">{currentAssignee}</span>
              <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleFilterChange('assigneeId', null)}>
              All Assignees
            </DropdownMenuItem>
            {members?.map((m) => (
              <DropdownMenuItem
                key={m.id}
                onClick={() => handleFilterChange('assigneeId', m.userId)}
              >
                {m.user?.displayName || m.user?.email || 'Unknown User'}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-between min-w-[140px]"
            >
              <span className="truncate">{currentCategory}</span>
              <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleFilterChange('categoryId', null)}>
              All Categories
            </DropdownMenuItem>
            {categories?.map((c: any) => (
              <DropdownMenuItem key={c.id} onClick={() => handleFilterChange('categoryId', c.id)}>
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
