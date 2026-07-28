import { useState } from 'react';
import { useCategories } from '../hooks/use-categories';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryList() {
  const { workspace } = useWorkspaceContext();
  const { categories, isLoading, createCategory, deleteCategory } = useCategories(workspace.slug);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreate = () => {
    if (!newCategoryName.trim()) return;
    createCategory(
      { name: newCategoryName.trim(), color: null },
      {
        onSuccess: () => setNewCategoryName(''),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Task Categories</h3>
          <p className="text-xs text-muted-foreground">Create categories to organize tasks.</p>
        </div>
      </div>

      <div className="flex space-x-2">
        <Input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New category name"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCreate();
            }
          }}
          className="max-w-xs"
        />
        <Button onClick={handleCreate} disabled={!newCategoryName.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <div className="space-y-2 mt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full max-w-md" />
            <Skeleton className="h-12 w-full max-w-md" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">No categories yet.</div>
        ) : (
          categories.map((category: any) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-card max-w-md"
            >
              <span className="text-sm font-medium">{category.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteCategory(category.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
