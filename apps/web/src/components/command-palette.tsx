import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Command as CommandPrimitive } from 'cmdk';
import { FileText, Link as LinkIcon, FolderDot, CheckSquare, Search, Clock, User, Flame, LayoutDashboard, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useGlobalSearch, type SearchResult } from '@/hooks/use-global-search';
import { useRecentItems, type RecentItem } from '@/hooks/use-recent-items';
import { useSemanticSearch } from '@/features/ai/hooks/use-ai';
import { cn } from '@/lib/utils';
import { getWorkspacePath } from '@/lib/routes';
import { useWorkspaceContext } from './layout/workspace-context';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { workspace } = useWorkspaceContext();
  const [query, setQuery] = useState('');
  
  const { recentItems, addRecentItem } = useRecentItems();
  const searchResults = useGlobalSearch(workspace.slug, query);
  const { data: semanticResults, isPending: isSemanticSearchPending } = useSemanticSearch(workspace.slug, query);
  
  const hasResults = useMemo(() => {
    return searchResults.projects.length > 0 || 
           searchResults.tasks.length > 0 || 
           (searchResults.habits && searchResults.habits.length > 0) ||
           searchResults.notes.length > 0 || 
           searchResults.resources.length > 0 ||
           (searchResults.members && searchResults.members.length > 0) ||
           (semanticResults && semanticResults.length > 0);
  }, [searchResults, semanticResults]);

  // Handle Cmd+K / Ctrl+K toggle
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  // Reset query on close
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const handleSelect = useCallback((item: SearchResult | RecentItem) => {
    addRecentItem({
      id: item.id,
      type: item.type,
      title: item.title,
      subtitle: item.subtitle,
      path: item.path,
      projectId: item.projectId,
    });
    
    onOpenChange(false);
    navigate(item.path);
  }, [addRecentItem, navigate, onOpenChange]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return <FolderDot className="h-4 w-4 text-blue-500" />;
      case 'task': return <CheckSquare className="h-4 w-4 text-emerald-500" />;
      case 'note': return <FileText className="h-4 w-4 text-amber-500" />;
      case 'habit': return <Flame className="h-4 w-4 text-orange-500" />;
      case 'resource': return <LinkIcon className="h-4 w-4 text-purple-500" />;
      case 'member': return <User className="h-4 w-4 text-orange-500" />;
      default: return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 max-w-2xl border border-border/70 shadow-2xl shadow-black/40 bg-popover/95 backdrop-blur-xl rounded-3xl">
        <CommandPrimitive 
          className="flex h-full w-full flex-col overflow-hidden text-popover-foreground"
          shouldFilter={false} // We handle filtering manually via useGlobalSearch
        >
          <div className="flex items-center border-b border-border/70 px-4">
            <Search className="mr-3 h-5 w-5 text-muted-foreground" />
            <CommandPrimitive.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search tasks, notes, projects..."
              className="flex h-14 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0"
            />
            <div className="hidden sm:flex text-xs text-muted-foreground gap-1 border border-border/70 px-2 py-1 rounded bg-muted/50">
              <span className="font-sans font-medium text-xs">esc</span>
            </div>
          </div>

          <CommandPrimitive.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2">
            {!query && recentItems.length > 0 && (
              <CommandPrimitive.Group heading="Recent" className="px-2 text-xs font-medium text-muted-foreground mb-2 mt-2">
                {recentItems.map((item) => (
                  <CommandItem 
                    key={`recent-${item.id}`} 
                    onSelect={() => handleSelect(item)}
                  >
                    <Clock className="mr-3 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.subtitle && <span className="text-xs text-muted-foreground line-clamp-1">{item.subtitle}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandPrimitive.Group>
            )}

            {!query && recentItems.length === 0 && (
              <div className="py-14 text-center text-sm text-muted-foreground">
                Search for projects, tasks, notes, or resources.
              </div>
            )}

            {!query && (
              <CommandPrimitive.Group heading="Quick Actions" className="px-2 text-xs font-medium text-muted-foreground mb-2 mt-2">
                <CommandItem onSelect={() => { onOpenChange(false); navigate(getWorkspacePath(workspace.slug, 'dashboard')); }}>
                  <LayoutDashboard className="mr-3 h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Go to Dashboard</span>
                </CommandItem>
                <CommandItem onSelect={() => { onOpenChange(false); navigate(getWorkspacePath(workspace.slug, 'analytics')); }}>
                  <TrendingUp className="mr-3 h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">View Analytics</span>
                </CommandItem>
                <CommandItem onSelect={() => { onOpenChange(false); navigate(getWorkspacePath(workspace.slug, 'tasks')); }}>
                  <CheckSquare className="mr-3 h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Today's Tasks</span>
                </CommandItem>
                <CommandItem onSelect={() => { onOpenChange(false); navigate(getWorkspacePath(workspace.slug, 'habits')); }}>
                  <Flame className="mr-3 h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Today's Habits</span>
                </CommandItem>
              </CommandPrimitive.Group>
            )}


            {query && !hasResults && !isSemanticSearchPending && (
              <CommandPrimitive.Empty className="py-14 text-center text-sm text-muted-foreground">
                No matching results found for "{query}".
              </CommandPrimitive.Empty>
            )}

            {query && isSemanticSearchPending && (
              <div className="py-8 flex justify-center items-center text-sm text-muted-foreground">
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                AI is searching...
              </div>
            )}

            {query && semanticResults && semanticResults.length > 0 && (
              <CommandPrimitive.Group heading="Semantic Search (AI)" className="px-2 text-xs font-medium text-purple-600 dark:text-purple-400 mb-2 mt-2">
                {semanticResults.map((item) => {
                  let path = '';
                  if (item.type === 'TASK') path = `/w/${workspace.slug}/tasks/${item.id}`;
                  if (item.type === 'NOTE') path = `/w/${workspace.slug}/notes`;
                  if (item.type === 'RESOURCE') path = `/w/${workspace.slug}/dashboard`;

                  return (
                    <CommandItem 
                      key={`ai-${item.id}`} 
                      onSelect={() => handleSelect({
                        id: item.id,
                        type: item.type.toLowerCase() as SearchResult['type'],
                        title: item.title,
                        subtitle: item.content ? (item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content) : undefined,
                        path,
                      })}
                    >
                      <Flame className="mr-3 h-4 w-4 text-purple-500" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.title}</span>
                        {item.content && <span className="text-xs text-muted-foreground line-clamp-1">{item.content}</span>}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandPrimitive.Group>
            )}

            {query && searchResults.projects.length > 0 && (
              <CommandPrimitive.Group heading="Projects" className="px-2 text-xs font-medium text-muted-foreground mb-2 mt-2">
                {searchResults.projects.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                    {getIcon(item.type)}
                    <span className="ml-3 text-sm font-medium">{item.title}</span>
                  </CommandItem>
                ))}
              </CommandPrimitive.Group>
            )}

            {query && searchResults.tasks.length > 0 && (
              <CommandPrimitive.Group heading="Tasks" className="px-2 text-xs font-medium text-muted-foreground mb-2 mt-2">
                {searchResults.tasks.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                    {getIcon(item.type)}
                    <div className="ml-3 flex flex-col">
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.subtitle && <span className="text-xs text-muted-foreground">{item.subtitle}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandPrimitive.Group>
            )}

            {query && searchResults.habits && searchResults.habits.length > 0 && (
              <CommandPrimitive.Group heading="Habits" className="px-2 text-xs font-medium text-muted-foreground mb-2 mt-2">
                {searchResults.habits.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                    {getIcon(item.type)}
                    <div className="ml-3 flex flex-col">
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.subtitle && <span className="text-xs text-muted-foreground">{item.subtitle}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandPrimitive.Group>
            )}

            {query && searchResults.notes.length > 0 && (
              <CommandPrimitive.Group heading="Notes" className="px-2 text-xs font-medium text-muted-foreground mb-2 mt-2">
                {searchResults.notes.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                    {getIcon(item.type)}
                    <div className="ml-3 flex flex-col">
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.subtitle && <span className="text-xs text-muted-foreground line-clamp-1">{item.subtitle}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandPrimitive.Group>
            )}

            {query && searchResults.resources.length > 0 && (
              <CommandPrimitive.Group heading="Resources" className="px-2 text-xs font-medium text-muted-foreground mb-2 mt-2">
                {searchResults.resources.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                    {getIcon(item.type)}
                    <div className="ml-3 flex flex-col">
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.subtitle && <span className="text-xs text-muted-foreground line-clamp-1">{item.subtitle}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandPrimitive.Group>
            )}

            {query && searchResults.members && searchResults.members.length > 0 && (
              <CommandPrimitive.Group heading="Members" className="px-2 text-xs font-medium text-muted-foreground mb-2 mt-2">
                {searchResults.members.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                    {getIcon(item.type)}
                    <div className="ml-3 flex flex-col">
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.subtitle && <span className="text-xs text-muted-foreground line-clamp-1">{item.subtitle}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandPrimitive.Group>
            )}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for standardizing command item UI
function CommandItem({ 
  children, 
  onSelect 
}: { 
  children: React.ReactNode, 
  onSelect: () => void 
}) {
  return (
    <CommandPrimitive.Item
      onSelect={onSelect}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-2xl px-3 py-2.5 outline-none transition-colors",
        "aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        "hover:bg-accent hover:text-accent-foreground mt-1"
      )}
    >
      {children}
      <div className="ml-auto hidden aria-selected:block text-xs text-muted-foreground">
        Jump
      </div>
    </CommandPrimitive.Item>
  );
}
