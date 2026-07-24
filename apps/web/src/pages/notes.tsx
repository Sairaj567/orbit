import { useState } from 'react';
import { NotebookPen, Plus, Search, Pin, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/layout/empty-state';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { useNotes } from '@/features/notes/hooks/use-notes';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { NoteList } from '@/features/notes/components/NoteList';
import { CreateNoteDialog } from '@/features/notes/components/CreateNoteDialog';
import { EditNoteDialog } from '@/features/notes/components/EditNoteDialog';
import { DeleteNoteDialog } from '@/features/notes/components/DeleteNoteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { Note } from '@orbit/shared';

export function NotesPage() {
  const { workspace } = useWorkspaceContext();
  const { data: projectsData } = useProjects(workspace.slug);
  const projects = projectsData?.data || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  const { data: notesData, isLoading } = useNotes(workspace.slug);

  const rawNotes = notesData?.data || [];
  const notes = searchQuery
    ? rawNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rawNotes;

  const defaultProjectId = projects.length > 0 ? (projects[0]?.id || '') : '';

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const unpinnedNotes = notes.filter((n) => !n.isPinned);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        description="Structured notes, documentation, and ideas across your workspace."
        actions={
          <Button onClick={() => setCreateOpen(true)} disabled={!defaultProjectId}>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<NotebookPen className="h-6 w-6" aria-hidden="true" />}
          title="No notes found"
          description={searchQuery ? 'No notes match your search query.' : 'Create your first note to capture ideas, meeting minutes, or specs.'}
          action={
            defaultProjectId && !searchQuery ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-8">
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <Pin className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                <span>Pinned Notes ({pinnedNotes.length})</span>
              </div>
              <NoteList
                notes={pinnedNotes}
                workspaceId={workspace.slug}
                onEditNote={setEditingNote}
                onDeleteNote={setDeletingNote}
              />
            </div>
          )}

          {unpinnedNotes.length > 0 && (
            <div className="space-y-3">
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>Other Notes ({unpinnedNotes.length})</span>
                </div>
              )}
              <NoteList
                notes={unpinnedNotes}
                workspaceId={workspace.slug}
                onEditNote={setEditingNote}
                onDeleteNote={setDeletingNote}
              />
            </div>
          )}
        </div>
      )}

      {defaultProjectId && (
        <CreateNoteDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          workspaceId={workspace.slug}
          projectId={defaultProjectId}
        />
      )}

      {editingNote && (
        <EditNoteDialog
          note={editingNote}
          open={!!editingNote}
          onOpenChange={(open) => !open && setEditingNote(null)}
          workspaceId={workspace.slug}
        />
      )}

      {deletingNote && (
        <DeleteNoteDialog
          note={deletingNote}
          open={!!deletingNote}
          onOpenChange={(open) => !open && setDeletingNote(null)}
          workspaceId={workspace.slug}
        />
      )}
    </div>
  );
}
