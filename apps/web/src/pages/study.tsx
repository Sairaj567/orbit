import { useState, useEffect } from 'react';
import { TimerReset, Play, Square, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { useProjects } from '@/features/projects/hooks/use-projects';
import {
  useActiveStudyBlock,
  useCreateStudyBlock,
  useCompleteStudyBlock,
  useCancelStudyBlock,
  useStudyBlocksHistory,
} from '@/features/study-blocks/hooks/use-study-blocks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function StudyPage() {
  const { workspace } = useWorkspaceContext();
  const { data: projectsData } = useProjects(workspace.slug);
  const projects = projectsData?.data || [];

  const { data: activeBlock, isLoading: activeLoading } = useActiveStudyBlock();
  const createStudyBlock = useCreateStudyBlock();
  const completeStudyBlock = useCompleteStudyBlock();
  const cancelStudyBlock = useCancelStudyBlock();

  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [notesText, setNotesText] = useState<string>('');

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const { data: history } = useStudyBlocksHistory();

  useEffect(() => {
    if (!activeBlock) return;
    const startedAt = new Date(activeBlock.startedAt).getTime();
    const updateTimer = () => {
      const diff = Math.floor((Date.now() - startedAt) / 1000);
      setElapsedSeconds(Math.max(0, diff));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeBlock]);

  const handleStartSession = () => {
    const targetProject = selectedProjectId || (projects.length > 0 ? projects[0]?.id : undefined);
    if (!targetProject) return;

    createStudyBlock.mutate({
      projectId: targetProject,
      plannedDuration: selectedDuration,
    });
  };

  const handleCompleteSession = () => {
    if (!activeBlock) return;
    completeStudyBlock.mutate({
      id: activeBlock.id,
      data: {
        actualDuration: Math.floor(elapsedSeconds / 60) || 1,
        notes: notesText.trim() || undefined,
      },
    });
  };

  const handleCancelSession = () => {
    if (!activeBlock) return;
    cancelStudyBlock.mutate(activeBlock.id);
  };

  const plannedSeconds = (activeBlock?.plannedDuration || selectedDuration) * 60;
  const remainingSeconds = Math.max(0, plannedSeconds - elapsedSeconds);
  const displayMinutes = Math.floor((activeBlock ? remainingSeconds : selectedDuration * 60) / 60);
  const displaySecs = (activeBlock ? remainingSeconds : 0) % 60;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Mode"
        description="Deep focus sessions, Pomodoro timers, and distraction-free study blocks."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer Display Card */}
        <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TimerReset className="w-5 h-5 text-primary" />
              Focus Timer
            </CardTitle>
            <CardDescription>
              Select a duration, associate a project, and enter your flow state.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 flex flex-col items-center justify-center p-8">
            {/* Big Countdown Timer */}
            <div className="flex flex-col items-center justify-center my-4">
              <span className="text-7xl md:text-8xl font-extrabold tracking-tight tabular-nums text-foreground">
                {String(displayMinutes).padStart(2, '0')}:{String(displaySecs).padStart(2, '0')}
              </span>
              <p className="text-sm font-medium text-muted-foreground mt-2">
                {activeBlock ? 'Active Focus Session' : 'Ready to Start'}
              </p>
            </div>

            {/* Presets if not active */}
            {!activeBlock && (
              <div className="space-y-4 w-full max-w-md">
                <div className="flex justify-center gap-2">
                  {[15, 25, 45, 60].map((mins) => (
                    <Button
                      key={mins}
                      variant={selectedDuration === mins ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDuration(mins)}
                    >
                      {mins} min
                    </Button>
                  ))}
                </div>

                {projects.length > 0 && (
                  <div className="space-y-2">
                    <label
                      htmlFor="study-project"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Select Project
                    </label>
                    <select
                      id="study-project"
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Session Notes input */}
            <div className="w-full max-w-md space-y-2">
              <Input
                placeholder="What are you focusing on?"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="bg-background/80 text-center"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
              {!activeBlock ? (
                <Button
                  size="lg"
                  className="px-8 font-semibold shadow-lg text-base"
                  onClick={handleStartSession}
                  disabled={createStudyBlock.isPending || activeLoading}
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Start Focus Session
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={handleCancelSession}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    className="px-6 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleCompleteSession}
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Complete Block
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Study Tips & Overview Sidebar */}
        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Pomodoro Technique
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                • <strong>25 min focus</strong>: Eliminates distractions and boosts mental
                sharpness.
              </p>
              <p>
                • <strong>5 min break</strong>: Step away, stretch, and hydrate after each block.
              </p>
              <p>
                • <strong>XP Boost</strong>: Completing study sessions awards productivity XP!
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Focus Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Target Session</span>
                <span className="font-semibold">{selectedDuration} Mins</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {activeBlock ? 'In Progress' : 'Idle'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History Section */}
      <div className="pt-6">
        <h3 className="text-xl font-bold tracking-tight mb-4">Recent Sessions</h3>
        {!history || history.length === 0 ? (
          <div className="text-muted-foreground bg-zinc-50 dark:bg-zinc-900 rounded-xl p-8 text-center border border-dashed border-border/70">
            No focus sessions recorded yet. Start one above!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {history.map((block) => (
              <Card key={block.id} className="bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>{block.project?.name || 'No Project'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(block.startedAt).toLocaleDateString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold">
                      {block.actualDuration || block.plannedDuration} / {block.plannedDuration} min
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={`font-semibold ${block.status === 'COMPLETED' ? 'text-emerald-500' : 'text-red-500'}`}
                    >
                      {block.status}
                    </span>
                  </div>
                  {block.notes && (
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md mt-2">
                      {block.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
