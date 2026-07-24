import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ResourceCard } from './resource-card';
import { useCreateResource } from '../hooks/use-resources';
import type { Resource } from '@orbit/shared';

export function ResourcePasteInput({ workspaceId, taskId, projectId }: { workspaceId: string; taskId?: string; projectId?: string }) {
  const [url, setUrl] = useState('');
  const { mutate: createResource, isPending } = useCreateResource(workspaceId);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;  
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedUrl = e.clipboardData.getData('text');
    if (isValidUrl(pastedUrl)) {
      e.preventDefault();
      createResource({ url: pastedUrl, taskId, projectId }, {
        onSuccess: () => setUrl('')
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValidUrl(url)) {
      e.preventDefault();
      createResource({ url, taskId, projectId }, {
        onSuccess: () => setUrl('')
      });
    }
  };

  return (
    <Input 
      placeholder="Paste a URL and press Enter..." 
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      disabled={isPending}
    />
  );
}

export function ResourceList({ workspaceId, taskId, resources = [] }: { workspaceId: string; taskId?: string; resources?: Resource[] }) {
  return (
    <div className="space-y-4 mt-8 pt-6 border-t border-slate-200">
      <h3 className="text-sm font-medium text-slate-900">Resources</h3>
      
      <div className="flex items-center space-x-2">
        <ResourcePasteInput workspaceId={workspaceId} taskId={taskId} />
      </div>

      {resources.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} workspaceId={workspaceId} />
          ))}
        </div>
      )}
    </div>
  );
}
