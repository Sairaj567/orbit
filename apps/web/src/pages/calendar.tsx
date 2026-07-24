import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { useTasks } from '@/features/tasks/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Task } from '@orbit/shared';

export function CalendarPage() {
  const { workspace } = useWorkspaceContext();
  const { data: tasksData, isLoading } = useTasks(workspace.slug);
  const tasks: Task[] = tasksData?.data || [];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date().getDate());
  };

  // Group tasks by day in current month
  const tasksByDay: Record<number, Task[]> = {};
  tasks.forEach((task: Task) => {
    if (!task.dueDate) return;
    const due = new Date(task.dueDate);
    if (due.getFullYear() === year && due.getMonth() === month) {
      const dayNum = due.getDate();
      if (!tasksByDay[dayNum]) tasksByDay[dayNum] = [];
      tasksByDay[dayNum].push(task);
    }
  });

  const selectedTasks = tasksByDay[selectedDay] || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Schedule and agenda view of tasks, deadlines, and workspace events."
        actions={
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid Card */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            {/* Header controls */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {monthNames[month]} {year}
              </h3>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground py-2 border-b border-border">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Month grid */}
            {isLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : (
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {/* Empty padding cells for first week */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16 rounded-lg p-1 bg-muted/20 opacity-30" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayTasks = tasksByDay[dayNum] || [];
                  const isToday =
                    dayNum === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear();
                  const isSelected = dayNum === selectedDay;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setSelectedDay(dayNum)}
                      className={cn(
                        'h-16 rounded-lg p-1.5 flex flex-col justify-between items-start transition-all border text-left',
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-transparent hover:bg-muted/50',
                        isToday && 'font-bold text-primary'
                      )}
                    >
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
                          isToday ? 'bg-primary text-primary-foreground' : ''
                        )}
                      >
                        {dayNum}
                      </span>
                      {dayTasks.length > 0 && (
                        <div className="w-full flex items-center gap-1 overflow-hidden">
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <span className="text-[10px] text-muted-foreground truncate font-medium">
                            {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Day Agenda Side Panel */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h4 className="text-base font-bold text-foreground border-b border-border pb-3">
              Agenda — {monthNames[month]} {selectedDay}, {year}
            </h4>

            {selectedTasks.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-sm font-medium text-muted-foreground">No tasks scheduled for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground line-clamp-1">{t.title}</span>
                      <Badge
                        variant={t.status === 'DONE' ? 'default' : 'outline'}
                        className="text-[10px] uppercase"
                      >
                        {t.status}
                      </Badge>
                    </div>
                    {t.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}