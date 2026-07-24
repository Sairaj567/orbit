import { useSearchParams } from 'react-router';
import { SearchInput } from '@/components/ui/search-input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export function TaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearchChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('search', value);
    else next.delete('search');
    next.delete('page'); // Reset pagination on search
    setSearchParams(next);
  };

  const handleStatusChange = (status: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (status) next.set('status', status);
    else next.delete('status');
    next.delete('page');
    setSearchParams(next);
  };

  const handlePriorityChange = (priority: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (priority) next.set('priority', priority);
    else next.delete('priority');
    next.delete('page');
    setSearchParams(next);
  };

  const currentStatus = searchParams.get('status') || 'All Statuses';
  const currentPriority = searchParams.get('priority') || 'All Priorities';

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
      <div className="flex-1 w-full">
        <SearchInput
          id="task-search-input"
          placeholder="Search tasks..."
          value={searchParams.get('search') || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          onClear={() => handleSearchChange('')}
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[160px] justify-between">
              <span className="truncate">{currentStatus}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusChange(null)}>All Statuses</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('TODO')}>To Do</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('IN_PROGRESS')}>In Progress</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('IN_REVIEW')}>In Review</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('DONE')}>Done</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('CANCELLED')}>Cancelled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[160px] justify-between">
              <span className="truncate">{currentPriority}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handlePriorityChange(null)}>All Priorities</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange('LOW')}>Low</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange('MEDIUM')}>Medium</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange('HIGH')}>High</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange('URGENT')}>Urgent</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
