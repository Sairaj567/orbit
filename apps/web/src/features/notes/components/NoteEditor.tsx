import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit2, Eye } from 'lucide-react';
import { ProjectSelector } from '@/features/projects/components/project-selector';

interface NoteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialProjectId?: string;
  onSave: (title: string, content: string, projectId: string) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function NoteEditor({
  initialTitle = '',
  initialContent = '',
  initialProjectId = '',
  onSave,
  onCancel,
  isSaving,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [projectId, setProjectId] = useState(initialProjectId);

  const handleSave = () => {
    if (title.trim() && projectId) {
      onSave(title, content, projectId);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="text-lg font-semibold border-none focus-visible:ring-0 bg-transparent px-0 h-10 flex-1"
          autoFocus
        />
        <div className="w-64">
          <ProjectSelector value={projectId} onChange={setProjectId} label="" />
        </div>
      </div>

      <Tabs defaultValue="edit" className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <TabsList className="h-8">
            <TabsTrigger value="edit" className="text-xs px-3 h-6">
              <Edit2 className="w-3 h-3 mr-1" /> Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs px-3 h-6">
              <Eye className="w-3 h-3 mr-1" /> Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit" className="flex-1 mt-0">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write using Markdown..."
            className="h-full min-h-[300px] resize-none border-0 bg-muted/20 focus-visible:ring-0 p-4 font-mono text-sm"
          />
        </TabsContent>

        <TabsContent
          value="preview"
          className="flex-1 mt-0 bg-card rounded-md border p-6 overflow-y-auto min-h-[300px]"
        >
          {content ? (
            <article className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </article>
          ) : (
            <p className="text-muted-foreground text-sm italic">Nothing to preview</p>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!title.trim() || !projectId || isSaving}>
          {isSaving ? 'Saving...' : 'Save Note'}
        </Button>
      </div>
    </div>
  );
}
