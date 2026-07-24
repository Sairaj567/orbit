import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { 
  useNotes, 
  NoteList, 
  CreateNoteDialog, 
  EditNoteDialog, 
  DeleteNoteDialog 
} from '@/features/notes';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Note, Project } from '@orbit/shared';

export function ProjectNotesPage() {
  const { project, workspaceId } = useOutletContext<{ project: Project; workspaceId: string }>();
  
  const { data: notesData, isLoading } = useNotes(workspaceId, { projectId: project.id });
  const notes = notesData?.data || [];

  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const pinnedNotes = notes.filter((n: Note) => n.isPinned);
  const regularNotes = notes.filter((n: Note) => !n.isPinned);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notes</h2>
        <Button size="sm" onClick={() => setIsCreateNoteOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Note
        </Button>
      </div>

      <CreateNoteDialog
        workspaceId={workspaceId}
        projectId={project.id}
        open={isCreateNoteOpen}
        onOpenChange={setIsCreateNoteOpen}
      />
      <EditNoteDialog
        workspaceId={workspaceId}
        note={noteToEdit}
        open={!!noteToEdit}
        onOpenChange={(open: boolean) => !open && setNoteToEdit(null)}
      />
      <DeleteNoteDialog
        workspaceId={workspaceId}
        note={noteToDelete}
        open={!!noteToDelete}
        onOpenChange={(open: boolean) => !open && setNoteToDelete(null)}
      />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h3 className="mt-4 text-lg font-semibold">No notes yet</h3>
          <p className="mt-2 text-sm text-muted-foreground mb-4">
            Create a note to document decisions, meeting minutes, or project wikis.
          </p>
          <Button onClick={() => setIsCreateNoteOpen(true)}>New Note</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pinned</div>
              <NoteList 
                workspaceId={workspaceId} 
                notes={pinnedNotes} 
                onEditNote={setNoteToEdit}
                onDeleteNote={setNoteToDelete}
              />
            </div>
          )}
          {regularNotes.length > 0 && (
            <div className="space-y-3">
              {pinnedNotes.length > 0 && <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Notes</div>}
              <NoteList 
                workspaceId={workspaceId} 
                notes={regularNotes} 
                onEditNote={setNoteToEdit}
                onDeleteNote={setNoteToDelete}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
