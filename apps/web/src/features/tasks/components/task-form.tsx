import { useState } from 'react';
import type { CreateTaskInput, Task } from '@orbit/shared';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Calendar, Tag, Repeat, Users } from 'lucide-react';
import { useMembers } from '@/features/members/hooks/use-members';
import { useProjectMembers } from '@/features/project-members/hooks/use-project-members';

interface TaskFormProps {
  initialData?: Partial<Task> & { assigneeIds?: string[] };
  onSubmit: (data: CreateTaskInput) => void;
  isLoading?: boolean;
  workspaceId: string;
}

export function TaskForm({ initialData, onSubmit, isLoading, workspaceId }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState(initialData?.status || 'TODO');
  const [priority, setPriority] = useState(initialData?.priority || 'MEDIUM');
  const projectId = initialData?.projectId || undefined;
  const [assigneeIds, setAssigneeIds] = useState<string[]>(initialData?.assigneeIds || []);

  const { data: workspaceMembers } = useMembers();
  const { data: projectMembers } = useProjectMembers(workspaceId, projectId || '');
  
  const availableMembers = projectId ? projectMembers?.map(pm => pm.workspaceMember) : workspaceMembers;
  
  // Format the date for the input type="date"
  const defaultDate = initialData?.dueDate 
    ? new Date(initialData.dueDate).toISOString().split('T')[0] 
    : '';
  const [dueDate, setDueDate] = useState(defaultDate);
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');

  // Recurrence
  const initialRecurrence = initialData?.rrule?.includes('FREQ=DAILY') ? 'daily'
    : initialData?.rrule?.includes('FREQ=WEEKLY') ? 'weekly'
    : initialData?.rrule?.includes('FREQ=MONTHLY') ? 'monthly'
    : 'none';
  const [recurrence, setRecurrence] = useState<string>(initialRecurrence);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    const payload: CreateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      status: status as CreateTaskInput['status'],
      priority: priority as CreateTaskInput['priority'],
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      tags: tags.length > 0 ? tags : undefined,
      rrule: recurrence === 'none' ? null : `FREQ=${recurrence.toUpperCase()}`,
      recurrenceType: recurrence === 'none' ? null : 'RELATIVE', // Simple relative recurring for now
      projectId,
      assigneeIds: assigneeIds.length > 0 ? assigneeIds : undefined,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Add details about this task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-none min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 flex flex-col">
          <label className="text-sm font-medium text-foreground">Status</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between w-full">
                {status.replace('_', ' ')}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuItem onClick={() => setStatus('TODO')}>TODO</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus('IN_PROGRESS')}>IN PROGRESS</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus('IN_REVIEW')}>IN REVIEW</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus('DONE')}>DONE</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus('CANCELLED')}>CANCELLED</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 flex flex-col">
          <label className="text-sm font-medium text-foreground">Priority</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between w-full">
                {priority}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuItem onClick={() => setPriority('LOW')}>LOW</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriority('MEDIUM')}>MEDIUM</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriority('HIGH')}>HIGH</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriority('URGENT')}>URGENT</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="dueDate" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Due Date
          </label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="tags" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Tag className="h-4 w-4" /> Tags
          </label>
          <Input
            id="tags"
            placeholder="bug, feature, docs..."
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2 flex flex-col w-[200px]">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Repeat className="h-4 w-4" /> Repeat
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between w-full capitalize">
                {recurrence}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuItem onClick={() => setRecurrence('none')}>None</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRecurrence('daily')}>Daily</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRecurrence('weekly')}>Weekly</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRecurrence('monthly')}>Monthly</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 flex flex-col w-[200px]">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="h-4 w-4" /> Assignees
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between w-full">
                {assigneeIds.length > 0 ? `${assigneeIds.length} selected` : 'Unassigned'}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px] max-h-60 overflow-y-auto">
              <DropdownMenuItem onClick={() => setAssigneeIds([])}>Clear All</DropdownMenuItem>
              {availableMembers?.map((member) => {
                if (!member || !member.userId) return null;
                const isSelected = assigneeIds.includes(member.userId);
                return (
                  <DropdownMenuItem 
                    key={member.userId} 
                    onClick={(e) => {
                      e.preventDefault();
                      if (isSelected) {
                        setAssigneeIds(prev => prev.filter(id => id !== member.userId!));
                      } else {
                        setAssigneeIds(prev => [...prev, member.userId!]);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 border rounded ${isSelected ? 'bg-primary border-primary' : 'border-input'}`} />
                      {member.user?.displayName || member.user?.email || 'Unknown'}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isLoading || !title.trim()}>
          {isLoading ? 'Saving...' : 'Save Task'}
        </Button>
      </div>
    </form>
  );
}
