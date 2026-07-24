import type { Note } from '@orbit/shared';
import { NoteCard } from './NoteCard';
import { useUpdateNote } from '../hooks/use-notes';

interface NoteListProps {
  notes: Note[];
  workspaceId: string;
  onEditNote?: (note: Note) => void;
  onDeleteNote?: (note: Note) => void;
}

export function NoteList({ notes, workspaceId, onEditNote, onDeleteNote }: NoteListProps) {
  const { mutate: updateNote } = useUpdateNote(workspaceId);

  const handleTogglePin = (note: Note) => {
    updateNote({
      id: note.id,
      data: { isPinned: !note.isPinned }
    });
  };

  if (!notes.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <NoteCard 
          key={note.id} 
          note={note} 
          onEdit={onEditNote}
          onDelete={onDeleteNote}
          onTogglePin={handleTogglePin}
        />
      ))}
    </div>
  );
}
