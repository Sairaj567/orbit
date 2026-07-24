import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useCreateHabit } from '../hooks/use-habits';
import { useWorkspaceContext } from '@/components/layout/workspace-context';

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function CreateHabitDialog({ open, onOpenChange, projectId }: CreateHabitDialogProps) {
  const { workspace } = useWorkspaceContext();
  const createHabit = useCreateHabit(workspace.slug, projectId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🔥');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createHabit.mutate({
      projectId,
      title: title.trim(),
      description: description.trim() || undefined,
      icon,
      // For V1, default to daily recurrence
      rrule: 'FREQ=DAILY',
      recurrenceType: 'FIXED',
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setTitle('');
        setDescription('');
        setIcon('🔥');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input
              id="title"
              placeholder="e.g. Drink Water"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
            <Input
              id="description"
              placeholder="e.g. 2 liters per day"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="emoji" className="text-sm font-medium">Emoji (Optional)</label>
            <Input
              id="icon"
              placeholder="🔥"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || createHabit.isPending}>
              Create Habit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
