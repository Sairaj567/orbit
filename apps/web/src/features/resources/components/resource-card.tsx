import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Trash2, Github, Youtube, FileText, Link as LinkIcon } from 'lucide-react';
import type { Resource } from '@orbit/shared';
import { Button } from '@/components/ui/button';
import { useDeleteResource } from '../hooks/use-resources';

export function ResourceCard({ resource, workspaceId }: { resource: Resource; workspaceId: string }) {
  const { mutate: deleteResource } = useDeleteResource(workspaceId);

  const getIcon = () => {
    switch (resource.type) {
      case 'GITHUB': return <Github className="w-5 h-5 text-gray-700" />;
      case 'YOUTUBE': return <Youtube className="w-5 h-5 text-red-600" />;
      case 'PDF': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'MARKDOWN': return <FileText className="w-5 h-5 text-gray-500" />;
      default: return <LinkIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <Card className="hover:bg-slate-50 transition-colors group relative overflow-hidden">
      <CardContent className="p-3 flex items-center justify-between">
        <a href={resource.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 flex-1 overflow-hidden">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {resource.title}
            </p>
            {resource.url && (
              <p className="text-xs text-slate-500 truncate">
                {new URL(resource.url).hostname.replace(/^www\./, '')}
              </p>
            )}
          </div>
        </a>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={() => deleteResource({ id: resource.id })}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
          <a href={resource.url || '#'} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-200 rounded-md">
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
