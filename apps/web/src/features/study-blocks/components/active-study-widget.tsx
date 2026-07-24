import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, CheckCircle2 } from 'lucide-react';
import { useActiveStudyBlock, useCompleteStudyBlock, useCancelStudyBlock } from '../hooks/use-study-blocks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ActiveStudyWidget() {
  const { data: activeBlock, isLoading } = useActiveStudyBlock();
  const completeMutation = useCompleteStudyBlock();
  const cancelMutation = useCancelStudyBlock();
  
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeBlock) return;

    const startedAt = new Date(activeBlock.startedAt).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.floor((now - startedAt) / 1000);
      setElapsed(Math.max(0, diff));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeBlock]);

  if (isLoading || !activeBlock) return null;

  const plannedSeconds = activeBlock.plannedDuration * 60;
  const remaining = Math.max(0, plannedSeconds - elapsed);
  
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isOvertime = elapsed > plannedSeconds;
  
  const handleComplete = () => {
    completeMutation.mutate({
      id: activeBlock.id,
      data: {
        actualDuration: Math.floor(elapsed / 60),
      }
    });
  };

  const handleCancel = () => {
    cancelMutation.mutate(activeBlock.id);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-border bg-background/80 p-2 pr-4 shadow-lg backdrop-blur-md"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Play className="h-4 w-4" />
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">Focus Session</span>
          <span className={cn("text-sm font-bold tabular-nums", isOvertime && "text-destructive")}>
            {isOvertime ? '+' : ''}{timeString}
          </span>
        </div>

        <div className="ml-4 flex items-center gap-1 border-l border-border pl-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleCancel}
            title="Cancel Session"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
            onClick={handleComplete}
            title="Complete Session"
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
