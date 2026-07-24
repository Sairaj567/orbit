import { Outlet, useParams, NavLink } from 'react-router';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function ProjectLayout() {
  const { workspaceId = 'home', projectId } = useParams();
  const { data: projectsData, isLoading } = useProjects(workspaceId);
  const project = projectsData?.data?.find(p => p.id === projectId);

  if (isLoading) return <div className="p-6">Loading project...</div>;
  if (!project) return <div className="p-6">Project not found.</div>;

  const tabs = [
    { name: 'Overview', href: `/w/${workspaceId}/projects/${projectId}/overview` },
    { name: 'Tasks', href: `/w/${workspaceId}/projects/${projectId}/tasks` },
    { name: 'Habits', href: `/w/${workspaceId}/projects/${projectId}/habits` },
    { name: 'Notes', href: `/w/${workspaceId}/projects/${projectId}/notes` },
    { name: 'Resources', href: `/w/${workspaceId}/projects/${projectId}/resources` },
    { name: 'Activity', href: `/w/${workspaceId}/projects/${projectId}/activity` },
    { name: 'Settings', href: `/w/${workspaceId}/projects/${projectId}/settings` },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-4 md:px-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/w/${workspaceId}/dashboard`}>Workspace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/w/${workspaceId}/projects`}>Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{project.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          </div>
        </div>
        
        <ScrollArea className="w-full">
          <div className="flex w-max space-x-2 px-4 md:px-6 pb-2">
            {tabs.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.href}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>

      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          <Outlet context={{ project, workspaceId }} />
        </div>
      </div>
    </div>
  );
}
