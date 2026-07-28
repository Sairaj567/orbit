import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  ExternalLink,
  Trash2,
  Github,
  Youtube,
  FileText,
  Link as LinkIcon,
  Edit2,
} from 'lucide-react';
import type { Resource } from '@orbit/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDeleteResource, useUpdateResource } from '../hooks/use-resources';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ResourceCard({
  resource,
  workspaceId,
}: {
  resource: Resource;
  workspaceId: string;
}) {
  const { mutate: deleteResource, isPending: isDeleting } = useDeleteResource(workspaceId);
  const { mutate: updateResource, isPending: isUpdating } = useUpdateResource(workspaceId);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(resource.title || '');

  const getIcon = () => {
    switch (resource.type) {
      case 'GITHUB':
        return <Github className="w-5 h-5 text-gray-700" />;
      case 'YOUTUBE':
        return <Youtube className="w-5 h-5 text-red-600" />;
      case 'PDF':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'MARKDOWN':
        return <FileText className="w-5 h-5 text-gray-500" />;
      default:
        return <LinkIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const safeHostname = () => {
    if (!resource.url) return '';
    try {
      return new URL(resource.url).hostname.replace(/^www\./, '');
    } catch {
      return resource.url;
    }
  };

  const handleEditSave = () => {
    updateResource(
      { id: resource.id, data: { title: editTitle } },
      {
        onSuccess: () => setEditOpen(false),
      },
    );
  };

  const handleDelete = () => {
    deleteResource(
      { id: resource.id },
      {
        onSuccess: () => setDeleteOpen(false),
      },
    );
  };

  return (
    <>
      <Card className="hover:bg-slate-50 transition-colors group relative overflow-hidden">
        <CardContent className="p-3 flex items-center justify-between">
          <a
            href={resource.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 flex-1 overflow-hidden"
          >
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{resource.title}</p>
              {resource.url && <p className="text-xs text-slate-500 truncate">{safeHostname()}</p>}
            </div>
          </a>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
              <Edit2 className="w-4 h-4 text-slate-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
            <a
              href={resource.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-slate-200 rounded-md"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Resource Title"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={isUpdating}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the resource link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
