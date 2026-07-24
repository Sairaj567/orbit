import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useCreateTask } from '@/features/tasks/hooks/use-tasks';

interface QuickAddTaskProps {
  onClose: () => void;
  workspaceId: string;
  projectId?: string;
}

export function QuickAddTask({ onClose, workspaceId, projectId }: QuickAddTaskProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { mutate: createTask, isPending } = useCreateTask(workspaceId);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      onClose();
      return;
    }

    createTask(
      { 
        title: title.trim(), 
        status: 'TODO', 
        priority: 'MEDIUM',
        projectId: projectId || undefined 
      },
      {
        onSuccess: () => {
          setTitle('');
          // Keep it open for rapid adding
          inputRef.current?.focus();
        }
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center gap-3 px-3 py-2 border-b border-primary/20 bg-primary/5"
    >
      <div className="h-4 w-4 rounded-full border-2 border-primary/30 flex-shrink-0" />
      
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a task and press Enter..."
        className="h-8 border-none bg-transparent shadow-none focus-visible:ring-0 px-0 flex-1 text-sm font-medium"
        disabled={isPending}
        autoComplete="off"
      />
    </form>
  );
}
