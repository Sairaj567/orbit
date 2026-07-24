import { useOutletContext, Link } from 'react-router';
import { useTasks } from '@/features/tasks/hooks/use-tasks';
import { useResources } from '@/features/resources/hooks/use-resources';
import { useNotes } from '@/features/notes/hooks/use-notes';
import { useHabits } from '@/features/habits/hooks/use-habits';
import { TaskListItem } from '@/features/tasks/components/task-list-item';
import { HabitCard } from '@/features/habits/components/habit-card';
import { ResourceCard } from '@/features/resources/components/resource-card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Note, Project } from '@orbit/shared';

export function ProjectOverviewPage() {
  const { project, workspaceId } = useOutletContext<{ project: Project; workspaceId: string }>();

  // Load Recent Items (limited)
  const { data: tasksData, isLoading: isTasksLoading } = useTasks(workspaceId, { projectId: project.id, perPage: 5 });
  const tasks = tasksData?.data || [];

  const { data: habits = [], isLoading: isHabitsLoading } = useHabits(workspaceId, project.id);

  const { data: resourcesData, isLoading: isResourcesLoading } = useResources(workspaceId, { projectId: project.id, perPage: 3 });
  const resources = resourcesData?.data || [];

  const { data: notesData, isLoading: isLoadingNotes } = useNotes(workspaceId, { projectId: project.id });
  const notes = notesData?.data?.slice(0, 3) || []; // Just top 3 for overview

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column: Tasks & Habits */}
      <div className="space-y-8">
        <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Tasks</h3>
          <Link to={`/w/${workspaceId}/projects/${project.id}/tasks`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-muted-foreground")}>
            View All
          </Link>
        </div>
        
        {isTasksLoading ? (
          <div className="text-sm text-muted-foreground">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No tasks yet. Create one to get started.
          </div>
        ) : (
          <div className="space-y-1">
            {tasks.map(task => (
              <TaskListItem key={task.id} task={task} />
            ))}
          </div>
        )}
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Habits</h3>
            <Link to={`/w/${workspaceId}/projects/${project.id}/habits`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-muted-foreground")}>
              View All
            </Link>
          </div>
          
          {isHabitsLoading ? (
            <div className="text-sm text-muted-foreground">Loading habits...</div>
          ) : habits.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No habits yet. Start tracking daily progress.
            </div>
          ) : (
            <div className="space-y-3">
              {habits.slice(0, 3).map(habit => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  onEdit={() => {}} 
                  onDelete={() => {}} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Resources & Notes */}
      <div className="space-y-8">
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Notes</h3>
            <Link to={`/w/${workspaceId}/projects/${project.id}/notes`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-muted-foreground")}>
              View All
            </Link>
          </div>
          
          {isLoadingNotes ? (
            <div className="text-sm text-muted-foreground">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No notes yet. Create your first note.
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note: Note) => (
                <div key={note.id} className="rounded-lg border p-4 bg-card text-card-foreground shadow-sm">
                   <h4 className="font-semibold text-sm line-clamp-1">{note.title}</h4>
                   <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Resources</h3>
            <Link to={`/w/${workspaceId}/projects/${project.id}/resources`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-muted-foreground")}>
              View All
            </Link>
          </div>
          
          {isResourcesLoading ? (
            <div className="text-sm text-muted-foreground">Loading resources...</div>
          ) : resources.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No resources yet. Attach your first resource.
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} workspaceId={workspaceId} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
