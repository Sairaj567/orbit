import { useProjects } from '../hooks/use-projects';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { Label } from '@/components/ui/label';

interface ProjectSelectorProps {
  value?: string;
  onChange: (projectId: string) => void;
  label?: string;
}

export function ProjectSelector({ value, onChange, label = 'Project' }: ProjectSelectorProps) {
  const { workspace } = useWorkspaceContext();
  const { data: projects, isLoading } = useProjects(workspace.slug);

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading || !projects?.data?.length}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects?.data?.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.icon && <span className="mr-2">{project.icon}</span>}
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
