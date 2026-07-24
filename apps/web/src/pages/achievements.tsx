import { Trophy, Award, CheckCircle2, Lock } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AchievementsPage() {
  // Gamification state calculation
  const currentLevel = 4;
  const currentXP = 750;
  const nextLevelXP = 1000;
  const progressPercent = Math.round((currentXP / nextLevelXP) * 100);

  const achievements = [
    {
      id: 'task-novice',
      title: 'Task Crusher I',
      description: 'Complete your first 5 tasks in Orbit.',
      icon: '🎯',
      unlocked: true,
      unlockedAt: '2 days ago',
      category: 'Tasks',
      xpReward: 50,
    },
    {
      id: 'focus-apprentice',
      title: 'Focus Pioneer',
      description: 'Complete 2 deep work study sessions.',
      icon: '⏱️',
      unlocked: true,
      unlockedAt: 'Yesterday',
      category: 'Study',
      xpReward: 100,
    },
    {
      id: 'habit-architect',
      title: 'Streak Architect',
      description: 'Maintain a 3-day habit check-in streak.',
      icon: '🔥',
      unlocked: true,
      unlockedAt: 'Today',
      category: 'Habits',
      xpReward: 150,
    },
    {
      id: 'knowledge-vault',
      title: 'Knowledge Curator',
      description: 'Create and pin 5 structured notes.',
      icon: '📝',
      unlocked: true,
      unlockedAt: 'Today',
      category: 'Notes',
      xpReward: 100,
    },
    {
      id: 'focus-master',
      title: 'Deep Work Master',
      description: 'Log over 10 hours of study blocks.',
      icon: '🧘',
      unlocked: false,
      progress: '4.5 / 10 Hours',
      category: 'Study',
      xpReward: 300,
    },
    {
      id: 'sprint-champion',
      title: 'Productivity Legend',
      description: 'Reach a Productivity Score above 90.',
      icon: '⚡',
      unlocked: false,
      progress: 'Score: 85 / 90',
      category: 'Analytics',
      xpReward: 500,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Achievements & Badges"
        description="Level up your productivity, unlock trophies, and earn XP milestones."
      />

      {/* Level & XP Progress Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-amber-500/10 via-primary/10 to-indigo-500/10 shadow-sm overflow-hidden">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-white font-extrabold text-3xl shadow-lg ring-4 ring-amber-500/20">
              <Trophy className="w-10 h-10 text-white" />
              <div className="absolute -bottom-2 -right-2 bg-zinc-900 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold border border-amber-400/50">
                Lvl {currentLevel}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black tracking-tight text-foreground">Level {currentLevel} Scholar</h3>
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
                  Pro Rank
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                You need <strong>{nextLevelXP - currentXP} XP</strong> to unlock Level {currentLevel + 1}
              </p>
            </div>
          </div>

          <div className="w-full md:w-72 space-y-2">
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>{currentXP} XP</span>
              <span>{nextLevelXP} XP</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-muted" />
            <p className="text-right text-[11px] font-semibold text-primary">{progressPercent}% Progress</p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Matrix */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Workspace Milestones ({achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <Card
              key={ach.id}
              className={cn(
                'border transition-all relative overflow-hidden',
                ach.unlocked
                  ? 'border-amber-500/30 bg-card shadow-sm'
                  : 'border-border bg-muted/20 opacity-70'
              )}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border',
                    ach.unlocked
                      ? 'bg-amber-500/15 border-amber-500/30'
                      : 'bg-muted border-border text-muted-foreground'
                  )}
                >
                  {ach.unlocked ? ach.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">{ach.title}</h4>
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      +{ach.xpReward} XP
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{ach.description}</p>
                  
                  <div className="pt-2 flex items-center justify-between text-[11px]">
                    {ach.unlocked ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Unlocked {ach.unlockedAt}
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-medium">{ach.progress}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}