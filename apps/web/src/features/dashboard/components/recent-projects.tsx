import type { DashboardResponse } from '@orbit/shared';
import { FolderKanban, Users, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';

interface RecentProjectsProps {
  projects: DashboardResponse['projects'];
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold tracking-tight text-foreground">Recent Projects</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/workspace/projects/${project.id}`}
            className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card/75 p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
                style={project.color ? { backgroundColor: `${project.color}20`, color: project.color } : {}}
              >
                {project.icon ? <span>{project.icon}</span> : <FolderKanban className="h-5 w-5" />}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                  {project.name}
                </h4>
                <p className="truncate text-xs text-muted-foreground">{project.description || 'No description'}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                <span>{project.taskCompletionRate}% done</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>{project.memberCount}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
