import { formatDistanceToNow } from 'date-fns';
import { Pin, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { Note } from '@orbit/shared';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (note: Note) => void;
  onTogglePin?: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  // Strip markdown formatting for a clean preview snippet
  const cleanContent = note.content.replace(/[#*`_[\]()>-]/g, '').slice(0, 150) + (note.content.length > 150 ? '...' : '');

  return (
    <div className="group relative flex flex-col justify-between p-4 bg-card rounded-xl border border-border shadow-sm hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
      {note.isPinned && (
        <div className="absolute -top-2 -right-2 bg-primary/20 text-primary p-1 rounded-full">
          <Pin className="h-3 w-3" />
        </div>
      )}
      
      <div className="flex justify-between items-start mb-2" onClick={() => onEdit?.(note)}>
        <h4 className="font-medium text-foreground line-clamp-1 flex-1">{note.title}</h4>
        
        <div className="ml-2" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onTogglePin?.(note)}>
                {note.isPinned ? 'Unpin Note' : 'Pin Note'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(note)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(note)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground line-clamp-3 mb-4" onClick={() => onEdit?.(note)}>
        {cleanContent || <span className="italic opacity-50">No content</span>}
      </div>
      
      <div className="text-xs text-muted-foreground/60 flex justify-between items-center" onClick={() => onEdit?.(note)}>
        <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
      </div>
    </div>
  );
}
